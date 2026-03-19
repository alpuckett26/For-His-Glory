import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

interface PrintfulWebhookEvent {
  type: string
  data: {
    order?: {
      id: number
      external_id: string
      status: string
    }
    shipment?: {
      tracking_number: string
      tracking_url: string
      service: string
    }
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json() as PrintfulWebhookEvent
  const supabase = await createServiceClient()

  // Log the webhook
  await supabase.from('webhook_logs').insert({
    source: 'printful',
    event_type: body.type,
    payload: body as unknown as Record<string, unknown>,
    processed: false,
  })

  // Process async
  processEvent(body, supabase).catch(console.error)

  return NextResponse.json({ received: true })
}

async function processEvent(event: PrintfulWebhookEvent, supabase: Awaited<ReturnType<typeof createServiceClient>>) {
  const supplierOrderId = String(event.data.order?.id ?? '')

  switch (event.type) {
    case 'package_shipped': {
      const trackingNumber = event.data.shipment?.tracking_number
      const trackingUrl = event.data.shipment?.tracking_url

      if (supplierOrderId) {
        // Update supplier order
        const { data: supplierOrder } = await supabase
          .from('supplier_orders')
          .update({
            status: 'shipped',
            tracking_number: trackingNumber,
            tracking_url: trackingUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('supplier_order_id', supplierOrderId)
          .select()
          .single()

        // Update main order status
        if (supplierOrder) {
          await supabase
            .from('orders')
            .update({ status: 'shipped' })
            .eq('id', supplierOrder.order_id)
        }
      }
      break
    }

    case 'order_failed': {
      if (supplierOrderId) {
        await supabase
          .from('supplier_orders')
          .update({
            status: 'failed',
            error_message: `Printful order failed: ${event.data.order?.status}`,
            last_attempted_at: new Date().toISOString(),
          })
          .eq('supplier_order_id', supplierOrderId)
      }
      break
    }

    case 'order_updated': {
      if (supplierOrderId && event.data.order?.status) {
        await supabase
          .from('supplier_orders')
          .update({
            status: event.data.order.status.toLowerCase(),
            updated_at: new Date().toISOString(),
          })
          .eq('supplier_order_id', supplierOrderId)
      }
      break
    }

    default:
      console.log(`Unhandled Printful event: ${event.type}`)
  }

  await supabase
    .from('webhook_logs')
    .update({ processed: true })
    .eq('source', 'printful')
    .eq('event_type', event.type)
}
