'use client'

import Link from 'next/link'
import { useWishlist } from '@/lib/context/WishlistContext'

export function WishlistIcon() {
  const { count } = useWishlist()

  return (
    <Link href="/account" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A1A18', borderRadius: '50%', textDecoration: 'none', position: 'relative' }}>
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      {count > 0 && (
        <span style={{ position: 'absolute', top: '4px', right: '4px', background: '#C9906A', color: 'white', borderRadius: '50%', width: '14px', height: '14px', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
          {count}
        </span>
      )}
    </Link>
  )
}
