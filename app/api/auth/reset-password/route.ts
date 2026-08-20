import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { email, code, newPassword } = await req.json()
  if (!email || !code || !newPassword) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  if (String(newPassword).length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })

  const normalised = String(email).toLowerCase().trim()

  // Verify OTP
  const rows = await sql`SELECT * FROM otps WHERE email = ${normalised} LIMIT 1`
  const otp = rows[0] as { email: string; code: string; expires_at: string } | undefined
  if (!otp) return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 400 })
  if (otp.code !== String(code).trim()) return NextResponse.json({ error: 'Incorrect code. Please try again.' }, { status: 400 })
  if (new Date(otp.expires_at) < new Date()) return NextResponse.json({ error: 'Code has expired. Please request a new one.' }, { status: 400 })

  // Delete OTP
  await sql`DELETE FROM otps WHERE email = ${normalised}`

  // Update password
  const updated = await sql`
    UPDATE site_users SET password = ${String(newPassword)}
    WHERE username = ${normalised}
    RETURNING id
  `
  if (updated.length === 0) return NextResponse.json({ error: 'No account found with this email.' }, { status: 404 })

  return NextResponse.json({ ok: true })
}
