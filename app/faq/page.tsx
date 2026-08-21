const faqs = [
  { q: 'How long does it take to receive my order?', a: 'Each plushie is made to order and typically takes 7–10 business days to craft and ship. You\'ll receive a tracking number once dispatched.' },
  { q: 'What materials do you use?', a: 'We use premium anti-pilling cotton yarn, safety eyes, and polyester fiberfill stuffing. All materials are soft, durable, and child-safe.' },
  { q: 'Can I request a specific size?', a: 'Our standard plushies are approximately 20–25 cm tall. For custom sizing, please use the Custom Orders page to get in touch.' },
  { q: 'Do you ship worldwide?', a: 'Yes! We ship to most countries. International shipping typically takes 10–20 business days depending on your location.' },
  { q: 'What is your return policy?', a: 'Since each item is handmade to order, we don\'t accept returns unless the item arrives damaged. In that case, please contact us within 7 days with photos.' },
  { q: 'Can I order a Pokémon not listed in the shop?', a: 'Absolutely! Visit our Custom Orders page and tell us which Pokémon you\'d like. We\'ll confirm availability and pricing within 24 hours.' },
  { q: 'Are the plushies safe for children?', a: 'Our plushies use safety eyes appropriate for ages 3+ when properly secured. For children under 3, please contact us for custom embroidered eyes.' },
  { q: 'How do I care for my plushie?', a: 'Hand wash gently in cold water, reshape while damp, and air dry. Do not machine wash or tumble dry as this may damage the yarn and shape.' },
]

export default function FAQPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 1.5rem' }}>

      {/* Test card — top of page */}
      <div style={{ background: '#F0EAE0', border: '1.5px solid #E4DBD0', borderRadius: '16px', padding: '24px 28px', marginBottom: '56px' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9906A', marginBottom: '12px', fontWeight: 500 }}>For Testing</p>
        <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#6B6560', fontWeight: 300, margin: '0 0 20px' }}>
          Use the card details below to make a test payment — no real money is charged.
        </p>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', fontFamily: 'monospace', fontSize: '14px' }}>
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

      <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9906A', marginBottom: '16px', fontWeight: 500 }}>Help</p>
      <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '3rem', color: '#1A1A18', marginBottom: '48px', lineHeight: 1.2 }}>
        Frequently Asked Questions
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {faqs.map(({ q, a }, i) => (
          <div key={i} style={{ borderTop: '1px solid #E4DBD0', padding: '28px 0' }}>
            <h3 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.1rem', color: '#1A1A18', marginBottom: '12px' }}>{q}</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.75, color: '#6B6560', fontWeight: 300, margin: 0 }}>{a}</p>
          </div>
        ))}
        <div style={{ borderTop: '1px solid #E4DBD0' }} />
      </div>
    </div>
  )
}
