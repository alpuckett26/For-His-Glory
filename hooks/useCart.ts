'use client'

import { useCartStore } from '@/lib/store/cart'
import type { CartItem } from '@/types'
import { toast } from 'sonner'

export function useCart() {
  const store = useCartStore()

  const addToCart = (item: CartItem) => {
    store.addItem(item)
    toast.success(`${item.title} added to cart`, {
      description: `${item.size} / ${item.color}`,
    })
  }

  const removeFromCart = (variantId: string, title?: string) => {
    store.removeItem(variantId)
    if (title) {
      toast.success(`${title} removed from cart`)
    }
  }

  return {
    items: store.items,
    itemCount: store.itemCount(),
    subtotal: store.subtotal(),
    addToCart,
    removeFromCart,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
  }
}
