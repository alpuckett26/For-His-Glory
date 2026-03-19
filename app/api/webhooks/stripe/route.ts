import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/lib/stripe/webhooks'
import { createServiceClient } from '@/lib/supabase/server'
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

  // Return 200 immediately, process async
  processWebhookEvent(event).catch(console.error)

  return NextResponse.json({ received: true })
}

async function processWebhookEvent(event: Stripe.Event) {
  const supabase = await createServiceClient()

  // Log the webhook
  await supabase.from('webhook_logs').insert({
    source: 'stripe',
    event_type: event.type,
    payload: event as unknown as Record<string, unknown>,
    processed: false,
  })

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.CheckoutSession

      // Update order status to paid
      const { data: order } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          stripe_payment_intent_id:
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : null,
          total: session.amount_total ? session.amount_total / 100 : null,
          email: session.customer_email ?? session.customer_details?.email,
          shipping_address: session.shipping_details?.address
            ? {
                name: session.shipping_details.name,
                address1: session.shipping_details.address.line1,
                address2: session.shipping_details.address.line2,
                city: session.shipping_details.address.city,
                state: session.shipping_details.address.state,
                zip: session.shipping_details.address.postal_code,
                country: session.shipping_details.address.country,
              }
            : null,
        })
        .eq('stripe_session_id', session.id)
        .select()
        .single()

      if (order) {
        // Create supplier order record
        await supabase.from('supplier_orders').insert({
          order_id: order.id,
          supplier: 'printful',
          status: 'pending',
        })

        // Try to submit to Printful
        try {
          const { data: orderItems } = await supabase
            .from('order_items')
            .select('*, variant:product_variants(*, supplier_variants(*))')
            .eq('order_id', order.id)

          if (orderItems && order.shipping_address) {
            const adapter = getSupplierAdapter('printful')
            const result = await adapter.submitOrder({
              externalOrderId: order.id,
              recipient: order.shipping_address as {
                name: string
                email: string
                address1: string
                address2?: string
                city: string
                state: string
                zip: string
                country: string
              },
              items: orderItems.map((item) => ({
                supplierVariantId: item.variant?.supplier_variants?.[0]?.supplier_variant_id ?? item.variant_id,
                quantity: item.quantity,
              })),
            })

            // Update supplier order with result
            await supabase
              .from('supplier_orders')
              .update({
                supplier_order_id: result.supplierOrderId,
                status: result.status,
                submitted_at: new Date().toISOString(),
              })
              .eq('order_id', order.id)
              .eq('supplier', 'printful')
          }
        } catch (supplierError) {
          console.error('Failed to submit to Printful:', supplierError)

          await supabase
            .from('supplier_orders')
            .update({
              status: 'failed',
              error_message: String(supplierError),
              last_attempted_at: new Date().toISOString(),
            })
            .eq('order_id', order.id)
            .eq('supplier', 'printful')
        }
      }

      await supabase
        .from('webhook_logs')
        .update({ processed: true })
        .eq('event_type', event.type)
        .eq('payload->id', event.id)

      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent

      await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('stripe_payment_intent_id', paymentIntent.id)

      break
    }

    default:
      console.log(`Unhandled Stripe webhook event: ${event.type}`)
  }
}
