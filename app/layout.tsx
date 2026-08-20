import type { Metadata } from 'next'
import { Playfair_Display, Jost } from 'next/font/google'
import Link from 'next/link'
import Script from 'next/script'
import { CartIcon } from '@/components/CartIcon'
import './globals.css'

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
})

const jost = Jost({
  variable: '--font-jost',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PokéCraft — Handmade Pokémon Crochet Plushies',
  description: 'Handcrafted Pokémon crochet plushies made with love. Ships across India.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${jost.variable}`}>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8F5F0', color: '#1A1A18', fontFamily: 'var(--font-jost, Jost, system-ui, sans-serif)', margin: 0 }}>

        {/* ── HEADER ── */}
        <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(248,245,240,0.96)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #EAE3D9', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 56px' }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="15" stroke="#1A1A18" strokeWidth="1.5"/>
              <path d="M1 16h30" stroke="#1A1A18" strokeWidth="1.5"/>
              <circle cx="16" cy="16" r="4.5" fill="#F8F5F0" stroke="#1A1A18" strokeWidth="1.5"/>
              <path d="M4 10 Q16 6 28 10" stroke="#1A1A18" strokeWidth="1" fill="none" opacity="0.3"/>
              <path d="M4 22 Q16 26 28 22" stroke="#1A1A18" strokeWidth="1" fill="none" opacity="0.3"/>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '20px', fontWeight: 600, color: '#1A1A18', lineHeight: 1, letterSpacing: '-0.01em' }}>PokéCraft</span>
              <span style={{ fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A918A', fontWeight: 400 }}>Handmade with love</span>
            </div>
          </Link>

          {/* Nav */}
          <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            {[
              ['Shop', '/shop'],
              ['Collections', '/collections'],
              ['About', '/about'],
              ['Custom Orders', '/custom-orders'],
              ['FAQ', '/faq'],
            ].map(([label, href]) => (
              <Link key={href} href={href} style={{ fontSize: '13px', fontWeight: 400, letterSpacing: '0.03em', color: '#3A3530', textDecoration: 'none' }}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Icons: Search, User, Cart */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {/* Search */}
            <button style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#1A1A18', borderRadius: '50%' }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="7"/><path d="m17 17 4 4"/>
              </svg>
            </button>
            {/* User */}
            <button style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#1A1A18', borderRadius: '50%' }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </button>
            {/* Cart */}
            <CartIcon />
          </div>
        </header>

        {/* ── MARQUEE RIBBON ── */}
        <div style={{ background: '#1A1A18', color: '#F8F5F0', padding: '10px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'inline-flex', animation: 'marquee 28s linear infinite' }}>
            {[...Array(3)].map((_, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0' }}>
                <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500, padding: '0 48px' }}>100% Handmade</span>
                <span style={{ opacity: 0.4 }}>·</span>
                <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500, padding: '0 48px' }}>Premium Quality</span>
                <span style={{ opacity: 0.4 }}>·</span>
                <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500, padding: '0 48px' }}>Made to Order</span>
                <span style={{ opacity: 0.4 }}>·</span>
                <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500, padding: '0 48px' }}>Worldwide Shipping</span>
                <span style={{ opacity: 0.4 }}>·</span>
              </span>
            ))}
          </div>
        </div>

        <main style={{ flex: 1 }}>{children}</main>

        {/* ── TRUST SECTION ── */}
        <section style={{ padding: '80px 56px', background: '#F0EBE1', borderTop: '1px solid #E4DBD0' }}>
          <div style={{ maxWidth: '1152px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px' }}>
            {[
              { icon: '🧶', title: 'Handmade', body: 'Every piece is carefully handcrafted with love and attention to detail.' },
              { icon: '✨', title: 'Premium Quality', body: 'We use the finest yarns and materials for a soft and long-lasting finish.' },
              { icon: '🎁', title: 'Made to Order', body: 'Each order is custom made just for you with care.' },
              { icon: '🌍', title: 'Worldwide Shipping', body: 'We ship our Pokémon friends to trainers around the world.' },
            ].map(({ icon, title, body }) => (
              <div key={title} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <span style={{ fontSize: '28px' }}>{icon}</span>
                <p style={{ fontSize: '12px', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 500, color: '#1A1A18', margin: 0 }}>{title}</p>
                <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#6B6560', fontWeight: 300, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background: '#1A1A18', color: '#F8F5F0', padding: '40px 56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '18px', fontWeight: 500 }}>PokéCraft</span>
            <span style={{ fontSize: '11px', color: '#6A6560', letterSpacing: '0.04em' }}>© 2026 PokéCraft. All rights reserved.</span>
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact'], ['Instagram', '#'], ['About', '/about'], ['Custom Orders', '/custom-orders'], ['FAQ', '/faq']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: '11px', color: '#6A6560', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {label}
              </Link>
            ))}
          </div>
        </footer>

        <style>{`
          @keyframes marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-33.333%); }
          }
        `}</style>

        <Script id="razorpay" src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}
