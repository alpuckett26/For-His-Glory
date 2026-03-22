import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sql } from '@/lib/db'

async function requireAdmin() {
  const session = await auth()
  return session?.user && ['admin', 'super_admin'].includes(session.user.role ?? '') ? session : null
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const collections = await sql`SELECT * FROM collections ORDER BY sort_order, name`
  return NextResponse.json(collections)
}

export async function POST(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const rows = await sql`
    INSERT INTO collections (name, slug, description, image_url, featured, active, sort_order)
    VALUES (${body.name}, ${body.slug}, ${body.description ?? null}, ${body.image_url ?? null},
      ${body.featured ?? false}, ${body.active ?? true}, ${body.sort_order ?? 0})
    RETURNING *
  `
  return NextResponse.json(rows[0])
}

export async function PATCH(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { id, ...fields } = body
  await sql`
    UPDATE collections SET
      name = ${fields.name}, slug = ${fields.slug}, description = ${fields.description ?? null},
      image_url = ${fields.image_url ?? null}, featured = ${fields.featured ?? false},
      active = ${fields.active ?? true}, sort_order = ${fields.sort_order ?? 0}, updated_at = NOW()
    WHERE id = ${id}
  `
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  await sql`DELETE FROM collections WHERE id = ${id}`
  return NextResponse.json({ success: true })
}
