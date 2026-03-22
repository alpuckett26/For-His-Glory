import { NextRequest, NextResponse } from 'next/server'

const PRINTFUL_BASE = 'https://api.printful.com'
const PRODUCT_ID = 71 // Bella+Canvas 3001 Unisex T-Shirt

// Our color values → Printful color names
const COLOR_NAME_MAP: Record<string, string> = {
  black: 'Black',
  white: 'White',
  charcoal: 'Dark Grey Heather',
  olive: 'Olive',
  navy: 'Navy',
}

async function printfulFetch(path: string, options?: RequestInit) {
  return fetch(`${PRINTFUL_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  })
}

async function getVariantId(colorValue: string): Promise<number | null> {
  const colorName = COLOR_NAME_MAP[colorValue]
  if (!colorName) return null

  const res = await printfulFetch(`/products/${PRODUCT_ID}`)
  if (!res.ok) {
    console.error('Printful product fetch failed:', res.status, await res.text())
    return null
  }

  const data = await res.json()
  const variants: Array<{ id: number; color: string; size: string }> =
    data.result?.variants ?? []

  // Log available colors on first lookup to help diagnose mismatches
  const availableColors = [...new Set(variants.map((v) => v.color))]
  console.log('Printful available colors:', availableColors)
  console.log('Looking for color:', colorName)

  // Case-insensitive match; prefer M size but fall back to any size
  const match = (v: { color: string; size: string }) =>
    v.color?.toLowerCase() === colorName.toLowerCase()

  const variant =
    variants.find((v) => match(v) && v.size === 'M') ??
    variants.find((v) => match(v))

  if (!variant) {
    console.error(`No variant for color "${colorName}". Available: ${availableColors.join(', ')}`)
  }

  return variant?.id ?? null
}

export async function POST(req: NextRequest) {
  const { designUrl, color } = await req.json()

  if (!designUrl || !color) {
    return NextResponse.json(
      { error: 'designUrl and color required' },
      { status: 400 }
    )
  }

  try {
    const variantId = await getVariantId(color)
    if (!variantId) {
      return NextResponse.json(
        { error: `No Printful variant found for color: ${color}` },
        { status: 400 }
      )
    }

    // Build print files — logo always on front left breast, custom design on back
    const files: Array<{ type: string; url: string }> = [
      { type: 'back', url: designUrl },
    ]
    if (process.env.BRAND_LOGO_URL) {
      files.push({ type: 'front', url: process.env.BRAND_LOGO_URL })
    }

    // Create mockup generation task
    const taskRes = await printfulFetch(
      `/mockup-generator/create-task/${PRODUCT_ID}`,
      {
        method: 'POST',
        body: JSON.stringify({
          variant_ids: [variantId],
          files,
        }),
      }
    )

    if (!taskRes.ok) {
      const err = await taskRes.json()
      throw new Error(err.error?.message ?? 'Mockup task creation failed')
    }

    const taskData = await taskRes.json()
    const taskKey = taskData.result?.task_key
    if (!taskKey) throw new Error('No task key returned from Printful')

    // Poll for result — Printful usually takes 5–20 seconds
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 2000))

      const resultRes = await printfulFetch(
        `/mockup-generator/task?task_key=${taskKey}`
      )
      const result = await resultRes.json()
      const status = result.result?.status

      if (status === 'completed') {
        const mockups: Array<{ placement: string; mockup_url: string }> =
          result.result.mockups ?? []
        const backMockup = mockups.find((m) => m.placement === 'back') ?? mockups[0]
        const frontMockup = mockups.find((m) => m.placement === 'front')
        if (!backMockup?.mockup_url) throw new Error('No mockup URL in completed task')
        return NextResponse.json({
          mockupUrl: backMockup.mockup_url,
          frontMockupUrl: frontMockup?.mockup_url ?? null,
        })
      }

      if (status === 'failed') {
        throw new Error('Printful mockup generation failed')
      }
    }

    return NextResponse.json(
      { error: 'Mockup generation timed out' },
      { status: 408 }
    )
  } catch (err) {
    console.error('Mockup generation error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to generate mockup' },
      { status: 500 }
    )
  }
}
