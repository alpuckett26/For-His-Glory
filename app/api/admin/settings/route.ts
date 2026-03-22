import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sql } from '@/lib/db'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || !['admin', 'super_admin'].includes(session.user.role ?? '')) {
    return null
  }
  return session
}

export async function GET() {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const rows = await sql`SELECT key, value FROM site_settings`
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await request.json() as { key: string; value: string }[]
  for (const { key, value } of body) {
    await sql`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES (${key}, ${JSON.stringify(value)}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `
  }
  return NextResponse.json({ success: true })
}
