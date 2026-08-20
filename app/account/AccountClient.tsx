'use client'

import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import type { Order, Product } from '@/types'

interface Props {
  name: string
  image: string | null
  sessionEmail: string
}

export function AccountClient({ name, image, sessionEmail }: Props) {
  const [email, setEmail] = useState(sessionEmail)
  const [searchEmail, setSearchEmail] = useState(sessionEmail)
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [wishlist, setWishlist] = useState<Product[]>([])

  // Load wishlist from localStorage
  useEffect(() => {
    async function loadWishlist() {
      const ids: number[] = JSON.parse(localStorage.getItem('pokecraft_wishlist') ?? '[]')
      if (!ids.length) { setWishlist([]); return }
      const res = await fetch(`/api/wishlist?ids=${ids.join(',')}`)
      if (res.ok) setWishlist(await res.json())
    }
    loadWishlist()
  }, [])

  // Auto-load orders for Google users
  useEffect(() => {
    if (sessionEmail) fetchOrders(sessionEmail)
  }, [sessionEmail])

  async function fetchOrders(emailToSearch: string) {
    if (!emailToSearch) return
    setLoadingOrders(true)
    const res = await fetch(`/api/orders/by-email?email=${encodeURIComponent(emailToSearch)}`)
    if (res.ok) setOrders(await res.json())
    else setOrders([])
    setLoadingOrders(false)
  }

  function removeFromWishlist(productId: number) {
    const ids: number[] = JSON.parse(localStorage.getItem('pokecraft_wishlist') ?? '[]')
    const next = ids.filter((id) => id !== productId)
    localStorage.setItem('pokecraft_wishlist', JSON.stringify(next))
    setWishlist((prev) => prev.filter((p) => p.id !== productId))
  }

  const statusColor: Record<string, string> = {
    placed: '#2D9E6B', shipped: '#3B82F6', delivered: '#1A1A18', pending: '#9A918A', cancelled: '#E05252', returned: '#9A918A',
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
        <button
          onClick={async () => {
            await signOut({ redirect: false })
            window.location.href = '/login'
          }}
          style={{ background: 'none', border: '1px solid #E4DBD0', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', color: '#6B6560' }}
        >
          Sign out
        </button>
      </div>

      {/* Order History */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.4rem', color: '#1A1A18', marginBottom: '16px' }}>Order History</h2>

        {!sessionEmail && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter the email you used at checkout"
              style={{ flex: 1, border: '1.5px solid #E4DBD0', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', fontFamily: 'inherit', background: 'white', outline: 'none' }}
            />
            <button
              onClick={() => { setSearchEmail(email); fetchOrders(email) }}
              style={{ background: '#1A1A18', color: '#F8F5F0', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Look up
            </button>
          </div>
        )}

        {loadingOrders && <p style={{ color: '#9A918A', fontSize: '13px' }}>Loading orders…</p>}

        {orders !== null && !loadingOrders && (
          orders.length === 0 ? (
            <div style={{ background: 'white', border: '1px solid #E4DBD0', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#9A918A' }}>
              <p style={{ margin: '0 0 16px' }}>No orders found{searchEmail ? ` for ${searchEmail}` : ''}.</p>
              <Link href="/shop" style={{ color: '#C9906A', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>Browse the shop →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orders.map((order) => (
                <div key={order.id} style={{ background: 'white', border: '1px solid #E4DBD0', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '4px' }}>Order #{order.id}</div>
                    <div style={{ fontSize: '12px', color: '#9A918A' }}>
                      {(order.items as { name: string; quantity: number }[]).map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                    </div>
                    <div style={{ fontSize: '11px', color: '#C0B8B0', marginTop: '2px' }}>
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>₹{(order.total_amount / 100).toLocaleString('en-IN')}</div>
                    <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: statusColor[order.status] ?? '#9A918A' }}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {orders === null && !loadingOrders && !sessionEmail && (
          <div style={{ background: 'white', border: '1px solid #E4DBD0', borderRadius: '12px', padding: '32px', textAlign: 'center', color: '#9A918A', fontSize: '13px' }}>
            Enter the email you used when placing your order to see your order history.
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
            {wishlist.map((p) => (
              <div key={p.id} style={{ background: 'white', border: '1px solid #E4DBD0', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                <button
                  onClick={() => removeFromWishlist(p.id)}
                  title="Remove"
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'white', border: '1px solid #E4DBD0', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#9A918A' }}
                >
                  ×
                </button>
                <Link href={`/shop/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '120px', objectFit: 'contain', background: '#F8F5F0', padding: '8px' }} />
                    : <div style={{ width: '100%', height: '120px', background: '#F8F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🧶</div>
                  }
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: '#C9906A' }}>₹{(p.price / 100).toLocaleString('en-IN')}</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
