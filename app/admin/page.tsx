'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import type { Order, Product } from '@/types'

const STATUS_COLOR: Record<string, string> = {
  placed: '#2D9E6B', shipped: '#3B82F6', delivered: '#1A1A18',
  pending: '#E5A800', cancelled: '#E05252', returned: '#9A918A',
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending', placed: 'Confirmed', shipped: 'Shipped',
  delivered: 'Delivered', cancelled: 'Cancelled', returned: 'Returned',
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await fetch('/api/admin/stats', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders)
        setProducts(data.products)
        setLastUpdated(new Date())
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData(true), 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  const placed = orders.filter(o => o.status === 'placed').length
  const shipped = orders.filter(o => o.status === 'shipped').length
  const revenue = orders
    .filter(o => !['cancelled', 'returned'].includes(o.status))
    .reduce((s, o) => s + o.total_amount, 0)
  const outOfStock = products.filter(p => p.stock_count === 0).length
  const lowStock = products.filter(p => p.stock_count > 0 && p.stock_count <= 3).length
  const recentOrders = orders.slice(0, 6)

  return (
    <>
      <style>{`
        .stat-card { transition: box-shadow 0.15s, transform 0.15s; cursor: pointer; }
        .stat-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.1); transform: translateY(-1px); }
        .quick-link { transition: opacity 0.12s, transform 0.15s; }
        .quick-link:hover { opacity: 0.9; transform: translateY(-1px); }
        .recent-order-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 20px; font-size: 13px;
          border-bottom: 1px solid #F5F0EB; gap: 12px;
          transition: background 0.1s;
        }
        .recent-order-row:last-child { border-bottom: none; }
        .recent-order-row:hover { background: #FDFAF7; }
        .recent-order-left { display: flex; align-items: center; gap: 16px; min-width: 0; }
        .recent-order-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .refresh-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 100px; font-size: 11px;
          font-weight: 500; letter-spacing: 0.04em;
          border: 1.5px solid #E4DBD0; background: white;
          color: #6B6560; cursor: pointer; font-family: inherit;
          transition: border-color 0.12s, color 0.12s;
        }
        .refresh-btn:hover { border-color: #1A1A18; color: #1A1A18; }
        .refresh-spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .skeleton { background: linear-gradient(90deg, #F0EBE1 25%, #E8E0D6 50%, #F0EBE1 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
        @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
        @media (max-width: 540px) {
          .admin-dash-pad { padding: 24px 14px !important; }
          .recent-order-row { padding: 12px 14px; flex-wrap: wrap; gap: 8px; }
          .recent-order-right { gap: 8px; }
          .quick-links-grid { grid-template-columns: 1fr !important; }
          .recent-order-buyer-email { display: none; }
        }
      `}</style>

      <div className="admin-dash-pad" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '36px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9906A', margin: '0 0 6px' }}>Overview</p>
            <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '2rem', color: '#1A1A18', margin: 0 }}>Dashboard</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {lastUpdated && (
              <span style={{ fontSize: '11px', color: '#B0A8A0' }}>
                Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button className="refresh-btn" onClick={() => fetchData(true)} disabled={refreshing}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                className={refreshing ? 'refresh-spin' : ''}>
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '40px' }}>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '82px' }} />
            ))
          ) : (
            ([
              { label: 'Total Orders', value: orders.length, href: '/admin/orders' },
              { label: 'Awaiting Dispatch', value: placed, href: '/admin/orders', alert: placed > 0 },
              { label: 'Shipped', value: shipped, href: '/admin/orders' },
              { label: 'Revenue', value: '₹' + (revenue / 100).toLocaleString('en-IN'), href: '/admin/orders' },
              { label: 'Out of Stock', value: outOfStock, href: '/admin/inventory', alert: outOfStock > 0 },
              { label: 'Low Stock (≤3)', value: lowStock, href: '/admin/inventory', warn: lowStock > 0 },
            ] as { label: string; value: number | string; href: string; alert?: boolean; warn?: boolean }[]).map(({ label, value, href, alert, warn }) => (
              <Link key={label} href={href} style={{ textDecoration: 'none' }}>
                <div className="stat-card" style={{
                  background: 'white',
                  border: `1px solid ${alert ? '#FCC' : warn ? '#FDEFC3' : '#E4DBD0'}`,
                  borderRadius: '12px', padding: '18px 20px',
                }}>
                  <p style={{ margin: '0 0 8px', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: alert ? '#E05252' : warn ? '#E5A800' : '#9A918A' }}>{label}</p>
                  <p style={{ margin: 0, fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.8rem', color: alert ? '#E05252' : warn ? '#E5A800' : '#1A1A18' }}>{value}</p>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Quick links */}
        <div className="quick-links-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '40px' }}>
          <Link href="/admin/orders" className="quick-link" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#1A1A18', borderRadius: '12px', padding: '22px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#C9906A' }}>Manage</p>
                <p style={{ margin: 0, fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.3rem', color: '#F8F5F0' }}>Orders</p>
                {!loading && placed > 0 && (
                  <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#E05252', fontWeight: 600 }}>{placed} awaiting dispatch</p>
                )}
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9906A" strokeWidth="1.8" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </Link>
          <Link href="/admin/inventory" className="quick-link" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'white', border: '1px solid #E4DBD0', borderRadius: '12px', padding: '22px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#C9906A' }}>Manage</p>
                <p style={{ margin: 0, fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.3rem', color: '#1A1A18' }}>Inventory</p>
                {!loading && outOfStock > 0 && (
                  <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#E05252', fontWeight: 600 }}>{outOfStock} out of stock</p>
                )}
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9906A" strokeWidth="1.8" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </Link>
        </div>

        {/* Recent orders */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.3rem', color: '#1A1A18', margin: 0 }}>Recent Orders</h2>
            <Link href="/admin/orders" style={{ fontSize: '12px', color: '#C9906A', textDecoration: 'none' }}>View all →</Link>
          </div>
          <div style={{ background: 'white', border: '1px solid #E4DBD0', borderRadius: '12px', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '20px' }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '44px', marginBottom: '8px', borderRadius: '6px' }} />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <p style={{ padding: '40px', textAlign: 'center', color: '#9A918A', margin: 0 }}>No orders yet.</p>
            ) : (
              recentOrders.map((order) => (
                <Link key={order.id} href="/admin/orders" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="recent-order-row">
                    <div className="recent-order-left">
                      <span style={{ color: '#9A918A', fontWeight: 500, minWidth: '36px', flexShrink: 0 }}>#{order.id}</span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.buyer_name}</p>
                        <p className="recent-order-buyer-email" style={{ margin: 0, fontSize: '11px', color: '#9A918A' }}>
                          {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="recent-order-right">
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>₹{(order.total_amount / 100).toLocaleString('en-IN')}</span>
                      <span style={{
                        fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                        padding: '3px 10px', borderRadius: '100px',
                        background: (STATUS_COLOR[order.status] ?? '#9A918A') + '22',
                        color: STATUS_COLOR[order.status] ?? '#9A918A', whiteSpace: 'nowrap',
                      }}>
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
