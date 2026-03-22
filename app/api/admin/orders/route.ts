import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sql } from '@/lib/db'

async function requireAdmin() {
  const session = await auth()
  return session?.user && ['admin', 'super_admin'].includes(session.user.role ?? '') ? session : null
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const orders = await sql`
    SELECT o.*,
      json_agg(DISTINCT jsonb_build_object(
        'id', oi.id, 'title', oi.title, 'size', oi.size, 'color', oi.color,
        'quantity', oi.quantity, 'unit_price', oi.unit_price
      )) FILTER (WHERE oi.id IS NOT NULL) AS items,
      json_agg(DISTINCT jsonb_build_object(
        'id', so.id, 'status', so.status, 'tracking_number', so.tracking_number,
        'tracking_url', so.tracking_url, 'error_message', so.error_message
      )) FILTER (WHERE so.id IS NOT NULL) AS supplier_orders
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN supplier_orders so ON so.order_id = o.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `
  return NextResponse.json(orders)
}

export async function PATCH(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status } = await request.json()
  await sql`UPDATE orders SET status = ${status}, updated_at = NOW() WHERE id = ${id}`
  return NextResponse.json({ success: true })
}
