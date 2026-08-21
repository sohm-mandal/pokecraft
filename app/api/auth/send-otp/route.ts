import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { mailer } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  let body: { email?: string; mode?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON', code: 'INVALID_JSON' }, { status: 400 })
  }

  const { email, mode } = body
  if (!email) return NextResponse.json({ error: 'email is required', code: 'MISSING_EMAIL' }, { status: 400 })
  if (!mode) return NextResponse.json({ error: 'mode is required (signup or forgot-password)', code: 'MISSING_MODE' }, { status: 400 })

  const normalised = String(email).toLowerCase().trim()

  let userExists: boolean
  try {
    const existing = await sql`
      SELECT id FROM site_users
      WHERE email = ${normalised} OR username = ${normalised}
      LIMIT 1
    `
    userExists = existing.length > 0
  } catch (err) {
    console.error('[POST /api/auth/send-otp] DB lookup failed:', err)
    return NextResponse.json({ error: 'Failed to check account', code: 'DB_ERROR' }, { status: 500 })
  }

  if (mode === 'signup' && userExists) {
    return NextResponse.json(
      { error: 'An account with this email already exists. Please sign in instead.', code: 'EMAIL_TAKEN' },
      { status: 409 }
    )
  }

  if (mode === 'forgot-password' && !userExists) {
    return NextResponse.json(
      { error: 'No account found with this email address.', code: 'ACCOUNT_NOT_FOUND' },
      { status: 404 }
    )
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  try {
    await sql`
      INSERT INTO otps (email, code, expires_at)
      VALUES (${normalised}, ${code}, ${expiresAt.toISOString()})
      ON CONFLICT (email) DO UPDATE SET code = ${code}, expires_at = ${expiresAt.toISOString()}
    `
  } catch (err) {
    console.error('[POST /api/auth/send-otp] OTP insert failed:', err)
    return NextResponse.json({ error: 'Failed to generate OTP', code: 'OTP_STORE_ERROR' }, { status: 500 })
  }

  try {
    await mailer.sendMail({
      from: `PokéCraft <${process.env.GMAIL_USER}>`,
      to: normalised,
      subject: mode === 'forgot-password'
        ? `Your PokéCraft password reset code: ${code}`
        : `Your PokéCraft verification code: ${code}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1A1A18">
          <h2 style="color:#C9906A">${mode === 'forgot-password' ? 'Reset your password 🔑' : 'Your verification code 🧶'}</h2>
          <p style="font-size:15px;color:#6B6560">Use this code to ${mode === 'forgot-password' ? 'reset your PokéCraft password' : 'create your PokéCraft account'}. It expires in <strong>10 minutes</strong>.</p>
          <div style="background:#F8F5F0;border:1px solid #E4DBD0;border-radius:12px;padding:32px;text-align:center;margin:24px 0">
            <span style="font-size:2.5rem;font-weight:700;letter-spacing:0.2em;color:#1A1A18">${code}</span>
          </div>
          <p style="font-size:12px;color:#9A918A">If you didn't request this, you can safely ignore this email.</p>
          <hr style="border:none;border-top:1px solid #E4DBD0;margin:24px 0"/>
          <p style="font-size:11px;color:#9A918A;text-align:center">PokéCraft — Handmade with love ♥</p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[POST /api/auth/send-otp] Email send failed:', err)
    return NextResponse.json(
      { error: 'Failed to send verification email. Please try again.', code: 'EMAIL_SEND_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
