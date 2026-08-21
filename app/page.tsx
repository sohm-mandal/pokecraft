import Link from 'next/link'
import { sql } from '@/lib/db'
import type { Product } from '@/types'
import { ProductCard } from '@/components/ProductCard'
import { StarBackground } from '@/components/StarBackground'

export const dynamic = 'force-dynamic'

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const rows = await sql`SELECT * FROM products ORDER BY id LIMIT 4`
    return rows as Product[]
  } catch {
    return []
  }
}

export default async function HomePage() {
  const products = await getFeaturedProducts()

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero-section" style={{ position: 'relative', overflow: 'hidden', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <StarBackground />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '72px 24px', maxWidth: '640px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-accent)', fontWeight: 500, marginBottom: '28px' }}>
            Handmade Crochet Pokémon
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(42px, 7vw, 68px)', fontWeight: 500, lineHeight: 1.06, letterSpacing: '-0.02em', color: 'var(--color-ink)', marginBottom: '24px' }}>
            Handmade with love.<br/>Made to be yours.{' '}
            <span style={{ color: '#C9A040' }}>♥</span>
          </h1>
          <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--color-muted-2)', fontWeight: 300, marginBottom: '48px' }}>
            Adorable, high-quality crochet Pokémon made with premium yarn and endless care.
          </p>
          <Link
            href="/shop"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'var(--color-ink)', color: 'var(--color-fg-on-ink)', padding: '15px 40px', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, textDecoration: 'none' }}
          >
            Shop Collection
          </Link>
        </div>
      </section>

      {/* ── BENEFITS BAR ── */}
      <div style={{ background: '#F0EBE1', borderTop: '1px solid #E4DBD0', borderBottom: '1px solid #E4DBD0', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflowX: 'auto' }}>
        {[
          { icon: '☕', label: '100% Handmade' },
          { icon: '🛡️', label: 'Premium Quality' },
          { icon: '❤️', label: 'Made to Order' },
          { icon: '🌐', label: 'Worldwide Shipping' },
        ].map(({ icon, label }, i, arr) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 48px' }}>
              <span style={{ fontSize: '18px' }}>{icon}</span>
              <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500, color: '#2A2520' }}>{label}</span>
            </div>
            {i < arr.length - 1 && <div style={{ width: '1px', height: '28px', background: '#D8D0C5' }} />}
          </div>
        ))}
      </div>

      {/* ── BEST SELLERS ── */}
      {products.length > 0 && (
        <section style={{ padding: '56px 20px 72px', background: '#F8F5F0' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ fontSize: '10px', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#9A918A', display: 'block', marginBottom: '12px' }}>
              Our Most Loved
            </span>
            <h2 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '34px', fontWeight: 500, color: '#1A1A18', letterSpacing: '-0.01em', margin: 0 }}>
              Best Sellers
            </h2>
          </div>
          <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
            <div className="products-grid" style={{ marginBottom: '40px' }}>
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <Link
                href="/shop"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', border: '1.5px solid #1A1A18', color: '#1A1A18', padding: '12px 36px', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, textDecoration: 'none' }}
              >
                View All Plushies
              </Link>
            </div>
          </div>
        </section>
      )}

      <style>{`
        .hero-section { min-height: 540px; }
        .products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        @media (max-width: 768px) {
          .hero-section { min-height: 420px; }
          .products-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
        }
        @media (max-width: 480px) {
          .products-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
        }
      `}</style>
    </>
  )
}
