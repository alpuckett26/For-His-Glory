import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sql } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const admins = await sql`
    SELECT id, email, full_name, role, created_at
    FROM users
    WHERE role IN ('admin', 'super_admin')
    ORDER BY created_at
  `
  return NextResponse.json({ admins, currentRole: session.user.role })
}
