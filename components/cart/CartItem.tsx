'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, X } from 'lucide-react'
import type { CartItem as CartItemType } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'

interface CartItemProps {
  item: CartItemType
}

export function CartItemRow({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart()

  return (
    <div className="flex gap-4 py-4 border-b border-warm-gray">
      {/* Image */}
      <Link href={`/products/${item.slug}`} className="shrink-0">
        <div className="relative w-20 h-24 sm:w-24 sm:h-28 bg-warm-gray overflow-hidden">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-2xl text-charcoal/20">
                {item.title.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2 mb-1">
          <Link
            href={`/products/${item.slug}`}
            className="font-display text-base text-charcoal hover:text-gold transition-colors line-clamp-2"
          >
            {item.title}
          </Link>
          <button
            onClick={() => removeFromCart(item.variantId, item.title)}
            className="shrink-0 p-1 text-charcoal/40 hover:text-charcoal transition-colors"
            aria-label="Remove item"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="font-body text-xs text-charcoal/50 mb-3">
          {item.size} / {item.color}
        </p>

        <div className="flex items-center justify-between">
          {/* Quantity */}
          <div className="inline-flex items-center border border-charcoal/20">
            <button
              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
              className="px-2 py-1 text-charcoal hover:text-gold transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center font-body text-xs font-medium text-charcoal">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
              className="px-2 py-1 text-charcoal hover:text-gold transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <span className="font-body text-sm font-semibold text-charcoal">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  )
}
