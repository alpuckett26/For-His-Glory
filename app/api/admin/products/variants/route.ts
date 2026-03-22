import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sql } from '@/lib/db'

async function requireAdmin() {
  const session = await auth()
  return session?.user && ['admin', 'super_admin'].includes(session.user.role ?? '') ? session : null
}

export async function POST(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const rows = await sql`
    INSERT INTO product_variants (product_id, size, color, color_hex, sku, price, active)
    VALUES (${body.product_id}, ${body.size ?? null}, ${body.color ?? null},
      ${body.color_hex ?? null}, ${body.sku ?? null}, ${body.price ?? null}, ${body.active ?? true})
    RETURNING *
  `
  return NextResponse.json(rows[0])
}

export async function DELETE(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  await sql`DELETE FROM product_variants WHERE id = ${id}`
  return NextResponse.json({ success: true })
}
