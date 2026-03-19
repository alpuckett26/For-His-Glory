import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import type { CartItem } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { items }: { items: CartItem[] } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    const supabase = await createClient()
    const serviceClient = await createServiceClient()

    // Get current user (optional)
    const { data: { user } } = await supabase.auth.getUser()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.title,
            description: `${item.size} / ${item.color}`,
            images: item.imageUrl ? [item.imageUrl] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel`,
      metadata: {
        userId: user?.id ?? '',
        itemCount: String(items.length),
      },
      customer_email: user?.email,
    })

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Create pending order in Supabase
    const { data: order, error: orderError } = await serviceClient
      .from('orders')
      .insert({
        user_id: user?.id ?? null,
        stripe_session_id: session.id,
        status: 'pending',
        subtotal,
        total: subtotal, // Will be updated with tax/shipping after payment
        email: user?.email ?? null,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Failed to create order:', orderError)
    } else if (order) {
      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId,
        quantity: item.quantity,
        unit_price: item.price,
        title: item.title,
        size: item.size,
        color: item.color,
      }))

      await serviceClient.from('order_items').insert(orderItems)
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
