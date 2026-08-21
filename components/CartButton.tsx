'use client'

import Link from 'next/link'
import { useCart } from '@/lib/context/CartContext'

interface Props {
  productId: number
  stockCount: number
  disabled?: boolean
}

export function CartButton({ productId, stockCount, disabled = false }: Props) {
  const { inCart, addItem } = useCart()
  const isInCart = inCart(productId)

  if (disabled) {
    return (
      <div style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#F0EBE1', textAlign: 'center', fontSize: '13px', fontWeight: 500, color: '#9A918A', letterSpacing: '0.04em' }}>
        Out of Stock
      </div>
    )
  }

  if (isInCart) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#EAF6EF', border: '1.5px solid #2D9E6B', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#2D9E6B', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Added to Cart
        </div>
        <Link
          href="/cart"
          style={{ display: 'block', width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E4DBD0', textAlign: 'center', fontSize: '13px', fontWeight: 500, color: '#1A1A18', textDecoration: 'none', letterSpacing: '0.02em', transition: 'border-color 0.12s, background 0.12s', boxSizing: 'border-box' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#1A1A18'; e.currentTarget.style.background = '#F5F0EB' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E4DBD0'; e.currentTarget.style.background = 'transparent' }}
        >
          View Cart →
        </Link>
      </div>
    )
  }

  return (
    <button
      onClick={() => addItem(productId, 1)}
      style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#1A1A18', color: '#F8F5F0', border: 'none', fontSize: '13px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.background = '#C9906A')}
      onMouseLeave={e => (e.currentTarget.style.background = '#1A1A18')}
    >
      Add to Cart
    </button>
  )
}
