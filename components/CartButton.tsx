'use client'

import { useState, useEffect, useCallback } from 'react'
import { getCart, addToCart, removeFromCart, updateQuantity } from '@/lib/cart'
import type { CartItem } from '@/types'

interface Props {
  item: CartItem
  stockCount: number
  disabled?: boolean
}

export function CartButton({ item, stockCount, disabled = false }: Props) {
  const [qty, setQty] = useState(0) // 0 = not in cart

  const sync = useCallback(() => {
    const cart = getCart()
    const found = cart.find(c => c.productId === item.productId)
    setQty(found ? found.quantity : 0)
  }, [item.productId])

  useEffect(() => {
    sync()
    // Stay in sync if cart changes in another tab or component
    window.addEventListener('storage', sync)
    window.addEventListener('cart-updated', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('cart-updated', sync)
    }
  }, [sync])

  function dispatch() {
    window.dispatchEvent(new Event('cart-updated'))
  }

  function handleAdd() {
    addToCart({ ...item, quantity: 1 })
    setQty(1)
    dispatch()
  }

  function handleIncrease() {
    if (qty >= stockCount) return
    const next = qty + 1
    updateQuantity(item.productId, next)
    setQty(next)
    dispatch()
  }

  function handleDecrease() {
    if (qty <= 1) {
      removeFromCart(item.productId)
      setQty(0)
      dispatch()
      return
    }
    const next = qty - 1
    updateQuantity(item.productId, next)
    setQty(next)
    dispatch()
  }

  function handleRemove() {
    removeFromCart(item.productId)
    setQty(0)
    dispatch()
  }

  if (disabled) {
    return (
      <div style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#F0EBE1', textAlign: 'center', fontSize: '13px', fontWeight: 500, color: '#9A918A', letterSpacing: '0.04em' }}>
        Out of Stock
      </div>
    )
  }

  // In cart — show stepper
  if (qty > 0) {
    const atMax = qty >= stockCount
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', borderRadius: '12px', border: '1.5px solid #1A1A18', overflow: 'hidden' }}>
          <button
            onClick={handleDecrease}
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
            onClick={handleIncrease}
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
          onClick={handleRemove}
          style={{ background: 'none', border: '1px solid #E4DBD0', borderRadius: '10px', padding: '10px', fontSize: '12px', color: '#9A918A', cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.12s, border-color 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#E05252'; e.currentTarget.style.borderColor = '#FCC' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#9A918A'; e.currentTarget.style.borderColor = '#E4DBD0' }}
        >
          Remove from cart
        </button>
      </div>
    )
  }

  // Not in cart
  return (
    <button
      onClick={handleAdd}
      style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#1A1A18', color: '#F8F5F0', border: 'none', fontSize: '13px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.background = '#C9906A')}
      onMouseLeave={e => (e.currentTarget.style.background = '#1A1A18')}
    >
      Add to Cart
    </button>
  )
}
