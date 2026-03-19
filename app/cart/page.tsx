'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { CartItemRow } from '@/components/cart/CartItem'
import { CartSummary } from '@/components/cart/CartSummary'
import { EmptyState } from '@/components/shared/EmptyState'

export default function CartPage() {
  const { items } = useCart()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-charcoal mb-10">Your Cart</h1>

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-14 w-14" />}
          title="Your cart is empty"
          description="Add some faith-forward pieces to get started."
          action={{ label: 'Start Shopping', href: '/shop' }}
          className="min-h-[400px]"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Items */}
          <div className="lg:col-span-2">
            <div className="divide-y divide-warm-gray">
              {items.map((item) => (
                <CartItemRow key={item.variantId} item={item} />
              ))}
            </div>

            <div className="mt-6 pt-4">
              <Link
                href="/shop"
                className="font-body text-sm text-charcoal/60 hover:text-gold transition-colors underline underline-offset-2"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div>
            <CartSummary />
          </div>
        </div>
      )}
    </div>
  )
}
