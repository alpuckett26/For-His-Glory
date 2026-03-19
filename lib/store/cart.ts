import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  itemCount: () => number
  subtotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item: CartItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.variantId === item.variantId
          )

          if (existingIndex >= 0) {
            const updatedItems = [...state.items]
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + item.quantity,
            }
            return { items: updatedItems }
          }

          return { items: [...state.items, item] }
        })
      },

      removeItem: (variantId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }))
      },

      updateQuantity: (variantId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(variantId)
          return
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      itemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      subtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },
    }),
    {
      name: 'for-his-glory-cart',
    }
  )
)
