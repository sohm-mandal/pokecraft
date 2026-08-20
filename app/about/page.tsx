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
    </div>
  )
}
