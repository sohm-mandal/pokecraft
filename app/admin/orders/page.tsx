import { sql } from '@/lib/db'
import type { Order } from '@/types'
import { OrdersClient } from './OrdersClient'

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  const rows = await sql`SELECT * FROM orders ORDER BY created_at DESC`
  const orders = rows as Order[]

  const placed = orders.filter(o => o.status === 'placed').length
  const shipped = orders.filter(o => o.status === 'shipped').length
  const revenue = orders
    .filter(o => !['cancelled', 'returned'].includes(o.status))
    .reduce((s, o) => s + o.total_amount, 0)

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9906A', margin: '0 0 6px' }}>Admin</p>
        <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '2rem', color: '#1A1A18', margin: '0 0 20px' }}>Orders</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Total', value: orders.length },
            { label: 'Awaiting dispatch', value: placed, alert: placed > 0 },
            { label: 'Shipped', value: shipped },
            { label: 'Revenue', value: '₹' + (revenue / 100).toLocaleString('en-IN') },
          ].map(({ label, value, alert }) => (
            <div key={label} style={{ background: 'white', border: `1px solid ${alert ? '#FCC' : '#E4DBD0'}`, borderRadius: '10px', padding: '16px 20px' }}>
              <p style={{ margin: '0 0 4px', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: alert ? '#E05252' : '#9A918A' }}>{label}</p>
              <p style={{ margin: 0, fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.6rem', color: alert ? '#E05252' : '#1A1A18' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      <OrdersClient orders={orders} />
    </div>
  )
}
