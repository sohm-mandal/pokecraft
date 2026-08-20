import { sql } from '@/lib/db'
import Link from 'next/link'
import type { Order, Product } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [orderRows, productRows] = await Promise.all([
    sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 100`,
    sql`SELECT * FROM products ORDER BY id`,
  ])
  const orders = orderRows as Order[]
  const products = productRows as Product[]

  const placed = orders.filter(o => o.status === 'placed').length
  const shipped = orders.filter(o => o.status === 'shipped').length
  const revenue = orders
    .filter(o => !['cancelled', 'returned'].includes(o.status))
    .reduce((s, o) => s + o.total_amount, 0)
  const outOfStock = products.filter(p => p.stock_count === 0).length
  const lowStock = products.filter(p => p.stock_count > 0 && p.stock_count <= 3).length

  const recentOrders = orders.slice(0, 6)

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: '36px' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9906A', margin: '0 0 6px' }}>Overview</p>
        <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '2rem', color: '#1A1A18', margin: 0 }}>Dashboard</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '40px' }}>
        {[
          { label: 'Total Orders', value: orders.length, href: '/admin/orders' },
          { label: 'Awaiting Dispatch', value: placed, href: '/admin/orders', alert: placed > 0 },
          { label: 'Shipped', value: shipped, href: '/admin/orders' },
          { label: 'Revenue', value: '₹' + (revenue / 100).toLocaleString('en-IN'), href: '/admin/orders' },
          { label: 'Out of Stock', value: outOfStock, href: '/admin/inventory', alert: outOfStock > 0 },
          { label: 'Low Stock (≤3)', value: lowStock, href: '/admin/inventory', warn: lowStock > 0 },
        ].map(({ label, value, href, alert, warn }) => (
          <Link key={label} href={href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'white',
              border: `1px solid ${alert ? '#FCC' : warn ? '#FDEFC3' : '#E4DBD0'}`,
              borderRadius: '12px', padding: '20px 24px',
              transition: 'box-shadow 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
            >
              <p style={{ margin: '0 0 8px', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: alert ? '#E05252' : warn ? '#E5A800' : '#9A918A' }}>{label}</p>
              <p style={{ margin: 0, fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '2rem', color: alert ? '#E05252' : warn ? '#E5A800' : '#1A1A18' }}>{value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
        <Link href="/admin/orders" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#1A1A18', borderRadius: '12px', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#C9906A' }}>Manage</p>
              <p style={{ margin: 0, fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.4rem', color: '#F8F5F0' }}>Orders</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9906A" strokeWidth="1.8" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </Link>
        <Link href="/admin/inventory" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'white', border: '1px solid #E4DBD0', borderRadius: '12px', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#C9906A' }}>Manage</p>
              <p style={{ margin: 0, fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.4rem', color: '#1A1A18' }}>Inventory</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9906A" strokeWidth="1.8" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </Link>
      </div>

      {/* Recent orders snapshot */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.3rem', color: '#1A1A18', margin: 0 }}>Recent Orders</h2>
          <Link href="/admin/orders" style={{ fontSize: '12px', color: '#C9906A', textDecoration: 'none' }}>View all →</Link>
        </div>
        <div style={{ background: 'white', border: '1px solid #E4DBD0', borderRadius: '12px', overflow: 'hidden' }}>
          {recentOrders.length === 0 ? (
            <p style={{ padding: '32px', textAlign: 'center', color: '#9A918A', margin: 0 }}>No orders yet.</p>
          ) : (
            recentOrders.map((order, i) => (
              <div key={order.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < recentOrders.length - 1 ? '1px solid #F5F0EB' : 'none', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ color: '#9A918A', fontWeight: 500, minWidth: '36px' }}>#{order.id}</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 500 }}>{order.buyer_name}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#9A918A' }}>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontWeight: 600 }}>₹{(order.total_amount / 100).toLocaleString('en-IN')}</span>
                  <span style={{
                    fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                    padding: '3px 10px', borderRadius: '100px',
                    background: ({ placed: '#2D9E6B22', shipped: '#3B82F622', delivered: '#1A1A1822', pending: '#E5A80022', cancelled: '#E0525222', returned: '#9A918A22' } as Record<string, string>)[order.status] ?? '#9A918A22',
                    color: ({ placed: '#2D9E6B', shipped: '#3B82F6', delivered: '#1A1A18', pending: '#E5A800', cancelled: '#E05252', returned: '#9A918A' } as Record<string, string>)[order.status] ?? '#9A918A',
                  }}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
