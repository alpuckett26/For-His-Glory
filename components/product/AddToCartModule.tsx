'use client'

import { useState } from 'react'
import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import type { Product, ProductVariant, ProductImage } from '@/types'
import { toast } from 'sonner'

interface AddToCartModuleProps {
  product: Product
  selectedVariant: ProductVariant | null
  primaryImage: ProductImage | null
}

export function AddToCartModule({
  product,
  selectedVariant,
  primaryImage,
}: AddToCartModuleProps) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()

  const canAdd = selectedVariant !== null

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error('Please select a size and color')
      return
    }

    addToCart({
      productId: product.id,
      variantId: selectedVariant.id,
      title: product.title,
      size: selectedVariant.size ?? '',
      color: selectedVariant.color ?? '',
      price: selectedVariant.price ?? product.price,
      quantity,
      imageUrl: primaryImage?.url ?? '',
      slug: product.slug,
    })
  }

  const handleBuyNow = async () => {
    if (!selectedVariant) {
      toast.error('Please select a size and color')
      return
    }

    handleAddToCart()
    window.location.href = '/cart'
  }

  return (
    <div className="space-y-4">
      {/* Quantity */}
      <div>
        <span className="font-body text-sm font-medium text-charcoal block mb-3">Quantity</span>
        <div className="inline-flex items-center border border-charcoal/20">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-2 text-charcoal hover:text-gold transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center font-body text-sm font-medium text-charcoal">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-3 py-2 text-charcoal hover:text-gold transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleAddToCart}
          disabled={!canAdd}
          className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-charcoal text-ivory font-body font-semibold text-sm tracking-wide hover:bg-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingBag className="h-4 w-4" />
          {canAdd ? 'Add to Cart' : 'Select Size & Color'}
        </button>

        <button
          onClick={handleBuyNow}
          disabled={!canAdd}
          className="w-full px-8 py-4 border border-charcoal text-charcoal font-body font-semibold text-sm tracking-wide hover:bg-charcoal hover:text-ivory transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Buy Now
        </button>
      </div>

      {/* Shipping note */}
      <p className="font-body text-xs text-charcoal/50 text-center">
        Free shipping on orders over $75 · 30-day returns
      </p>
    </div>
  )
}
