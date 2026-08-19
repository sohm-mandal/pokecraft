-- PokéCraft DB Schema
-- Run this in the Neon SQL editor at console.neon.tech

CREATE TYPE order_status AS ENUM (
  'pending',
  'placed',
  'shipped',
  'delivered',
  'cancelled',
  'returned'
);

CREATE TABLE IF NOT EXISTS products (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  pokemon_name TEXT NOT NULL,
  description  TEXT,
  price        INTEGER NOT NULL,       -- stored in paise (INR × 100)
  stock_count  INTEGER NOT NULL DEFAULT 0,
  images       TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS orders (
  id                  SERIAL PRIMARY KEY,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_order_id   TEXT UNIQUE NOT NULL,  -- idempotency key
  buyer_name          TEXT NOT NULL,
  buyer_email         TEXT NOT NULL,
  buyer_phone         TEXT NOT NULL,
  shipping_address    JSONB NOT NULL,
  items               JSONB NOT NULL,        -- [{id, name, quantity, price}]
  total_amount        INTEGER NOT NULL,      -- paise
  status              order_status NOT NULL DEFAULT 'pending',
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
