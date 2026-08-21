'use client'

import Link from 'next/link'
import { useCartStore } from '@/lib/stores/cartStore'

export function CartIcon() {
  const count = useCartStore(state => state.getCount())

  return (
    <Link href="/cart" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A1A18', borderRadius: '50%', position: 'relative', textDecoration: 'none' }}>
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
      {count > 0 && (
        <span style={{ position: 'absolute', top: '6px', right: '6px', width: '15px', height: '15px', background: '#C9906A', color: '#F8F5F0', borderRadius: '50%', fontSize: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}
