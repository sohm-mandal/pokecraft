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

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWishlist = useCallback(async () => {
    console.log('[WishlistContext] fetchWishlist called')
    setLoading(true)
    try {
      console.log('[WishlistContext] calling GET /api/wishlist')
      const res = await fetch('/api/wishlist')
      console.log('[WishlistContext] response status:', res.status)
      if (res.ok) {
        const data = await res.json()
        console.log('[WishlistContext] got products:', data.length)
        setProducts(data)
      } else {
        console.error('[WishlistContext] non-ok response:', res.status)
        setProducts([])
      }
    } catch (err) {
      console.error('[WishlistContext] fetch error:', err)
      setProducts([])
    }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    console.log('[WishlistContext] mounted — triggering fetchWishlist')
    fetchWishlist()
  }, [fetchWishlist])

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
