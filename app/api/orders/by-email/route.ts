import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sql } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHENTICATED' }, { status: 401 })
  }

  const email = req.nextUrl.searchParams.get('email')
  if (!email) {
    return NextResponse.json({ error: 'email query param is required', code: 'MISSING_EMAIL' }, { status: 400 })
  }

  // Customers can only query their own orders; admins can query any
  const role = (session.user as { role?: string })?.role
  if (role !== 'admin' && session.user.email?.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json(
      { error: 'You can only view your own orders', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }

  try {
    const rows = await sql`
      SELECT * FROM orders WHERE buyer_email = ${email} ORDER BY created_at DESC
    `
    return NextResponse.json(rows)
  } catch (err) {
    console.error('[GET /api/orders/by-email]', err)
    return NextResponse.json({ error: 'Failed to fetch orders', code: 'DB_ERROR' }, { status: 500 })
  }
}
