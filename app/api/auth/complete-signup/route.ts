import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { mailer } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  let body: { email?: string; name?: string; password?: string; username?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON', code: 'INVALID_JSON' }, { status: 400 })
  }

  const { email, name, password, username } = body
  if (!email || !name || !password || !username) {
    return NextResponse.json({ error: 'email, name, username, and password are required', code: 'MISSING_FIELDS' }, { status: 400 })
  }

  const normalisedEmail = String(email).toLowerCase().trim()
  const normalisedUsername = String(username).toLowerCase().trim()

  if (!/^[a-z0-9_]+$/.test(normalisedUsername) || normalisedUsername.length < 3 || normalisedUsername.length > 30) {
    return NextResponse.json({ error: 'Username must be 3–30 characters, letters, numbers, and underscores only.', code: 'INVALID_USERNAME' }, { status: 400 })
  }

  let existing: unknown[]
  try {
    existing = await sql`
      SELECT id FROM site_users WHERE username = ${normalisedUsername} OR email = ${normalisedEmail} LIMIT 1
    `
  } catch (err) {
    console.error('[POST /api/auth/complete-signup] DB lookup failed:', err)
    return NextResponse.json({ error: 'Failed to check account availability', code: 'DB_ERROR' }, { status: 500 })
  }
  if (existing.length > 0) {
    return NextResponse.json({ error: 'This username or email is already taken.', code: 'ALREADY_TAKEN' }, { status: 409 })
  }

  try {
    await sql`
      INSERT INTO site_users (username, password, name, role, email)
      VALUES (${normalisedUsername}, ${String(password)}, ${String(name).trim()}, 'guest', ${normalisedEmail})
    `
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[POST /api/auth/complete-signup] INSERT failed:', msg)
    if (msg.toLowerCase().includes('unique') || msg.toLowerCase().includes('duplicate')) {
      return NextResponse.json({ error: 'This username or email is already taken.', code: 'ALREADY_TAKEN' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create account', code: 'DB_ERROR' }, { status: 500 })
  }

  // Welcome email
  try {
    await mailer.sendMail({
      from: `PokéCraft <${process.env.GMAIL_USER}>`,
      to: normalised,
      subject: 'Welcome to PokéCraft! 🧶',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1A1A18">
          <h2 style="color:#C9906A">Welcome to PokéCraft, ${String(name).trim()}! 🎉</h2>
          <p style="font-size:15px;color:#6B6560">Your account has been created. You can now browse our handmade Pokémon crochet plushies, save items to your wishlist, and track your orders.</p>
          <div style="margin:24px 0">
            <a href="${process.env.NEXTAUTH_URL ?? 'https://pokecraft.vercel.app'}/shop" style="background:#1A1A18;color:#F8F5F0;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:13px;letter-spacing:0.1em;font-weight:500">Browse the Shop</a>
          </div>
          <hr style="border:none;border-top:1px solid #E4DBD0;margin:24px 0"/>
          <p style="font-size:11px;color:#9A918A;text-align:center">PokéCraft — Handmade with love ♥</p>
        </div>
      `,
    })
  } catch (e) {
    console.error('Welcome email failed:', e)
  }

  return NextResponse.json({ ok: true })
}
