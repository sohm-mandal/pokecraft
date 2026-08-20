import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
const sql = neon(process.env.DATABASE_URL)

await sql`
  CREATE TABLE IF NOT EXISTS site_users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'guest',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`

// Insert default admin and a guest user (plain text passwords for now)
await sql`
  INSERT INTO site_users (username, password, name, role)
  VALUES
    ('admin', 'pokecraft2024', 'Admin', 'admin'),
    ('guest', 'guest123', 'Guest User', 'guest')
  ON CONFLICT (username) DO NOTHING
`

console.log('site_users table created and seeded')
