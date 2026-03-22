import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sql } from '@/lib/db'

async function requireAdmin() {
  const session = await auth()
  return session?.user && ['admin', 'super_admin'].includes(session.user.role ?? '')
    ? session : null
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const products = await sql`
    SELECT p.*, c.name AS collection_name,
      json_agg(DISTINCT pi.*) FILTER (WHERE pi.id IS NOT NULL) AS images,
      json_agg(DISTINCT pv.*) FILTER (WHERE pv.id IS NOT NULL) AS variants
    FROM products p
    LEFT JOIN collections c ON c.id = p.collection_id
    LEFT JOIN product_images pi ON pi.product_id = p.id
    LEFT JOIN product_variants pv ON pv.product_id = p.id
    GROUP BY p.id, c.name
    ORDER BY p.created_at DESC
  `
  return NextResponse.json(products)
}

export async function POST(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const rows = await sql`
    INSERT INTO products (title, slug, description, long_description, brand_message, price, compare_at_price, collection_id, featured, active, tags)
    VALUES (${body.title}, ${body.slug}, ${body.description ?? null}, ${body.long_description ?? null},
      ${body.brand_message ?? null}, ${body.price}, ${body.compare_at_price ?? null},
      ${body.collection_id ?? null}, ${body.featured ?? false}, ${body.active ?? true},
      ${body.tags ? JSON.stringify(body.tags) : null})
    RETURNING *
  `
  return NextResponse.json(rows[0])
}

export async function PATCH(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { id, ...fields } = body
  await sql`
    UPDATE products SET
      title = ${fields.title}, slug = ${fields.slug}, description = ${fields.description ?? null},
      long_description = ${fields.long_description ?? null}, brand_message = ${fields.brand_message ?? null},
      price = ${fields.price}, compare_at_price = ${fields.compare_at_price ?? null},
      collection_id = ${fields.collection_id ?? null}, featured = ${fields.featured ?? false},
      active = ${fields.active ?? true}, tags = ${fields.tags ? JSON.stringify(fields.tags) : null},
      updated_at = NOW()
    WHERE id = ${id}
  `
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  await sql`DELETE FROM products WHERE id = ${id}`
  return NextResponse.json({ success: true })
}
