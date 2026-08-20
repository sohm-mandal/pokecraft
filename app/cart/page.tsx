'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getCart, removeFromCart, updateQuantity, cartTotal } from '@/lib/cart'
import type { CartItem } from '@/types'

function fmt(paise: number) {
  return '₹' + (paise / 100).toLocaleString('en-IN')
}

function QtyButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid',
        borderColor: hov ? '#1A1A18' : '#E4DBD0',
        background: hov ? '#1A1A18' : 'white',
        color: hov ? 'white' : '#1A1A18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', fontSize: '16px', lineHeight: 1,
        transition: 'all 0.12s', flexShrink: 0,
      }}
    >
      {children}
    </button>
  )
}

function CartRow({ item, onRemove, onQty }: { item: CartItem; onRemove: () => void; onQty: (q: number) => void }) {
  const [removing, setRemoving] = useState(false)

  function remove() {
    setRemoving(true)
    setTimeout(onRemove, 220)
  }

  return (
    <div style={{
      display: 'flex', gap: '20px', alignItems: 'center',
      padding: '20px 0', borderBottom: '1px solid #F0EBE1',
      opacity: removing ? 0 : 1, transform: removing ? 'translateX(-12px)' : 'none',
      transition: 'opacity 0.2s, transform 0.2s',
    }}>
      {/* Image */}
      <div style={{ width: '88px', height: '88px', borderRadius: '12px', background: '#F5F0EB', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {item.image
          ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} />
          : <span style={{ fontSize: '2.5rem' }}>🧶</span>
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '15px', color: '#1A1A18' }}>{item.name}</p>
        <p style={{ margin: 0, fontSize: '13px', color: '#9A918A' }}>{fmt(item.price)} each</p>
      </div>

      {/* Qty stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <QtyButton onClick={() => onQty(item.quantity - 1)}>−</QtyButton>
        <span style={{ fontSize: '14px', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
        <QtyButton onClick={() => onQty(item.quantity + 1)}>+</QtyButton>
      </div>

      {/* Line total */}
      <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', minWidth: '72px', textAlign: 'right', color: '#1A1A18' }}>
        {fmt(item.price * item.quantity)}
      </p>

      {/* Remove */}
      <button
        onClick={remove}
        title="Remove"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: '#C0B8B0', fontSize: '18px', lineHeight: 1, transition: 'color 0.12s' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#E05252')}
        onMouseLeave={e => (e.currentTarget.style.color = '#C0B8B0')}
      >
        ×
      </button>
    </div>
  )
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setCart(getCart()); setMounted(true) }, [])

  function handleRemove(productId: number) { setCart(removeFromCart(productId)) }
  function handleQty(productId: number, qty: number) {
    if (qty < 1) return
    setCart(updateQuantity(productId, qty))
  }

  const total = cartTotal(cart)
  const freeShipping = total >= 50000 // free shipping above ₹500
  const shippingCost = freeShipping ? 0 : 8000 // ₹80

  if (!mounted) return null

  if (cart.length === 0) {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px', lineHeight: 1 }}>🧺</div>
        <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '2rem', color: '#1A1A18', margin: '0 0 10px' }}>Your cart is empty</h1>
        <p style={{ color: '#9A918A', fontSize: '15px', margin: '0 0 32px', lineHeight: 1.6 }}>Looks like you haven't added any plushies yet.</p>
        <Link href="/shop" style={{
          display: 'inline-block', background: '#1A1A18', color: '#F8F5F0',
          padding: '14px 36px', borderRadius: '100px', textDecoration: 'none',
          fontSize: '13px', fontWeight: 500, letterSpacing: '0.04em',
        }}>
          Browse the Shop
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '36px', flexWrap: 'wrap', gap: '8px' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '2.2rem', color: '#1A1A18', margin: 0 }}>
          Your Cart
        </h1>
        <Link href="/shop" style={{ fontSize: '13px', color: '#9A918A', textDecoration: 'none' }}>
          ← Continue shopping
        </Link>
      </div>

      <div className="cart-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '48px', alignItems: 'start' }}>

        {/* Items */}
        <div>
          {/* Column labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0 12px', borderBottom: '2px solid #1A1A18', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9A918A', fontWeight: 500 }}>Product</span>
            <div style={{ display: 'flex', gap: '52px' }}>
              <span style={{ fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9A918A', fontWeight: 500 }}>Qty</span>
              <span style={{ fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9A918A', fontWeight: 500 }}>Total</span>
            </div>
          </div>

          {cart.map(item => (
            <CartRow
              key={item.productId}
              item={item}
              onRemove={() => handleRemove(item.productId)}
              onQty={qty => handleQty(item.productId, qty)}
            />
          ))}
        </div>

        {/* Order summary */}
        <div style={{ position: 'sticky', top: '88px' }}>
          <div style={{ background: 'white', border: '1px solid #E4DBD0', borderRadius: '16px', padding: '28px', }}>
            <h2 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.2rem', color: '#1A1A18', margin: '0 0 20px' }}>Order Summary</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#6B6560' }}>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span style={{ fontWeight: 500 }}>{fmt(total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#6B6560' }}>Shipping</span>
                {freeShipping
                  ? <span style={{ color: '#2D9E6B', fontWeight: 600 }}>Free</span>
                  : <span style={{ fontWeight: 500 }}>{fmt(shippingCost)}</span>
                }
              </div>
              {!freeShipping && (
                <div style={{ background: '#FBF8F5', border: '1px solid #F0EBE1', borderRadius: '8px', padding: '10px 12px' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: '#9A918A', lineHeight: 1.5 }}>
                    Add <strong style={{ color: '#C9906A' }}>{fmt(50000 - total)}</strong> more for free shipping
                  </p>
                  <div style={{ height: '4px', background: '#F0EBE1', borderRadius: '4px', marginTop: '8px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min((total / 50000) * 100, 100)}%`, background: '#C9906A', borderRadius: '4px', transition: 'width 0.3s' }} />
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid #E4DBD0', marginBottom: '20px' }}>
              <span style={{ fontWeight: 600, fontSize: '15px' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.4rem', fontWeight: 700 }}>{fmt(total + shippingCost)}</span>
            </div>

            <Link href="/checkout" style={{
              display: 'block', textAlign: 'center',
              background: '#1A1A18', color: '#F8F5F0',
              padding: '15px', borderRadius: '100px',
              textDecoration: 'none', fontSize: '13px', fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = '#C9906A')}
              onMouseLeave={e => (e.currentTarget.style.background = '#1A1A18')}
            >
              Proceed to Checkout
            </Link>

            {/* Trust badges */}
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[['🔒', 'Secure checkout'], ['🚚', 'India-wide delivery'], ['🧶', '100% handmade']].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#9A918A' }}>
                  <span>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: single column */}
      <style>{`
        @media (max-width: 768px) {
          .cart-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
