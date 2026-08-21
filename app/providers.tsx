'use client'

import { CartProvider } from '@/lib/context/CartContext'
import { WishlistProvider } from '@/lib/context/WishlistContext'
import type { ReactNode } from 'react'

export function Providers({ email, children }: { email: string | null; children: ReactNode }) {
  return (
    <CartProvider email={email}>
      <WishlistProvider email={email}>
        {children}
      </WishlistProvider>
    </CartProvider>
  )
}
