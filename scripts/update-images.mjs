import { neon } from '@neondatabase/serverless'

const DATABASE_URL = 'postgresql://neondb_owner:npg_atNrYZk5cw7J@ep-gentle-silence-axbydp28-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
const sql = neon(DATABASE_URL)

const BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'

// slug → Pokédex ID
const images = [
  { slug: 'pikachu',    url: `${BASE}/25.png` },
  { slug: 'eevee',      url: `${BASE}/133.png` },
  { slug: 'charmander', url: `${BASE}/4.png` },
  { slug: 'bulbasaur',  url: `${BASE}/1.png` },
  { slug: 'snorlax',    url: `${BASE}/143.png` },
  { slug: 'jigglypuff', url: `${BASE}/39.png` },
  { slug: 'mewtwo',     url: `${BASE}/150.png` },
  { slug: 'squirtle',   url: `${BASE}/7.png` },
  { slug: 'gengar',     url: `${BASE}/94.png` },
  { slug: 'sylveon',    url: `${BASE}/700.png` },
]

for (const { slug, url } of images) {
  await sql`UPDATE products SET images = ${[url]} WHERE slug = ${slug}`
  console.log('✓', slug)
}

console.log('Done!')
