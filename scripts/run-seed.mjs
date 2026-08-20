import { neon } from '@neondatabase/serverless'

const DATABASE_URL = 'postgresql://neondb_owner:npg_atNrYZk5cw7J@ep-gentle-silence-axbydp28-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
const sql = neon(DATABASE_URL)

const products = [
  { name: 'Pikachu Crochet Plushie', slug: 'pikachu', pokemon_name: 'Pikachu', description: 'A handmade Pikachu plushie, lovingly crocheted with soft yellow yarn. Perfect companion!', price: 84900, stock_count: 10, images: [] },
  { name: 'Eevee Crochet Plushie', slug: 'eevee', pokemon_name: 'Eevee', description: 'Soft and fluffy Eevee plushie with detailed fur texture, crocheted by hand.', price: 89900, stock_count: 8, images: [] },
  { name: 'Charmander Crochet Plushie', slug: 'charmander', pokemon_name: 'Charmander', description: 'Adorable Charmander with a flame-tipped tail, handcrafted with premium cotton yarn.', price: 84900, stock_count: 12, images: [] },
  { name: 'Bulbasaur Crochet Plushie', slug: 'bulbasaur', pokemon_name: 'Bulbasaur', description: 'Sweet Bulbasaur with its iconic seed bulb, carefully crocheted in green and teal.', price: 84900, stock_count: 9, images: [] },
  { name: 'Snorlax Crochet Plushie', slug: 'snorlax', pokemon_name: 'Snorlax', description: 'Big and cosy Snorlax — your new favourite nap buddy, handcrafted with chunky yarn.', price: 119900, stock_count: 5, images: [] },
  { name: 'Jigglypuff Crochet Plushie', slug: 'jigglypuff', pokemon_name: 'Jigglypuff', description: 'Round and squishy Jigglypuff in soft pink, ready to sing you to sleep.', price: 79900, stock_count: 11, images: [] },
  { name: 'Mewtwo Crochet Plushie', slug: 'mewtwo', pokemon_name: 'Mewtwo', description: "Legendary Mewtwo rendered in fine detail — a collector's crochet piece.", price: 149900, stock_count: 3, images: [] },
  { name: 'Squirtle Crochet Plushie', slug: 'squirtle', pokemon_name: 'Squirtle', description: 'Cheerful Squirtle with its iconic shell, hand-stitched with sky-blue yarn.', price: 84900, stock_count: 10, images: [] },
  { name: 'Gengar Crochet Plushie', slug: 'gengar', pokemon_name: 'Gengar', description: 'Spooky yet adorable Gengar crocheted in deep purple — a fan favourite!', price: 94900, stock_count: 7, images: [] },
  { name: 'Sylveon Crochet Plushie', slug: 'sylveon', pokemon_name: 'Sylveon', description: 'Elegant Sylveon with ribbon feelers in pink and pastel blue, lovingly handmade.', price: 99900, stock_count: 6, images: [] },
]

console.log('Seeding products...')
for (const p of products) {
  await sql`
    INSERT INTO products (name, slug, pokemon_name, description, price, stock_count, images)
    VALUES (${p.name}, ${p.slug}, ${p.pokemon_name}, ${p.description}, ${p.price}, ${p.stock_count}, ${p.images})
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      price = EXCLUDED.price,
      stock_count = EXCLUDED.stock_count
  `
  console.log('  ✓', p.name, '—', '₹' + (p.price/100))
}
console.log('Done! 10 products seeded.')
