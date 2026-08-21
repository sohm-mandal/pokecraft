import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sql } from '@/lib/db'
import type { Order } from '@/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHENTICATED' }, { status: 401 })
  }

  const { id } = await params
  const numId = parseInt(id)
  if (isNaN(numId)) {
    return NextResponse.json({ error: 'Order ID must be a number', code: 'INVALID_ID' }, { status: 400 })
  }

  try {
    const rows = await sql`SELECT * FROM orders WHERE id = ${numId} LIMIT 1`
    const order = rows[0] as Order | undefined
    if (!order) {
      return NextResponse.json({ error: `Order #${numId} not found`, code: 'ORDER_NOT_FOUND' }, { status: 404 })
    }

    // Customers can only see their own order; admins can see any
    const role = (session.user as { role?: string })?.role
    if (role !== 'admin' && order.buyer_email !== session.user.email) {
      return NextResponse.json({ error: 'You do not have access to this order', code: 'FORBIDDEN' }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch (err) {
    console.error('[GET /api/orders/[id]]', err)
    return NextResponse.json({ error: 'Failed to fetch order', code: 'DB_ERROR' }, { status: 500 })
  }
}
