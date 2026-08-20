import { sql } from '@/lib/db'
import { auth } from '@/auth'
import type { Order, Product } from '@/types'
import { AdminOrders } from './AdminOrders'
import { AdminProducts } from './AdminProducts'
import { AdminTopBar } from './AdminTopBar'

export const dynamic = 'force-dynamic'

async function getData() {
  const [orders, products] = await Promise.all([
    sql`SELECT * FROM orders ORDER BY created_at DESC`,
    sql`SELECT * FROM products ORDER BY id`,
  ])
  return { orders: orders as Order[], products: products as Product[] }
}

export default async function AdminPage() {
  const [{ orders, products }, session] = await Promise.all([getData(), auth()])
  const adminName = session?.user?.name ?? 'Admin'
  const adminImage = session?.user?.image ?? null

  return (
    <div>
      <AdminTopBar name={adminName} image={adminImage} orders={orders} />

    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9906A', marginBottom: '8px' }}>Dashboard</p>
        <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '2rem', color: '#1A1A18', margin: 0 }}>Admin Panel</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '48px' }}>
        {[
          { label: 'Total Orders', value: orders.length },
          { label: 'Placed Orders', value: orders.filter(o => o.status === 'placed').length },
          { label: 'Total Revenue', value: '₹' + (orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total_amount, 0) / 100).toLocaleString('en-IN') },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'white', border: '1px solid #E4DBD0', borderRadius: '12px', padding: '20px 24px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A918A', margin: '0 0 8px' }}>{label}</p>
            <p style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '2rem', color: '#1A1A18', margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      <AdminOrders orders={orders} />
      <AdminProducts products={products} />
    </div>
    </div>
  )
}
