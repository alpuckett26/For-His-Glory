import Link from 'next/link'
import { XCircle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Cancelled',
}

export default function CheckoutCancelPage() {
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-warm-gray flex items-center justify-center mx-auto mb-6">
        <XCircle className="h-8 w-8 text-charcoal/40" />
      </div>
      <h1 className="font-display text-3xl text-charcoal mb-3">Order Cancelled</h1>
      <p className="font-body text-sm text-charcoal/60 mb-8 leading-relaxed">
        Your checkout was cancelled. No charges were made. Your cart has been saved.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/cart"
          className="inline-flex items-center justify-center px-6 py-3 bg-gold text-white font-body font-semibold text-sm tracking-wide hover:bg-gold-light transition-colors"
        >
          Return to Cart
        </Link>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center px-6 py-3 border border-charcoal text-charcoal font-body font-semibold text-sm tracking-wide hover:bg-charcoal hover:text-ivory transition-colors"
        >
          Keep Shopping
        </Link>
      </div>
    </div>
  )
}
