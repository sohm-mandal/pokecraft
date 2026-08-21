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

      {/* Developer */}
      <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9906A', marginBottom: '16px', fontWeight: 500 }}>Built By</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', width: '96px', height: '120px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, border: '2px solid #E4DBD0' }}>
          <Image src={sohamImg} alt="Soham" fill style={{ objectFit: 'cover' }} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '2rem', color: '#1A1A18', lineHeight: 1.2, margin: 0 }}>
          Soham Mandal
        </h2>
      </div>
      <div style={{ fontSize: '15px', lineHeight: 1.8, color: '#6B6560', fontWeight: 300, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <p>
          I designed and built PokéCraft end-to-end — from the storefront and checkout flow to the admin dashboard and order management system. The entire platform is built on Next.js with a Neon PostgreSQL database, Razorpay payments, and deployed on Vercel.
        </p>
        <p>
          I&apos;m a full-stack developer with a focus on building clean, performant web experiences. PokéCraft is a passion project that let me combine that with a love for Pokémon — a fully functional e-commerce platform built from scratch.
        </p>
      </div>

      {/* Test Notice */}
      <div style={{ borderTop: '1px solid #E4DBD0', margin: '56px 0' }} />
      <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9906A', marginBottom: '16px', fontWeight: 500 }}>For Testing</p>
      <h2 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '2rem', color: '#1A1A18', marginBottom: '16px', lineHeight: 1.2 }}>
        We have made this for test
      </h2>
      <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#6B6560', fontWeight: 300, marginBottom: '24px' }}>
        Use the card details below to make a test payment — no real money is charged.
      </p>
      <div style={{ background: '#F0EAE0', border: '1.5px solid #E4DBD0', borderRadius: '16px', padding: '24px 28px', display: 'inline-flex', flexDirection: 'column', gap: '12px', fontFamily: 'monospace', fontSize: '14px' }}>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9A918A', margin: '0 0 4px', fontFamily: 'inherit' }}>Card Number</p>
            <p style={{ color: '#1A1A18', margin: 0, fontWeight: 600, letterSpacing: '0.08em' }}>4100 2800 0000 1007</p>
          </div>
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9A918A', margin: '0 0 4px', fontFamily: 'inherit' }}>CVV</p>
            <p style={{ color: '#1A1A18', margin: 0, fontWeight: 600 }}>123</p>
          </div>
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9A918A', margin: '0 0 4px', fontFamily: 'inherit' }}>Expiry</p>
            <p style={{ color: '#1A1A18', margin: 0, fontWeight: 600 }}>12/26</p>
          </div>
        </div>
      </div>

    </div>
  )
}
