'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants'
import { toast } from 'sonner'

export function CartSummary() {
  const { subtotal, items } = useCart()
  const [loading, setLoading] = useState(false)

  const shippingFree = subtotal >= FREE_SHIPPING_THRESHOLD
  const shippingCost = shippingFree ? 0 : 7.99
  const estimatedTax = subtotal * 0.0875
  const total = subtotal + shippingCost + estimatedTax

  const handleCheckout = async () => {
    if (items.length === 0) return

    setLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? 'Checkout failed')
      }

      window.location.href = data.url
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="bg-ivory border border-warm-gray p-6">
      <h2 className="font-display text-xl text-charcoal mb-6">Order Summary</h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="font-body text-sm text-charcoal/70">Subtotal</span>
          <span className="font-body text-sm font-medium text-charcoal">
            {formatPrice(subtotal)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="font-body text-sm text-charcoal/70">Shipping</span>
          <span className="font-body text-sm font-medium text-charcoal">
            {shippingFree ? (
              <span className="text-olive">Free</span>
            ) : (
              formatPrice(shippingCost)
            )}
          </span>
        </div>

        {!shippingFree && (
          <p className="font-body text-xs text-charcoal/50 bg-gold/5 border border-gold/20 px-3 py-2">
            Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping
          </p>
        )}

        <div className="flex justify-between">
          <span className="font-body text-sm text-charcoal/70">Est. Tax</span>
          <span className="font-body text-sm font-medium text-charcoal">
            {formatPrice(estimatedTax)}
          </span>
        </div>
      </div>

      <div className="border-t border-warm-gray pt-4 mb-6">
        <div className="flex justify-between">
          <span className="font-body text-base font-semibold text-charcoal">Total</span>
          <span className="font-body text-base font-semibold text-charcoal">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={items.length === 0 || loading}
        className="w-full py-4 bg-gold text-white font-body font-semibold text-sm tracking-wide hover:bg-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Redirecting...' : 'Proceed to Checkout'}
      </button>

      <p className="font-body text-xs text-charcoal/40 text-center mt-4">
        Secure checkout powered by Stripe
      </p>
    </div>
  )
}
