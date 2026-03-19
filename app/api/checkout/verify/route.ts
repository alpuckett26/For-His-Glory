import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent'],
    })

    if (session.payment_status === 'paid') {
      const supabase = await createServiceClient()

      await supabase
        .from('orders')
        .update({
          status: 'paid',
          stripe_payment_intent_id:
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id,
        })
        .eq('stripe_session_id', sessionId)
    }

    return NextResponse.json({ status: session.payment_status })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
