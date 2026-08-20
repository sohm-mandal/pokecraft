'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { Order, OrderItem } from '@/types'

export default function OrderPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>

    async function fetchOrder() {
      const res = await fetch(`/api/orders/${id}`)
      if (res.status === 404) { setNotFound(true); return }
      if (!res.ok) return
      const data: Order = await res.json()
      setOrder(data)
      if (data.status === 'placed') clearInterval(interval)
    }

    fetchOrder()
    interval = setInterval(fetchOrder, 3000)
    return () => clearInterval(interval)
  }, [id])

  if (notFound) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '2rem', color: '#1A1A18' }}>Order not found</h1>
      <Link href="/shop" style={{ color: '#C9906A' }}>Back to shop</Link>
    </div>
  )

  if (!order) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
      <p style={{ color: '#6B6560' }}>Loading order…</p>
    </div>
  )

  const items = order.items as OrderItem[]
  const total = (order.total_amount / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })
  const placed = order.status === 'placed'

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: '64px', marginBottom: '24px' }}>{placed ? '🎉' : '⏳'}</div>
      <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '2.5rem', color: '#1A1A18', marginBottom: '12px' }}>
        {placed ? 'Order Confirmed!' : 'Processing your order…'}
      </h1>
      <p style={{ color: '#6B6560', marginBottom: '40px', fontSize: '15px' }}>
        {placed
          ? `Thank you, ${order.buyer_name}! Your order #${order.id} has been placed.`
          : 'Payment is being verified. This page will refresh automatically.'}
      </p>

      {placed && (
        <div style={{ background: 'white', border: '1px solid #E5DDD4', borderRadius: '16px', padding: '24px', textAlign: 'left', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6B6560', marginBottom: '16px' }}>Order Summary</h2>
          {items.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F0EAE0' }}>
              <span style={{ fontSize: '14px' }}>{item.name} × {item.quantity}</span>
              <span style={{ fontSize: '14px' }}>
                {((item.price * item.quantity) / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
              </span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', fontWeight: 600 }}>
            <span>Total</span><span>{total}</span>
          </div>
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E5DDD4', fontSize: '13px', color: '#6B6560' }}>
            <p>Ships to: {order.shipping_address.line1}, {order.shipping_address.city} — {order.shipping_address.pincode}</p>
            <p style={{ marginTop: '4px' }}>Expected delivery: 7–10 business days</p>
          </div>
        </div>
      )}

      <Link href="/shop" style={{ display: 'inline-block', background: '#1A1A18', color: '#F8F5F0', padding: '14px 36px', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', textDecoration: 'none' }}>
        Continue Shopping
      </Link>
    </div>
  )
}
