import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
const sql = neon(process.env.DATABASE_URL)

// Add email column (nullable — existing staff accounts may not have one)
await sql`ALTER TABLE site_users ADD COLUMN IF NOT EXISTS email TEXT`

// Backfill: for OTP-created guests whose username is an email address, copy it to email
await sql`
  UPDATE site_users
  SET email = username
  WHERE email IS NULL
    AND username LIKE '%@%'
    AND username NOT LIKE '%@pokecraft.internal'
`

console.log('email column added and backfilled')
