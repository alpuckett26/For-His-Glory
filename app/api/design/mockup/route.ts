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
  if (!res.ok) return null

  const data = await res.json()
  const variants: Array<{ id: number; color: string; size: string }> =
    data.result?.variants ?? []

  // Pick M size for this color — any size produces the same front mockup
  const variant = variants.find((v) => v.color === colorName && v.size === 'M')
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

    // Create mockup generation task
    const taskRes = await printfulFetch(
      `/mockup-generator/create-task/${PRODUCT_ID}`,
      {
        method: 'POST',
        body: JSON.stringify({
          variant_ids: [variantId],
          files: [{ type: 'front', url: designUrl }],
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
        const mockupUrl = result.result.mockups?.[0]?.mockup_url
        if (!mockupUrl) throw new Error('No mockup URL in completed task')
        return NextResponse.json({ mockupUrl })
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
