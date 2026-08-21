import Image from 'next/image'
import sohamImg from '@/assets/soham.png'

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 1.5rem' }}>
      <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9906A', marginBottom: '16px', fontWeight: 500 }}>Our Story</p>
      <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '3rem', color: '#1A1A18', marginBottom: '32px', lineHeight: 1.2 }}>
        Made with love,<br />one stitch at a time.
      </h1>
      <div style={{ fontSize: '15px', lineHeight: 1.8, color: '#6B6560', fontWeight: 300, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <p>PokéCraft was born from a love of two things: Pokémon and the quiet joy of crochet. Every plushie in our shop is handmade to order — no factories, no mass production, just careful hands and premium cotton yarn.</p>
        <p>Each piece takes several hours to complete. We choose every yarn colour with care, following patterns developed through hundreds of hours of refinement to make sure each Pokémon is as recognisable and huggable as possible.</p>
        <p>We believe handmade gifts carry something mass-produced things never can — the time and intention of another person. That&apos;s what you&apos;re getting when you order from PokéCraft.</p>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #E4DBD0', margin: '56px 0' }} />

      {/* Developer — blended, no panel */}
      <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9906A', marginBottom: '32px', fontWeight: 500 }}>Built By</p>
      <div style={{ display: 'flex', gap: '36px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <Image
          src={sohamImg}
          alt="Soham Mandal"
          width={220}
          height={280}
          style={{ borderRadius: '10px', objectFit: 'cover', objectPosition: 'top', flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: '220px' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '2rem', color: '#1A1A18', lineHeight: 1.2, margin: '0 0 6px' }}>
            Soham Mandal
          </h2>
          <p style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A918A', margin: '0 0 20px', fontWeight: 500 }}>Full-Stack Developer</p>
          <div style={{ fontSize: '15px', lineHeight: 1.8, color: '#6B6560', fontWeight: 300, display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
            <p style={{ margin: 0 }}>
              I designed and built PokéCraft end-to-end — from the storefront and checkout flow to the admin dashboard and order management system. The entire platform is built on Next.js with a Neon PostgreSQL database, Razorpay payments, and deployed on Vercel.
            </p>
            <p style={{ margin: 0 }}>
              PokéCraft is a passion project that let me combine a love for full-stack development with Pokémon — a fully functional e-commerce platform built from scratch.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a href="mailto:sohammandal.work24@gmail.com" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#1A1A18', textDecoration: 'none', fontWeight: 500 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              sohammandal.work24@gmail.com
            </a>
            <a href="https://www.linkedin.com/in/soham-mandal-3aa090246" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#1A1A18', textDecoration: 'none', fontWeight: 500 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
              </svg>
              linkedin.com/in/soham-mandal-3aa090246
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
