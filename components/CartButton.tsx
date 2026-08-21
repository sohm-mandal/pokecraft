'use client'

import { useCartStore } from '@/lib/stores/cartStore'
import type { CartItem } from '@/types'

interface Props {
  item: CartItem
  stockCount: number
  disabled?: boolean
}

export function CartButton({ item, stockCount, disabled = false }: Props) {
  const { items, addItem, removeItem, updateQuantity } = useCartStore()
  const found = items.find(i => i.productId === item.productId)
  const qty = found?.quantity ?? 0

  if (disabled) {
    return (
      <div style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#F0EBE1', textAlign: 'center', fontSize: '13px', fontWeight: 500, color: '#9A918A', letterSpacing: '0.04em' }}>
        Out of Stock
      </div>
    )
  }

  if (qty > 0) {
    const atMax = qty >= stockCount
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', borderRadius: '12px', border: '1.5px solid #1A1A18', overflow: 'hidden' }}>
          <button
            onClick={() => updateQuantity(item.productId, qty - 1)}
            style={{ width: '48px', height: '48px', background: 'white', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#1A1A18', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.12s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#F5F0EB')}
            onMouseLeave={e => (e.currentTarget.style.background = 'white')}
          >
            −
          </button>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '15px', fontWeight: 700, color: '#1A1A18', borderLeft: '1px solid #E4DBD0', borderRight: '1px solid #E4DBD0' }}>
            {qty}
          </div>
          <button
            onClick={() => { if (qty < stockCount) updateQuantity(item.productId, qty + 1) }}
            disabled={atMax}
            title={atMax ? `Only ${stockCount} in stock` : undefined}
            style={{ width: '48px', height: '48px', background: atMax ? '#F5F0EB' : 'white', border: 'none', cursor: atMax ? 'not-allowed' : 'pointer', fontSize: '20px', color: atMax ? '#C0B8B0' : '#1A1A18', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.12s' }}
            onMouseEnter={e => { if (!atMax) (e.currentTarget.style.background = '#F5F0EB') }}
            onMouseLeave={e => { if (!atMax) (e.currentTarget.style.background = 'white') }}
          >
            +
          </button>
        </div>

        {atMax && (
          <p style={{ margin: 0, fontSize: '11px', color: '#E5A800', textAlign: 'center', letterSpacing: '0.02em' }}>
            Max available quantity ({stockCount}) reached
          </p>
        )}

        <button
          onClick={() => removeItem(item.productId)}
          style={{ background: 'none', border: '1px solid #E4DBD0', borderRadius: '10px', padding: '10px', fontSize: '12px', color: '#9A918A', cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.12s, border-color 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#E05252'; e.currentTarget.style.borderColor = '#FCC' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#9A918A'; e.currentTarget.style.borderColor = '#E4DBD0' }}
        >
          Remove from cart
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => addItem({ ...item, quantity: 1 }, stockCount)}
      style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#1A1A18', color: '#F8F5F0', border: 'none', fontSize: '13px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.background = '#C9906A')}
      onMouseLeave={e => (e.currentTarget.style.background = '#1A1A18')}
    >
      Add to Cart
    </button>
  )
}
