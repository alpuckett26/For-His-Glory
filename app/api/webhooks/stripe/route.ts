import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/lib/stripe/webhooks'
import { sql } from '@/lib/db'
import { getSupplierAdapter } from '@/lib/suppliers'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = constructWebhookEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  processWebhookEvent(event).catch(console.error)

  return NextResponse.json({ received: true })
}

async function processWebhookEvent(event: Stripe.Event) {
  await sql`
    INSERT INTO webhook_logs (source, event_type, payload, processed)
    VALUES ('stripe', ${event.type}, ${JSON.stringify(event)}, false)
  `

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      const shippingAddress = session.shipping_details?.address
        ? {
            name: session.shipping_details.name,
            address1: session.shipping_details.address.line1,
            address2: session.shipping_details.address.line2,
            city: session.shipping_details.address.city,
            state: session.shipping_details.address.state,
            zip: session.shipping_details.address.postal_code,
            country: session.shipping_details.address.country,
          }
        : null

      const paymentIntentId =
        typeof session.payment_intent === 'string' ? session.payment_intent : null

      const orderRows = await sql`
        UPDATE orders SET
          status = 'paid',
          stripe_payment_intent_id = ${paymentIntentId},
          total = ${session.amount_total ? session.amount_total / 100 : null},
          email = ${session.customer_email ?? session.customer_details?.email ?? null},
          shipping_address = ${shippingAddress ? JSON.stringify(shippingAddress) : null}
        WHERE stripe_session_id = ${session.id}
        RETURNING id, shipping_address, email
      `
      const order = orderRows[0]

      if (order) {
        await sql`
          INSERT INTO supplier_orders (order_id, supplier, status)
          VALUES (${order.id}, 'printful', 'pending')
        `

        try {
          const orderItems = await sql`
            SELECT oi.*, pv.sku, sv.supplier_variant_id
            FROM order_items oi
            LEFT JOIN product_variants pv ON pv.id = oi.variant_id
            LEFT JOIN supplier_variants sv ON sv.variant_id = oi.variant_id AND sv.supplier = 'printful'
            WHERE oi.order_id = ${order.id}
          `

          if (orderItems.length > 0 && order.shipping_address) {
            const addr = order.shipping_address as {
              name: string; email?: string; address1: string; address2?: string
              city: string; state: string; zip: string; country: string
            }
            const adapter = getSupplierAdapter('printful')
            const result = await adapter.submitOrder({
              externalOrderId: order.id,
              recipient: { ...addr, email: addr.email ?? order.email ?? '' },
              items: orderItems.map((item) => ({
                supplierVariantId: item.supplier_variant_id ?? item.sku ?? item.variant_id,
                quantity: item.quantity,
              })),
            })

            await sql`
              UPDATE supplier_orders SET
                supplier_order_id = ${result.supplierOrderId},
                status = ${result.status},
                submitted_at = NOW()
              WHERE order_id = ${order.id} AND supplier = 'printful'
            `
          }
        } catch (supplierError) {
          console.error('Failed to submit to Printful:', supplierError)
          await sql`
            UPDATE supplier_orders SET
              status = 'failed',
              error_message = ${String(supplierError)},
              last_attempted_at = NOW()
            WHERE order_id = ${order.id} AND supplier = 'printful'
          `
        }
      }

      await sql`
        UPDATE webhook_logs SET processed = true
        WHERE source = 'stripe' AND event_type = ${event.type}
          AND payload->>'id' = ${event.id}
      `
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await sql`
        UPDATE orders SET status = 'cancelled'
        WHERE stripe_payment_intent_id = ${paymentIntent.id}
      `
      break
    }

    default:
      console.log(`Unhandled Stripe webhook event: ${event.type}`)
  }
}
