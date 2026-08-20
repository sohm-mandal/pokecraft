import Link from 'next/link'
import { sql } from '@/lib/db'
import type { Product } from '@/types'
import { ProductCard } from '@/components/ProductCard'

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
      <section style={{ display: 'flex', height: '580px', overflow: 'hidden' }}>
        {/* Left */}
        <div style={{ width: '44%', padding: '64px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#F8F5F0' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9906A', fontWeight: 400, marginBottom: '24px' }}>
            Handmade Crochet Pokémon
          </p>
          <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '58px', fontWeight: 500, lineHeight: 1.06, letterSpacing: '-0.02em', color: '#1A1A18', marginBottom: '24px' }}>
            Handmade<br/>with love.<br/>Made to be<br/>yours. <span style={{ color: '#C9A040' }}>♥</span>
          </h1>
          <p style={{ fontSize: '15px', lineHeight: 1.65, color: '#6B6560', fontWeight: 300, maxWidth: '360px', marginBottom: '44px' }}>
            Adorable, high-quality crochet Pokémon made with premium yarn and endless care.
          </p>
          <Link
            href="/shop"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: '#1A1A18', color: '#F8F5F0', padding: '15px 32px', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, textDecoration: 'none', alignSelf: 'flex-start' }}
          >
            Shop Collection
          </Link>
        </div>

        {/* Right — hero visual */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#EDE6DA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Decorative crochet pattern background */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'radial-gradient(circle, #1A1A18 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
          {/* Center content */}
          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <div style={{ fontSize: '120px', lineHeight: 1, marginBottom: '24px', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.12))' }}>⚡</div>
            <div style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '22px', color: '#3A3530', letterSpacing: '-0.01em', marginBottom: '8px' }}>Every stitch, made by hand</div>
            <div style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A918A' }}>Premium Cotton Yarn</div>
          </div>
          {/* Floating badges */}
          <div style={{ position: 'absolute', top: '32px', left: '32px', background: 'white', borderRadius: '100px', padding: '8px 16px', fontSize: '11px', fontWeight: 500, color: '#1A1A18', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', letterSpacing: '0.05em' }}>✦ Made to Order</div>
          <div style={{ position: 'absolute', bottom: '32px', right: '32px', background: 'white', borderRadius: '100px', padding: '8px 16px', fontSize: '11px', fontWeight: 500, color: '#1A1A18', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', letterSpacing: '0.05em' }}>✦ Ships Worldwide</div>
          <div style={{ position: 'absolute', bottom: '80px', left: '32px', background: '#C9906A', borderRadius: '100px', padding: '8px 16px', fontSize: '11px', fontWeight: 500, color: 'white', boxShadow: '0 2px 12px rgba(201,144,106,0.3)', letterSpacing: '0.05em' }}>✦ 100% Handmade</div>
        </div>
      </section>

      {/* ── BENEFITS BAR ── */}
      <div style={{ background: '#F0EBE1', borderTop: '1px solid #E4DBD0', borderBottom: '1px solid #E4DBD0', padding: '20px 56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        <section style={{ padding: '80px 56px 96px', background: '#F8F5F0', maxWidth: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ fontSize: '10px', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#9A918A', display: 'block', marginBottom: '12px' }}>
              Our Most Loved
            </span>
            <h2 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '34px', fontWeight: 500, color: '#1A1A18', letterSpacing: '-0.01em', margin: 0 }}>
              Best Sellers
            </h2>
          </div>
          <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '56px' }}>
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
    </>
  )
}
