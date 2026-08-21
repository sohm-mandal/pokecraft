import Link from 'next/link'
import Image from 'next/image'
import { sql } from '@/lib/db'
import type { Product } from '@/types'
import { ProductCard } from '@/components/ProductCard'
import sohamImg from '@/assets/soham.png'

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
      <section className="hero-section" style={{ display: 'flex', overflow: 'hidden' }}>
        {/* Left */}
        <div className="hero-left" style={{ padding: '56px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#F8F5F0' }}>
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

        {/* Right — YouTube video */}
        <div className="hero-right" style={{ position: 'relative', overflow: 'hidden', background: '#1A1A18' }}>
          <iframe
            src="https://www.youtube.com/embed/gj-G0frikmI?autoplay=1&mute=1&loop=1&playlist=gj-G0frikmI&rel=0&modestbranding=1&controls=1"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          />
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

      {/* ── MAKER STRIP ── */}
      <section style={{ background: '#F8F5F0', padding: '56px 20px', borderBottom: '1px solid #E4DBD0' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '36px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '110px', height: '140px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, border: '2px solid #E4DBD0' }}>
            <Image src={sohamImg} alt="Soham" fill style={{ objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9906A', marginBottom: '12px', fontWeight: 500 }}>The Maker</p>
            <h2 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.7rem', color: '#1A1A18', marginBottom: '14px', lineHeight: 1.25 }}>
              Hi, I&apos;m Soham — I make every one of these by hand.
            </h2>
            <p style={{ fontSize: '14px', lineHeight: 1.75, color: '#6B6560', fontWeight: 300, margin: '0 0 20px' }}>
              Each plushie is crocheted by me, start to finish. No factories, no shortcuts — just premium yarn and a lot of love for Pokémon.
            </p>
            <Link href="/about" style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1A1A18', textDecoration: 'none', fontWeight: 500, borderBottom: '1.5px solid #1A1A18', paddingBottom: '2px' }}>
              Our story →
            </Link>
          </div>
        </div>
      </section>

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
        .hero-section { height: 580px; }
        .hero-left { width: 44%; }
        .hero-right { flex: 1; min-height: 300px; }
        .products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        @media (max-width: 768px) {
          .hero-section { height: auto; flex-direction: column; }
          .hero-left { width: 100%; padding: 48px 24px !important; }
          .hero-right { width: 100%; min-height: 280px; }
          .products-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
        }
        @media (max-width: 480px) {
          .products-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
        }
      `}</style>
    </>
  )
}
