import { neon } from '@neondatabase/serverless'

const DATABASE_URL = 'postgresql://neondb_owner:npg_atNrYZk5cw7J@ep-gentle-silence-axbydp28-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
const sql = neon(DATABASE_URL)

console.log('Running migration...')

await sql`
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
      CREATE TYPE order_status AS ENUM ('pending','placed','shipped','delivered','cancelled','returned');
    END IF;
  END $$
`
console.log('✓ order_status enum')

await sql`
  CREATE TABLE IF NOT EXISTS products (
    id           SERIAL PRIMARY KEY,
    name         TEXT NOT NULL,
    slug         TEXT UNIQUE NOT NULL,
    pokemon_name TEXT NOT NULL,
    description  TEXT,
    price        INTEGER NOT NULL,
    stock_count  INTEGER NOT NULL DEFAULT 0,
    images       TEXT[] NOT NULL DEFAULT '{}'
  )
`
console.log('✓ products table')

await sql`
  CREATE TABLE IF NOT EXISTS orders (
    id                  SERIAL PRIMARY KEY,
    razorpay_payment_id TEXT UNIQUE,
    razorpay_order_id   TEXT UNIQUE NOT NULL,
    buyer_name          TEXT NOT NULL,
    buyer_email         TEXT NOT NULL,
    buyer_phone         TEXT NOT NULL,
    shipping_address    JSONB NOT NULL,
    items               JSONB NOT NULL,
    total_amount        INTEGER NOT NULL,
    status              order_status NOT NULL DEFAULT 'pending',
    created_at          TIMESTAMPTZ DEFAULT NOW()
  )
`
console.log('✓ orders table')
console.log('Migration complete!')
