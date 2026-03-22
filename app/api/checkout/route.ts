import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { sql } from '@/lib/db'
import { auth } from '@/auth'
import type { CartItem } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { items }: { items: CartItem[] } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    const session = await auth()
    const user = session?.user ?? null
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const stripeSession = await stripe.checkout.sessions.create({
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
      customer_email: user?.email ?? undefined,
    })

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    try {
      const orderRows = await sql`
        INSERT INTO orders (user_id, stripe_session_id, status, subtotal, total, email)
        VALUES (${user?.id ?? null}, ${stripeSession.id}, 'pending', ${subtotal}, ${subtotal}, ${user?.email ?? null})
        RETURNING id
      `
      const orderId = orderRows[0]?.id

      if (orderId) {
        for (const item of items) {
          await sql`
            INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price, title, size, color)
            VALUES (${orderId}, ${item.productId}, ${item.variantId}, ${item.quantity}, ${item.price}, ${item.title}, ${item.size}, ${item.color})
          `
        }
      }
    } catch (dbError) {
      console.error('Failed to create order:', dbError)
    }

    return NextResponse.json({ url: stripeSession.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
