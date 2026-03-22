import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sql } from '@/lib/db'

async function requireAdmin() {
  const session = await auth()
  return session?.user && ['admin', 'super_admin'].includes(session.user.role ?? '') ? session : null
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const inquiries = await sql`SELECT * FROM bulk_inquiries ORDER BY created_at DESC`
  return NextResponse.json(inquiries)
}

export async function PATCH(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status } = await request.json()
  await sql`UPDATE bulk_inquiries SET status = ${status}, updated_at = NOW() WHERE id = ${id}`
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  await sql`DELETE FROM bulk_inquiries WHERE id = ${id}`
  return NextResponse.json({ success: true })
}
