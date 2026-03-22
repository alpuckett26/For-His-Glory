import { NextResponse } from 'next/server'

export async function GET() {
  const res = await fetch('https://api.printful.com/products/71', {
    headers: {
      Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
    },
  })

  if (!res.ok) {
    return NextResponse.json({ error: `Printful returned ${res.status}`, body: await res.text() })
  }

  const data = await res.json()
  const variants = data.result?.variants ?? []

  const colors = [...new Set(variants.map((v: { color: string }) => v.color))].sort()
  const sample = variants.slice(0, 5)

  return NextResponse.json({ colors, totalVariants: variants.length, sample })
}
