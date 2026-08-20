import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { mailer } from '@/lib/mailer'

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
