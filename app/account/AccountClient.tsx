'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Order, OrderItem, ShippingAddress } from '@/types'

interface Props {
  name: string
  image: string | null
  sessionEmail: string
}

const statusColor: Record<string, string> = {
  placed: '#2D9E6B', shipped: '#3B82F6', delivered: '#1A1A18',
  pending: '#9A918A', cancelled: '#E05252', returned: '#9A918A',
}

const statusLabel: Record<string, string> = {
  pending: 'Pending', placed: 'Confirmed', shipped: 'Shipped',
  delivered: 'Delivered', cancelled: 'Cancelled', returned: 'Returned',
}

const STATUS_STEPS = ['placed', 'shipped', 'delivered']

function OrderDetail({ order }: { order: Order }) {
  const items = order.items as OrderItem[]
  const addr = order.shipping_address as ShippingAddress
  const isCod = order.razorpay_order_id?.startsWith('COD-')
  const stepIdx = STATUS_STEPS.indexOf(order.status)

  const fullAddress = [addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')

  return (
    <div style={{ borderTop: '1px solid #E4DBD0', marginTop: '12px', paddingTop: '16px' }}>

      {/* Progress tracker — only for active orders */}
      {!['cancelled', 'returned', 'pending'].includes(order.status) && (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: 0 }}>
          {STATUS_STEPS.map((s, i) => {
            const done = i <= stepIdx
            const active = i === stepIdx
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_STEPS.length - 1 ? 1 : undefined }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: done ? statusColor[s] : '#E4DBD0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: active ? `2px solid ${statusColor[s]}` : 'none',
                    transition: 'all 0.2s',
                  }}>
                    {done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <span style={{ fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase', color: done ? '#1A1A18' : '#C0B8B0', whiteSpace: 'nowrap' }}>
                    {statusLabel[s]}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div style={{ flex: 1, height: '2px', background: i < stepIdx ? statusColor[STATUS_STEPS[i + 1]] : '#E4DBD0', margin: '0 4px', marginBottom: '16px', transition: 'background 0.2s' }} />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Cancelled / returned badge */}
      {['cancelled', 'returned'].includes(order.status) && (
        <div style={{ background: '#FFF0F0', border: '1px solid #FCC', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#E05252', fontWeight: 500 }}>
          This order was {order.status}.
        </div>
      )}

      {/* Items */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A918A', marginBottom: '8px' }}>Items</p>
        {items.map((item) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F5F0EB', fontSize: '13px' }}>
            <span>{item.name} <span style={{ color: '#9A918A' }}>×{item.quantity}</span></span>
            <span style={{ color: '#1A1A18', fontWeight: 500 }}>₹{((item.price * item.quantity) / 100).toLocaleString('en-IN')}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', fontWeight: 600, fontSize: '14px' }}>
          <span>Total</span>
          <span>₹{(order.total_amount / 100).toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Shipping + Payment */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
        <div>
          <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A918A', marginBottom: '6px' }}>Shipping to</p>
          <p style={{ margin: 0, color: '#1A1A18', lineHeight: 1.6 }}>{fullAddress}</p>
        </div>
        <div>
          <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A918A', marginBottom: '6px' }}>Payment</p>
          <p style={{ margin: 0, color: '#1A1A18' }}>{isCod ? '🏠 Cash on Delivery' : '💳 Paid Online'}</p>
          <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A918A', marginTop: '10px', marginBottom: '6px' }}>Placed on</p>
          <p style={{ margin: 0, color: '#1A1A18' }}>
            {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  )
}

export function AccountClient({ name, image, sessionEmail }: Props) {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [refreshingOrders, setRefreshingOrders] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    if (sessionEmail) {
      fetchOrders(sessionEmail)
      const interval = setInterval(() => silentRefreshOrders(sessionEmail), 30000)
      return () => clearInterval(interval)
    }
  }, [sessionEmail])

  async function fetchOrders(emailToSearch: string) {
    if (!emailToSearch) return
    setLoadingOrders(true)
    await loadOrders(emailToSearch)
    setLoadingOrders(false)
  }

  async function silentRefreshOrders(emailToSearch: string) {
    if (!emailToSearch) return
    setRefreshingOrders(true)
    await loadOrders(emailToSearch)
    setRefreshingOrders(false)
  }

  async function loadOrders(emailToSearch: string) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 12000)
    try {
      const res = await fetch(
        `/api/orders/by-email?email=${encodeURIComponent(emailToSearch)}`,
        { signal: controller.signal, cache: 'no-store' }
      )
      if (res.ok) {
        setOrders(await res.json())
        setLastUpdated(new Date())
      } else setOrders([])
    } catch {
      setOrders([])
    } finally {
      clearTimeout(timeout)
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '56px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px', flexWrap: 'wrap' }}>
        {image && <img src={image} alt="" style={{ width: '56px', height: '56px', borderRadius: '50%' }} />}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9906A', margin: '0 0 4px' }}>My Account</p>
          <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.8rem', color: '#1A1A18', margin: 0 }}>{name}</h1>
        </div>
      </div>

      {/* Order History */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.4rem', color: '#1A1A18', margin: 0 }}>Order History</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {lastUpdated && !loadingOrders && (
              <span style={{ fontSize: '11px', color: '#B0A8A0' }}>
                {refreshingOrders ? 'Refreshing…' : `Updated ${lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
              </span>
            )}
            {sessionEmail && !loadingOrders && (
              <button
                onClick={() => silentRefreshOrders(sessionEmail)}
                disabled={refreshingOrders}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '100px', border: '1.5px solid #E4DBD0', background: 'white', fontSize: '11px', fontWeight: 500, color: '#6B6560', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.12s', opacity: refreshingOrders ? 0.6 : 1 }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#1A1A18')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#E4DBD0')}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={refreshingOrders ? { animation: 'spin 1s linear infinite' } : {}}>
                  <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                Refresh
              </button>
            )}
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        {loadingOrders && <p style={{ color: '#9A918A', fontSize: '13px' }}>Loading orders…</p>}

        {orders !== null && !loadingOrders && (
          orders.length === 0 ? (
            <div style={{ background: 'white', border: '1px solid #E4DBD0', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#9A918A' }}>
              <p style={{ margin: '0 0 16px' }}>No orders found.</p>
              <Link href="/shop" style={{ color: '#C9906A', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>Browse the shop →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {orders.map((order) => {
                const isOpen = expandedId === order.id
                const items = order.items as { name: string; quantity: number }[]
                return (
                  <div key={order.id} style={{ background: 'white', border: `1.5px solid ${isOpen ? '#1A1A18' : '#E4DBD0'}`, borderRadius: '12px', padding: '16px 20px', transition: 'border-color 0.15s' }}>
                    {/* Row — click to toggle */}
                    <div
                      onClick={() => setExpandedId(isOpen ? null : order.id)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', cursor: 'pointer' }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '3px' }}>Order #{order.id}</div>
                        <div style={{ fontSize: '12px', color: '#9A918A' }}>
                          {items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                        </div>
                        <div style={{ fontSize: '11px', color: '#C0B8B0', marginTop: '2px' }}>
                          {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>₹{(order.total_amount / 100).toLocaleString('en-IN')}</div>
                          <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: statusColor[order.status] ?? '#9A918A' }}>
                            {statusLabel[order.status] ?? order.status}
                          </span>
                        </div>
                        <svg
                          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A918A" strokeWidth="2" strokeLinecap="round"
                          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
                        >
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </div>
                    </div>

                    {/* Expandable detail */}
                    {isOpen && <OrderDetail order={order} />}
                  </div>
                )
              })}
            </div>
          )
        )}

        {orders === null && !loadingOrders && (
          <div style={{ background: 'white', border: '1px solid #E4DBD0', borderRadius: '12px', padding: '32px', textAlign: 'center', color: '#9A918A', fontSize: '13px' }}>
            No order history available.
          </div>
        )}
      </section>

      {/* Wishlist shortcut */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.4rem', color: '#1A1A18', margin: 0 }}>Wishlist</h2>
          <Link href="/wishlist" style={{ fontSize: '13px', color: '#C9906A', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
        </div>
        <div style={{ background: 'white', border: '1px solid #E4DBD0', borderRadius: '12px', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#6B6560' }}>View and manage your saved items.</p>
          <Link href="/wishlist" style={{ flexShrink: 0, background: '#1A1A18', color: '#F8F5F0', padding: '10px 20px', borderRadius: '100px', textDecoration: 'none', fontSize: '12px', fontWeight: 500, letterSpacing: '0.04em' }}>
            My Wishlist
          </Link>
        </div>
      </section>
    </div>
  )
}
