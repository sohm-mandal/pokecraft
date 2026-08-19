import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

const products = [
  {
    name: 'Pikachu Crochet Plushie',
    slug: 'pikachu',
    pokemon_name: 'Pikachu',
    description: 'A handmade Pikachu plushie, lovingly crocheted with soft yellow yarn. Perfect companion!',
    price: 84900,   // ₹849
    stock_count: 10,
    images: ['/images/pikachu-1.jpg'],
  },
  {
    name: 'Eevee Crochet Plushie',
    slug: 'eevee',
    pokemon_name: 'Eevee',
    description: 'Soft and fluffy Eevee plushie with detailed fur texture, crocheted by hand.',
    price: 89900,   // ₹899
    stock_count: 8,
    images: ['/images/eevee-1.jpg'],
  },
  {
    name: 'Charmander Crochet Plushie',
    slug: 'charmander',
    pokemon_name: 'Charmander',
    description: 'Adorable Charmander with a flame-tipped tail, handcrafted with premium cotton yarn.',
    price: 84900,
    stock_count: 12,
    images: ['/images/charmander-1.jpg'],
  },
  {
    name: 'Bulbasaur Crochet Plushie',
    slug: 'bulbasaur',
    pokemon_name: 'Bulbasaur',
    description: 'Sweet Bulbasaur with its iconic seed bulb, carefully crocheted in green and teal.',
    price: 84900,
    stock_count: 9,
    images: ['/images/bulbasaur-1.jpg'],
  },
  {
    name: 'Snorlax Crochet Plushie',
    slug: 'snorlax',
    pokemon_name: 'Snorlax',
    description: 'Big and cosy Snorlax — your new favourite nap buddy, handcrafted with chunky yarn.',
    price: 119900,  // ₹1,199
    stock_count: 5,
    images: ['/images/snorlax-1.jpg'],
  },
  {
    name: 'Jigglypuff Crochet Plushie',
    slug: 'jigglypuff',
    pokemon_name: 'Jigglypuff',
    description: 'Round and squishy Jigglypuff in soft pink, ready to sing you to sleep.',
    price: 79900,   // ₹799
    stock_count: 11,
    images: ['/images/jigglypuff-1.jpg'],
  },
  {
    name: 'Mewtwo Crochet Plushie',
    slug: 'mewtwo',
    pokemon_name: 'Mewtwo',
    description: 'Legendary Mewtwo rendered in fine detail — a collector\'s crochet piece.',
    price: 149900,  // ₹1,499
    stock_count: 3,
    images: ['/images/mewtwo-1.jpg'],
  },
  {
    name: 'Squirtle Crochet Plushie',
    slug: 'squirtle',
    pokemon_name: 'Squirtle',
    description: 'Cheerful Squirtle with its iconic shell, hand-stitched with sky-blue yarn.',
    price: 84900,
    stock_count: 10,
    images: ['/images/squirtle-1.jpg'],
  },
  {
    name: 'Gengar Crochet Plushie',
    slug: 'gengar',
    pokemon_name: 'Gengar',
    description: 'Spooky yet adorable Gengar crocheted in deep purple — a fan favourite!',
    price: 94900,   // ₹949
    stock_count: 7,
    images: ['/images/gengar-1.jpg'],
  },
  {
    name: 'Sylveon Crochet Plushie',
    slug: 'sylveon',
    pokemon_name: 'Sylveon',
    description: 'Elegant Sylveon with ribbon feelers in pink and pastel blue, lovingly handmade.',
    price: 99900,   // ₹999
    stock_count: 6,
    images: ['/images/sylveon-1.jpg'],
  },
]

async function seed() {
  console.log('Seeding products...')
  for (const p of products) {
    await sql`
      INSERT INTO products (name, slug, pokemon_name, description, price, stock_count, images)
      VALUES (${p.name}, ${p.slug}, ${p.pokemon_name}, ${p.description}, ${p.price}, ${p.stock_count}, ${p.images})
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        pokemon_name = EXCLUDED.pokemon_name,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        stock_count = EXCLUDED.stock_count,
        images = EXCLUDED.images
    `
    console.log(`  ✓ ${p.name}`)
  }
  console.log('Done!')
}

seed().catch(console.error)
