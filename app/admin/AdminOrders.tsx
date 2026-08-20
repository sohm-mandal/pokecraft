'use client'

import { useState } from 'react'
import type { Order, OrderStatus } from '@/types'

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#E5A800',
  placed: '#2D9E6B',
  shipped: '#3B82F6',
  delivered: '#1A1A18',
  cancelled: '#E05252',
  returned: '#9A918A',
}

export function AdminOrders({ orders }: { orders: Order[] }) {
  const [list, setList] = useState(orders)
  const [updating, setUpdating] = useState<number | null>(null)

  async function updateStatus(id: number, status: OrderStatus) {
    setUpdating(id)
    await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setList(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    setUpdating(null)
  }

  return (
    <div style={{ marginBottom: '56px' }}>
      <h2 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.5rem', color: '#1A1A18', marginBottom: '20px' }}>Orders</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E4DBD0' }}>
              {['#', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A918A', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid #F0EAE0' }}>
                <td style={{ padding: '12px' }}>{order.id}</td>
                <td style={{ padding: '12px' }}>
                  <div style={{ fontWeight: 500 }}>{order.buyer_name}</div>
                  <div style={{ color: '#9A918A', fontSize: '11px' }}>{order.buyer_email}</div>
                </td>
                <td style={{ padding: '12px', color: '#6B6560' }}>
                  {(order.items as { name: string; quantity: number }[]).map(i => `${i.name} ×${i.quantity}`).join(', ')}
                </td>
                <td style={{ padding: '12px', fontWeight: 500 }}>
                  ₹{(order.total_amount / 100).toLocaleString('en-IN')}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ background: STATUS_COLORS[order.status] + '20', color: STATUS_COLORS[order.status], padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: '12px', color: '#9A918A', whiteSpace: 'nowrap' }}>
                  {new Date(order.created_at).toLocaleDateString('en-IN')}
                </td>
                <td style={{ padding: '12px' }}>
                  <select
                    disabled={updating === order.id}
                    value={order.status}
                    onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                    style={{ border: '1px solid #E4DBD0', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', fontFamily: 'inherit', background: 'white', cursor: 'pointer' }}
                  >
                    {(['pending','placed','shipped','delivered','cancelled','returned'] as OrderStatus[]).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
