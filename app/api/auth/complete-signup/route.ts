import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { email, name, password } = await req.json()
  if (!email || !name || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const normalised = String(email).toLowerCase().trim()

  // Guard: don't allow if already exists
  const existing = await sql`SELECT id FROM site_users WHERE username = ${normalised} LIMIT 1`
  if (existing.length > 0) return NextResponse.json({ error: 'Account already exists.' }, { status: 409 })

  await sql`
    INSERT INTO site_users (username, password, name, role, email)
    VALUES (${normalised}, ${String(password)}, ${String(name).trim()}, 'guest', ${normalised})
  `

  return NextResponse.json({ ok: true })
}
