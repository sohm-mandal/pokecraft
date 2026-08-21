import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username')?.toLowerCase().trim()

  if (!username) {
    return NextResponse.json({ error: 'username param required', code: 'MISSING_PARAM' }, { status: 400 })
  }
  if (username.length < 3) {
    return NextResponse.json({ available: false, reason: 'too_short' })
  }
  if (username.length > 30) {
    return NextResponse.json({ available: false, reason: 'too_long' })
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    return NextResponse.json({ available: false, reason: 'invalid_chars' })
  }

  try {
    const rows = await sql`
      SELECT id FROM site_users WHERE username = ${username} LIMIT 1
    `
    return NextResponse.json({ available: rows.length === 0 })
  } catch (err) {
    console.error('[GET /api/auth/check-username]', err)
    return NextResponse.json({ error: 'Failed to check username', code: 'DB_ERROR' }, { status: 500 })
  }
}
