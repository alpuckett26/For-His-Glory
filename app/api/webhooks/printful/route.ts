import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

interface PrintfulWebhookEvent {
  type: string
  data: {
    order?: { id: number; external_id: string; status: string }
    shipment?: { tracking_number: string; tracking_url: string; service: string }
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json() as PrintfulWebhookEvent

  await sql`
    INSERT INTO webhook_logs (source, event_type, payload, processed)
    VALUES ('printful', ${body.type}, ${JSON.stringify(body)}, false)
  `

  processEvent(body).catch(console.error)

  return NextResponse.json({ received: true })
}

async function processEvent(event: PrintfulWebhookEvent) {
  const supplierOrderId = String(event.data.order?.id ?? '')

  switch (event.type) {
    case 'package_shipped': {
      if (supplierOrderId) {
        const rows = await sql`
          UPDATE supplier_orders SET
            status = 'shipped',
            tracking_number = ${event.data.shipment?.tracking_number ?? null},
            tracking_url = ${event.data.shipment?.tracking_url ?? null},
            updated_at = NOW()
          WHERE supplier_order_id = ${supplierOrderId}
          RETURNING order_id
        `
        if (rows[0]?.order_id) {
          await sql`UPDATE orders SET status = 'shipped' WHERE id = ${rows[0].order_id}`
        }
      }
      break
    }

    case 'order_failed': {
      if (supplierOrderId) {
        await sql`
          UPDATE supplier_orders SET
            status = 'failed',
            error_message = ${`Printful order failed: ${event.data.order?.status}`},
            last_attempted_at = NOW()
          WHERE supplier_order_id = ${supplierOrderId}
        `
      }
      break
    }

    case 'order_updated': {
      if (supplierOrderId && event.data.order?.status) {
        await sql`
          UPDATE supplier_orders SET
            status = ${event.data.order.status.toLowerCase()},
            updated_at = NOW()
          WHERE supplier_order_id = ${supplierOrderId}
        `
      }
      break
    }

    default:
      console.log(`Unhandled Printful event: ${event.type}`)
  }

  await sql`
    UPDATE webhook_logs SET processed = true
    WHERE source = 'printful' AND event_type = ${event.type}
  `
}
