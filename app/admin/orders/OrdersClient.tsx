'use client'

import { useState } from 'react'
import type { Order, OrderItem, OrderStatus, ShippingAddress } from '@/types'

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: '#E5A800', placed: '#2D9E6B', shipped: '#3B82F6',
  delivered: '#1A1A18', cancelled: '#E05252', returned: '#9A918A',
}
const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending', placed: 'Confirmed', shipped: 'Shipped',
  delivered: 'Delivered', cancelled: 'Cancelled', returned: 'Returned',
}
const ALL_STATUSES: OrderStatus[] = ['pending', 'placed', 'shipped', 'delivered', 'cancelled', 'returned']

function EmailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function send() {
    if (!subject.trim() || !message.trim()) return
    setSending(true)
    const res = await fetch('/api/admin/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, subject, message }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok) { setSent(true); setTimeout(onClose, 1500) }
    else { alert(`Failed to send email: ${data.detail ?? data.error ?? res.status}`); setSending(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Email Customer</h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9A918A' }}>To: {order.buyer_name} &lt;{order.buyer_email}&gt;</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#9A918A', padding: '4px' }}>×</button>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#2D9E6B', fontWeight: 500 }}>
            ✓ Email sent successfully
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B6560', display: 'block', marginBottom: '4px' }}>Subject</label>
              <input
                value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Your order has been shipped!"
                style={{ width: '100%', border: '1px solid #E4DBD0', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B6560', display: 'block', marginBottom: '4px' }}>Message</label>
              <textarea
                value={message} onChange={e => setMessage(e.target.value)}
                rows={6}
                placeholder="Type your message to the customer..."
                style={{ width: '100%', border: '1px solid #E4DBD0', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={{ border: '1px solid #E4DBD0', background: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px' }}>
                Cancel
              </button>
              <button
                onClick={send} disabled={sending || !subject.trim() || !message.trim()}
                style={{ background: sending ? '#9A918A' : '#1A1A18', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: 500 }}
              >
                {sending ? 'Sending…' : 'Send Email'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function OrderRow({ order, onStatusChange }: { order: Order; onStatusChange: (id: number, s: OrderStatus) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [emailModal, setEmailModal] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(order)

  const items = currentOrder.items as OrderItem[]
  const addr = currentOrder.shipping_address as ShippingAddress
  const isCod = currentOrder.razorpay_order_id?.startsWith('COD-')

  async function updateStatus(status: OrderStatus) {
    setUpdating(true)
    await fetch(`/api/orders/${currentOrder.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setCurrentOrder(o => ({ ...o, status }))
    onStatusChange(currentOrder.id, status)
    setUpdating(false)
  }

  return (
    <>
      <div style={{ background: 'white', border: `1.5px solid ${expanded ? '#1A1A18' : '#E4DBD0'}`, borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.15s' }}>
        {/* Summary row */}
        <div
          onClick={() => setExpanded(v => !v)}
          style={{ display: 'grid', gridTemplateColumns: '60px 1fr 120px 100px 120px 36px', alignItems: 'center', gap: '12px', padding: '14px 20px', cursor: 'pointer' }}
        >
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#9A918A' }}>#{currentOrder.id}</div>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '13px' }}>{currentOrder.buyer_name}</p>
            <p style={{ margin: 0, fontSize: '11px', color: '#9A918A' }}>{currentOrder.buyer_email}</p>
          </div>
          <div style={{ fontSize: '12px', color: '#6B6560' }}>
            {new Date(currentOrder.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div style={{ fontWeight: 600, fontSize: '13px' }}>
            ₹{(currentOrder.total_amount / 100).toLocaleString('en-IN')}
          </div>
          <div>
            <span style={{
              background: STATUS_COLOR[currentOrder.status] + '22',
              color: STATUS_COLOR[currentOrder.status],
              padding: '3px 10px', borderRadius: '100px', fontSize: '10px',
              fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {STATUS_LABEL[currentOrder.status]}
            </span>
          </div>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9A918A" strokeWidth="2" strokeLinecap="round"
            style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div style={{ borderTop: '1px solid #F0EBE1', padding: '20px 20px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '20px' }}>

              {/* Items */}
              <div>
                <p style={{ margin: '0 0 10px', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A918A' }}>Items Ordered</p>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '5px 0', borderBottom: '1px solid #F5F0EB' }}>
                    <span>{item.name} <span style={{ color: '#9A918A' }}>×{item.quantity}</span></span>
                    <span style={{ fontWeight: 500 }}>₹{((item.price * item.quantity) / 100).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', fontWeight: 600, fontSize: '13px' }}>
                  <span>Total</span>
                  <span>₹{(currentOrder.total_amount / 100).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Shipping */}
              <div>
                <p style={{ margin: '0 0 10px', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A918A' }}>Ship To</p>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.7, color: '#1A1A18' }}>
                  {currentOrder.buyer_name}<br/>
                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br/>
                  {addr.city}, {addr.state} – {addr.pincode}
                </p>
                <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#9A918A' }}>
                  📞 {currentOrder.buyer_phone}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9A918A' }}>
                  {isCod ? '🏠 Cash on Delivery' : '💳 Paid Online'}
                </p>
              </div>

              {/* Actions */}
              <div>
                <p style={{ margin: '0 0 10px', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A918A' }}>Actions</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#6B6560', display: 'block', marginBottom: '4px' }}>Update Status</label>
                    <select
                      disabled={updating}
                      value={currentOrder.status}
                      onChange={e => updateStatus(e.target.value as OrderStatus)}
                      style={{ width: '100%', border: '1.5px solid #E4DBD0', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontFamily: 'inherit', background: 'white', cursor: 'pointer' }}
                    >
                      {ALL_STATUSES.map(s => (
                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                    {updating && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9A918A' }}>Updating…</p>}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setEmailModal(true) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center',
                      border: '1.5px solid #E4DBD0', background: 'white', borderRadius: '8px',
                      padding: '9px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
                      fontWeight: 500, transition: 'border-color 0.12s, background 0.12s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#1A1A18'; (e.currentTarget as HTMLButtonElement).style.background = '#F8F5F0' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E4DBD0'; (e.currentTarget as HTMLButtonElement).style.background = 'white' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Email Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {emailModal && <EmailModal order={currentOrder} onClose={() => setEmailModal(false)} />}
    </>
  )
}

export function OrdersClient({ orders: initial }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initial)
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')

  function onStatusChange(id: number, status: OrderStatus) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div>
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {(['all', ...ALL_STATUSES] as const).map(s => {
          const count = s === 'all' ? orders.length : orders.filter(o => o.status === s).length
          const active = filter === s
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '6px 14px', borderRadius: '100px', border: '1.5px solid',
                borderColor: active ? '#1A1A18' : '#E4DBD0',
                background: active ? '#1A1A18' : 'white',
                color: active ? 'white' : '#6B6560',
                fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
              }}
            >
              {s === 'all' ? 'All' : STATUS_LABEL[s]} ({count})
            </button>
          )
        })}
      </div>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 120px 100px 120px 36px', gap: '12px', padding: '0 20px 8px', marginBottom: '4px' }}>
        {['Order', 'Customer', 'Date', 'Total', 'Status', ''].map(h => (
          <span key={h} style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A918A', fontWeight: 500 }}>{h}</span>
        ))}
      </div>

      {/* Order rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9A918A', background: 'white', border: '1px solid #E4DBD0', borderRadius: '12px' }}>
            No orders with status "{filter}"
          </div>
        ) : (
          filtered.map(order => (
            <OrderRow key={order.id} order={order} onStatusChange={onStatusChange} />
          ))
        )}
      </div>
    </div>
  )
}
