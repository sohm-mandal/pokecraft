'use client'

import Link from 'next/link'
import { useWishlist } from '@/lib/context/WishlistContext'
import { useCart } from '@/lib/context/CartContext'

export function WishlistClient() {
  const { products, loading, removeItem } = useWishlist()
  const { addItem, inCart } = useCart()

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 24px', textAlign: 'center', color: '#9A918A', fontSize: '15px' }}>
        Loading wishlist…
      </div>
    )
  }

  return (
    <div className="wishlist-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '56px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '36px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9906A', margin: '0 0 4px' }}>My Wishlist</p>
          <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '2rem', color: '#1A1A18', margin: 0 }}>
            Saved Items {products.length > 0 && <span style={{ fontSize: '1.1rem', color: '#9A918A', fontWeight: 400 }}>({products.length})</span>}
          </h1>
        </div>
        <Link href="/shop" style={{ fontSize: '13px', color: '#9A918A', textDecoration: 'none' }}>← Continue shopping</Link>
      </div>

      {products.length === 0 ? (
        <div style={{ background: 'white', border: '1px solid #E4DBD0', borderRadius: '16px', padding: '64px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤍</div>
          <p style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.4rem', color: '#1A1A18', margin: '0 0 8px' }}>Your wishlist is empty</p>
          <p style={{ color: '#9A918A', fontSize: '14px', margin: '0 0 28px' }}>Save items you love and come back to them later.</p>
          <Link href="/shop" style={{ display: 'inline-block', background: '#1A1A18', color: '#F8F5F0', padding: '13px 32px', borderRadius: '100px', textDecoration: 'none', fontSize: '13px', fontWeight: 500, letterSpacing: '0.04em' }}>
            Browse the Shop
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {products.map((p) => (
            <div key={p.id} className="wishlist-row">
              {/* Image */}
              <Link href={`/shop/${p.slug}`} className="wishlist-row-media">
                {p.images?.[0]
                  ? <img src={p.images[0]} alt={p.name} className="wishlist-row-thumb" />
                  : <div className="wishlist-row-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🧶</div>
                }
              </Link>

              {/* Info */}
              <div className="wishlist-row-info">
                <Link href={`/shop/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '15px', color: '#1A1A18' }}>{p.name}</p>
                </Link>
                <p style={{ margin: 0, fontSize: '14px', color: '#C9906A', fontWeight: 500 }}>
                  ₹{(p.price / 100).toLocaleString('en-IN')}
                </p>
                {p.stock_count === 0 && (
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#E05252', fontWeight: 500 }}>Out of stock</p>
                )}
              </div>

              {/* Actions */}
              <div className="wishlist-row-actions">
                {p.stock_count > 0 && (
                  <button
                    onClick={() => addItem(p.id, 1)}
                    style={{
                      background: inCart(p.id) ? '#F0EBE1' : '#1A1A18',
                      color: inCart(p.id) ? '#1A1A18' : '#F8F5F0',
                      border: 'none', borderRadius: '100px',
                      padding: '9px 20px', fontSize: '12px', fontWeight: 500,
                      letterSpacing: '0.04em', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {inCart(p.id) ? 'In Cart ✓' : 'Add to Cart'}
                  </button>
                )}
                <button
                  onClick={() => removeItem(p.id)}
                  title="Remove from wishlist"
                  style={{ background: 'none', border: '1px solid #E4DBD0', borderRadius: '100px', padding: '9px 16px', fontSize: '12px', color: '#9A918A', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
