import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem, maxQty?: number) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getCount: () => number
}

export const useCartHydrated = () => useCartStore.persist.hasHydrated()

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem(item, maxQty) {
        set(state => {
          const existing = state.items.find(i => i.productId === item.productId)
          if (existing) {
            const next = existing.quantity + item.quantity
            return {
              items: state.items.map(i =>
                i.productId === item.productId
                  ? { ...i, quantity: maxQty != null ? Math.min(next, maxQty) : next }
                  : i
              ),
            }
          }
          return {
            items: [
              ...state.items,
              { ...item, quantity: maxQty != null ? Math.min(item.quantity, maxQty) : item.quantity },
            ],
          }
        })
      },

      removeItem(productId) {
        set(state => ({ items: state.items.filter(i => i.productId !== productId) }))
      },

      updateQuantity(productId, quantity) {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set(state => ({
          items: state.items.map(i => (i.productId === productId ? { ...i, quantity } : i)),
        }))
      },

      clearCart() {
        set({ items: [] })
      },

      getTotal() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
      },

      getCount() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },
    }),
    { name: 'pokecraft_cart' }
  )
)
