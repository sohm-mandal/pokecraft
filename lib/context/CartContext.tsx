'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { CartItem } from '@/types'

interface CartContextValue {
  items: CartItem[]
  loading: boolean
  addItem: (productId: number, quantity: number) => Promise<void>
  removeItem: (productId: number) => Promise<void>
  updateQuantity: (productId: number, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  inCart: (productId: number) => boolean
  getItem: (productId: number) => CartItem | undefined
  getTotal: () => number
  getCount: () => number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCart = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cart')
      if (res.ok) setItems(await res.json())
      else setItems([])
    } catch { setItems([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchCart() }, [fetchCart])

  const addItem = useCallback(async (productId: number, quantity: number) => {
    const existing = items.find(i => i.productId === productId)
    const newQty = (existing?.quantity ?? 0) + quantity
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: newQty }),
    })
    if (res.ok) setItems(await res.json())
  }, [items])

  const removeItem = useCallback(async (productId: number) => {
    setItems(prev => prev.filter(i => i.productId !== productId))
    await fetch(`/api/cart/${productId}`, { method: 'DELETE' })
  }, [])

  const updateQuantity = useCallback(async (productId: number, quantity: number) => {
    if (quantity < 1) { await removeItem(productId); return }
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity } : i))
    const res = await fetch(`/api/cart/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    })
    if (res.ok) setItems(await res.json())
  }, [removeItem])

  const clearCart = useCallback(async () => {
    setItems([])
    await fetch('/api/cart', { method: 'DELETE' })
  }, [])

  return (
    <CartContext.Provider value={{
      items,
      loading,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      inCart: (id) => items.some(i => i.productId === id),
      getItem: (id) => items.find(i => i.productId === id),
      getTotal: () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getCount: () => items.reduce((sum, i) => sum + i.quantity, 0),
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
