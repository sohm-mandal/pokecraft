import { auth } from '@/auth'
import { sql } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Order, Product } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user?.email) redirect('/login')

  const [orderRows, userRows, wishlistRows] = await Promise.all([
    sql`SELECT * FROM orders WHERE buyer_email = ${session.user.email} ORDER BY created_at DESC`,
    sql`SELECT * FROM users WHERE email = ${session.user.email} LIMIT 1`,
    sql`
      SELECT p.* FROM wishlists w
      JOIN products p ON p.id = w.product_id
      WHERE w.user_id = (SELECT id FROM users WHERE email = ${session.user.email})
    `,
  ])

  const orders = orderRows as Order[]
  const wishlist = wishlistRows as Product[]

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '56px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px' }}>
        {session.user.image && <img src={session.user.image} alt="" style={{ width: '56px', height: '56px', borderRadius: '50%' }} />}
        <div>
          <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9906A', margin: '0 0 4px' }}>My Account</p>
          <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.8rem', color: '#1A1A18', margin: 0 }}>{session.user.name}</h1>
          <p style={{ fontSize: '13px', color: '#9A918A', margin: '2px 0 0' }}>{session.user.email}</p>
        </div>
        <form action="/api/auth/signout" method="POST" style={{ marginLeft: 'auto' }}>
          <button style={{ background: 'none', border: '1px solid #E4DBD0', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', color: '#6B6560' }}>Sign out</button>
        </form>
      </div>

      {/* Order History */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.4rem', color: '#1A1A18', marginBottom: '20px' }}>Order History</h2>
        {orders.length === 0 ? (
          <div style={{ background: 'white', border: '1px solid #E4DBD0', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#9A918A' }}>
            <p style={{ margin: '0 0 16px' }}>No orders yet.</p>
            <Link href="/shop" style={{ color: '#C9906A', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>Browse the shop →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orders.map(order => (
              <div key={order.id} style={{ background: 'white', border: '1px solid #E4DBD0', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '4px' }}>Order #{order.id}</div>
                  <div style={{ fontSize: '12px', color: '#9A918A' }}>
                    {(order.items as { name: string; quantity: number }[]).map(i => `${i.name} ×${i.quantity}`).join(', ')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>₹{(order.total_amount / 100).toLocaleString('en-IN')}</div>
                  <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: order.status === 'placed' ? '#2D9E6B' : order.status === 'shipped' ? '#3B82F6' : order.status === 'delivered' ? '#1A1A18' : '#9A918A' }}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Wishlist */}
      <section>
        <h2 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.4rem', color: '#1A1A18', marginBottom: '20px' }}>Wishlist</h2>
        {wishlist.length === 0 ? (
          <div style={{ background: 'white', border: '1px solid #E4DBD0', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#9A918A' }}>
            <p style={{ margin: '0 0 16px' }}>Your wishlist is empty.</p>
            <Link href="/shop" style={{ color: '#C9906A', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>Browse the shop →</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {wishlist.map(p => (
              <Link key={p.id} href={`/shop/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: 'white', border: '1px solid #E4DBD0', borderRadius: '12px', overflow: 'hidden' }}>
                  {p.image_url && <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '120px', objectFit: 'contain', background: '#F8F5F0', padding: '8px' }} />}
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: '#C9906A' }}>₹{(p.price / 100).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
