import { sql } from '@/lib/db'
import type { Product } from '@/types'
import { AdminProducts } from '../AdminProducts'

export const dynamic = 'force-dynamic'

export default async function AdminInventoryPage() {
  const rows = await sql`SELECT * FROM products ORDER BY id`
  const products = rows as Product[]

  const outOfStock = products.filter(p => p.stock_count === 0).length
  const lowStock = products.filter(p => p.stock_count > 0 && p.stock_count <= 3).length

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9906A', margin: '0 0 6px' }}>Admin</p>
        <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '2rem', color: '#1A1A18', margin: '0 0 20px' }}>Inventory</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Total Products', value: products.length },
            { label: 'Out of Stock', value: outOfStock, alert: outOfStock > 0 },
            { label: 'Low Stock (≤3)', value: lowStock, warn: lowStock > 0 },
          ].map(({ label, value, alert, warn }) => (
            <div key={label} style={{ background: 'white', border: `1px solid ${alert ? '#FCC' : warn ? '#FDEFC3' : '#E4DBD0'}`, borderRadius: '10px', padding: '16px 20px' }}>
              <p style={{ margin: '0 0 4px', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: alert ? '#E05252' : warn ? '#E5A800' : '#9A918A' }}>{label}</p>
              <p style={{ margin: 0, fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.6rem', color: alert ? '#E05252' : warn ? '#E5A800' : '#1A1A18' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      <AdminProducts products={products} />
    </div>
  )
}
