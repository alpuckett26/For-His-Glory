'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { CheckCircle, Package } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { PageLoader } from '@/components/shared/LoadingSpinner'

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>
}

export default function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const params = use(searchParams)
  const [loading, setLoading] = useState(true)
  const [orderConfirmed, setOrderConfirmed] = useState(false)
  const { clearCart } = useCart()

  useEffect(() => {
    if (params.session_id) {
      // Verify and process the order
      fetch('/api/checkout/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: params.session_id }),
      })
        .then(() => {
          clearCart()
          setOrderConfirmed(true)
        })
        .catch(() => setOrderConfirmed(true))
        .finally(() => setLoading(false))
    } else {
      clearCart()
      setOrderConfirmed(true)
      setLoading(false)
    }
  }, [params.session_id, clearCart])

  if (loading) return <PageLoader />

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      {/* Success icon */}
      <div className="w-20 h-20 rounded-full bg-olive/10 flex items-center justify-center mx-auto mb-8">
        <CheckCircle className="h-10 w-10 text-olive" />
      </div>

      <h1 className="font-display text-4xl sm:text-5xl text-charcoal mb-4">
        Order Confirmed!
      </h1>
      <p className="font-body text-base text-charcoal/60 leading-relaxed mb-3">
        Thank you for shopping with For His Glory. Your order has been received and is being processed.
      </p>
      <p className="font-body text-sm text-charcoal/50 mb-10">
        A confirmation email will be sent to you shortly with your order details.
      </p>

      {/* Order status steps */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        {[
          { label: 'Order Received', active: true },
          { label: 'In Production', active: false },
          { label: 'Shipped', active: false },
        ].map((step, i) => (
          <div key={step.label} className="text-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${
                step.active
                  ? 'bg-gold text-white'
                  : 'bg-warm-gray text-charcoal/40'
              }`}
            >
              {i + 1}
            </div>
            <p className={`font-body text-xs ${step.active ? 'text-charcoal font-medium' : 'text-charcoal/40'}`}>
              {step.label}
            </p>
          </div>
        ))}
      </div>

      {/* What's next */}
      <div className="bg-warm-gray p-6 mb-10 text-left">
        <div className="flex gap-3 mb-3">
          <Package className="h-5 w-5 text-gold shrink-0 mt-0.5" />
          <div>
            <h3 className="font-body text-sm font-semibold text-charcoal mb-1">What Happens Next</h3>
            <ul className="font-body text-sm text-charcoal/60 space-y-1">
              <li>• Your order is sent to our fulfillment partner</li>
              <li>• Production takes 2–4 business days</li>
              <li>• You'll receive a tracking email when shipped</li>
              <li>• Estimated delivery: 7–10 business days</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/account/orders"
          className="inline-flex items-center justify-center px-8 py-3 bg-gold text-white font-body font-semibold text-sm tracking-wide hover:bg-gold-light transition-colors"
        >
          View My Orders
        </Link>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center px-8 py-3 border border-charcoal text-charcoal font-body font-semibold text-sm tracking-wide hover:bg-charcoal hover:text-ivory transition-colors"
        >
          Continue Shopping
        </Link>
      </div>

      <p className="font-body text-xs text-charcoal/40 mt-8">
        Questions? Email us at{' '}
        <a href="mailto:hello@forhisglory.com" className="text-gold hover:underline">
          hello@forhisglory.com
        </a>
      </p>
    </div>
  )
}
