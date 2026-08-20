import type { Metadata } from 'next'
import { Playfair_Display, Jost } from 'next/font/google'
import Link from 'next/link'
import Script from 'next/script'
import { auth } from '@/auth'
import { CartIcon } from '@/components/CartIcon'
import { WishlistIcon } from '@/components/WishlistIcon'
import { ChatWidget } from '@/components/ChatWidget'
import { UserMenu } from '@/components/UserMenu'
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const loggedIn = !!session?.user
  const userName = session?.user?.name ?? 'Account'
  const userImage = session?.user?.image ?? null
  const userRole = (session?.user as { role?: string })?.role ?? 'guest'

  return (
    <html lang="en" className={`${playfair.variable} ${jost.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8F5F0', color: '#1A1A18', fontFamily: 'var(--font-jost, Jost, system-ui, sans-serif)', margin: 0 }}>

        {loggedIn && (
          <>
            {/* ── HEADER ── */}
            <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(248,245,240,0.96)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #EAE3D9', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>

              {/* Logo */}
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="15" stroke="#1A1A18" strokeWidth="1.5"/>
                  <path d="M1 16h30" stroke="#1A1A18" strokeWidth="1.5"/>
                  <circle cx="16" cy="16" r="4.5" fill="#F8F5F0" stroke="#1A1A18" strokeWidth="1.5"/>
                </svg>
                <span style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '18px', fontWeight: 600, color: '#1A1A18', letterSpacing: '-0.01em' }}>PokéCraft</span>
              </Link>

              {/* Desktop Nav */}
              <nav className="desktop-nav" style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
                {[['Shop', '/shop'], ['Collections', '/collections'], ['About', '/about'], ['Custom Orders', '/custom-orders'], ['FAQ', '/faq']].map(([label, href]) => (
                  <Link key={href} href={href} style={{ fontSize: '13px', fontWeight: 400, letterSpacing: '0.03em', color: '#3A3530', textDecoration: 'none' }}>
                    {label}
                  </Link>
                ))}
              </nav>

              {/* Right icons */}
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                <WishlistIcon />
                <CartIcon />
                <div style={{ marginLeft: '4px' }}>
                  <UserMenu name={userName} image={userImage} role={userRole} />
                </div>
              </div>
            </header>

            {/* ── MOBILE NAV ── */}
            <nav className="mobile-nav" style={{ background: '#F8F5F0', borderBottom: '1px solid #EAE3D9', overflowX: 'auto', whiteSpace: 'nowrap', padding: '0 16px' }}>
              <div style={{ display: 'inline-flex', gap: '0' }}>
                {[['Shop', '/shop'], ['Collections', '/collections'], ['About', '/about'], ['Custom Orders', '/custom-orders'], ['FAQ', '/faq']].map(([label, href]) => (
                  <Link key={href} href={href} style={{ display: 'inline-block', padding: '12px 16px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.05em', color: '#3A3530', textDecoration: 'none', textTransform: 'uppercase' }}>
                    {label}
                  </Link>
                ))}
              </div>
            </nav>

            {/* ── MARQUEE RIBBON ── */}
            <div style={{ background: '#1A1A18', color: '#F8F5F0', padding: '10px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div style={{ display: 'inline-flex', animation: 'marquee 28s linear infinite' }}>
                {[...Array(4)].map((_, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500, padding: '0 32px' }}>100% Handmade</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500, padding: '0 32px' }}>Premium Quality</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500, padding: '0 32px' }}>Made to Order</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500, padding: '0 32px' }}>Worldwide Shipping</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        <main style={{ flex: 1 }}>{children}</main>

        {loggedIn && (
          <>
            {/* ── TRUST SECTION ── */}
            <section style={{ padding: '60px 20px', background: '#F0EBE1', borderTop: '1px solid #E4DBD0' }}>
              <div className="trust-grid" style={{ maxWidth: '1152px', margin: '0 auto' }}>
                {[
                  { icon: '🧶', title: 'Handmade', body: 'Every piece is carefully handcrafted with love and attention to detail.' },
                  { icon: '✨', title: 'Premium Quality', body: 'We use the finest yarns and materials for a soft, long-lasting finish.' },
                  { icon: '🎁', title: 'Made to Order', body: 'Each order is custom made just for you with care.' },
                  { icon: '🌍', title: 'Worldwide Shipping', body: 'We ship our Pokémon friends to trainers around the world.' },
                ].map(({ icon, title, body }) => (
                  <div key={title} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <span style={{ fontSize: '28px' }}>{icon}</span>
                    <p style={{ fontSize: '12px', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 500, color: '#1A1A18', margin: 0 }}>{title}</p>
                    <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#6B6560', fontWeight: 300, margin: 0 }}>{body}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── FOOTER ── */}
            <footer style={{ background: '#1A1A18', color: '#F8F5F0', padding: '32px 20px' }}>
              <div style={{ maxWidth: '1152px', margin: '0 auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '18px', fontWeight: 500 }}>PokéCraft</span>
                  <span style={{ fontSize: '11px', color: '#6A6560', letterSpacing: '0.04em' }}>© 2026 PokéCraft. All rights reserved.</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {[['About', '/about'], ['Custom Orders', '/custom-orders'], ['FAQ', '/faq'], ['Contact', '/contact']].map(([label, href]) => (
                    <Link key={label} href={href} style={{ fontSize: '11px', color: '#6A6560', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </footer>

            <ChatWidget />
            <Script id="razorpay" src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
          </>
        )}

        <style>{`
          @keyframes marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-25%); }
          }
          .desktop-nav { display: flex !important; }
          .mobile-nav { display: none !important; }
          .trust-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; }
          @media (max-width: 768px) {
            .desktop-nav { display: none !important; }
            .mobile-nav { display: block !important; }
            .trust-grid { grid-template-columns: repeat(2, 1fr); gap: 28px; }
          }
          @media (max-width: 480px) {
            .trust-grid { grid-template-columns: 1fr; gap: 24px; }
          }
        `}</style>

      </body>
    </html>
  )
}
