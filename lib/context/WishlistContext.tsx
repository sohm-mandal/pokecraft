'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { Product } from '@/types'

interface WishlistContextValue {
  products: Product[]
  loading: boolean
  inWishlist: (productId: number) => boolean
  toggle: (productId: number) => Promise<void>
  removeItem: (productId: number) => Promise<void>
  count: number
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

export function WishlistProvider({ email, children }: { email: string | null; children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  const fetchWishlist = useCallback(async () => {
    if (!email) { setProducts([]); return }
    setLoading(true)
    try {
      const res = await fetch('/api/wishlist')
      if (res.ok) setProducts(await res.json())
      else setProducts([])
    } catch { setProducts([]) }
    finally { setLoading(false) }
  }, [email])

  useEffect(() => { fetchWishlist() }, [fetchWishlist])

  const inWishlist = useCallback((productId: number) => {
    return products.some(p => p.id === productId)
  }, [products])

  const toggle = useCallback(async (productId: number) => {
    if (inWishlist(productId)) {
      setProducts(prev => prev.filter(p => p.id !== productId))
      await fetch(`/api/wishlist/${productId}`, { method: 'DELETE' })
    } else {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      await fetchWishlist()
    }
  }, [inWishlist, fetchWishlist])

  const removeItem = useCallback(async (productId: number) => {
    setProducts(prev => prev.filter(p => p.id !== productId))
    await fetch(`/api/wishlist/${productId}`, { method: 'DELETE' })
  }, [])

  return (
    <WishlistContext.Provider value={{
      products,
      loading,
      inWishlist,
      toggle,
      removeItem,
      count: products.length,
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
