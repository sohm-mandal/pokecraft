export default function CustomOrdersPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 1.5rem' }}>
      <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9906A', marginBottom: '16px', fontWeight: 500 }}>Commission</p>
      <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '3rem', color: '#1A1A18', marginBottom: '16px', lineHeight: 1.2 }}>Custom Orders</h1>
      <p style={{ fontSize: '15px', lineHeight: 1.8, color: '#6B6560', fontWeight: 300, marginBottom: '48px' }}>
        Want a Pokémon that&apos;s not in our shop? We take custom commissions! Tell us which Pokémon you&apos;d like, any colour variations, and your preferred size.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
        {[
          ['Which Pokémon?', 'text', 'E.g. Lucario, Shiny Charizard, Togepi…'],
          ['Any special requests?', 'text', 'Size, colours, accessories…'],
          ['Your email', 'email', 'We\'ll get back to you within 24 hours'],
        ].map(([label, type, placeholder]) => (
          <div key={String(label)} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.05em', color: '#3A3530' }}>{label}</label>
            <input
              type={String(type)}
              placeholder={String(placeholder)}
              style={{ border: '1.5px solid #E4DBD0', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', fontFamily: 'inherit', background: 'white', outline: 'none' }}
            />
          </div>
        ))}
      </div>
      <button style={{ background: '#1A1A18', color: '#F8F5F0', border: 'none', padding: '15px 40px', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
        Send Request
      </button>
      <p style={{ marginTop: '20px', fontSize: '12px', color: '#9A918A' }}>
        Custom orders typically take 2–3 weeks. Pricing starts at ₹1,200 depending on complexity.
      </p>
    </div>
  )
}
