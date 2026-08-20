import Link from 'next/link'

const collections = [
  { name: 'Electric', emoji: '⚡', desc: 'Pikachu, Raichu, Jolteon and more electric-type friends.', slug: 'electric', bg: '#FFF8E0' },
  { name: 'Fire', emoji: '🔥', desc: 'Charmander, Flareon, Arcanine — warm and fiery companions.', slug: 'fire', bg: '#FFF0E0' },
  { name: 'Water', emoji: '💧', desc: 'Squirtle, Vaporeon, Psyduck — cool water-type plushies.', slug: 'water', bg: '#E8F4F8' },
  { name: 'Grass', emoji: '🌿', desc: 'Bulbasaur, Leafeon, Chikorita — nature-loving crochet pals.', slug: 'grass', bg: '#EDFAE8' },
  { name: 'Ghost', emoji: '👻', desc: 'Gengar, Haunter, Mismagius — spooky but cuddly.', slug: 'ghost', bg: '#F0EAF8' },
  { name: 'Fairy', emoji: '🌸', desc: 'Sylveon, Jigglypuff, Eevee — soft and magical fairy types.', slug: 'fairy', bg: '#FFF0F5' },
]

export default function CollectionsPage() {
  return (
    <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '80px 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#9A918A', marginBottom: '12px' }}>Browse</p>
        <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '2.5rem', color: '#1A1A18', margin: 0 }}>Shop by Collection</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {collections.map((c) => (
          <Link key={c.slug} href={`/shop?type=${c.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: c.bg, borderRadius: '1rem', padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', border: '1.5px solid #E4DBD0', transition: 'transform 0.2s' }}>
              <span style={{ fontSize: '3rem' }}>{c.emoji}</span>
              <h2 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.5rem', color: '#1A1A18', margin: 0 }}>{c.name}</h2>
              <p style={{ fontSize: '13px', color: '#6B6560', lineHeight: 1.6, margin: 0 }}>{c.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
