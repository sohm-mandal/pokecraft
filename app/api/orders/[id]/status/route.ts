import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import type { Order, OrderItem, OrderStatus } from '@/types'

const STOCK_RESTORE_STATUSES: OrderStatus[] = ['cancelled', 'returned']

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { status } = (await req.json()) as { status: OrderStatus }

  const validStatuses: OrderStatus[] = ['placed', 'shipped', 'delivered', 'cancelled', 'returned']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const rows = await sql`SELECT * FROM orders WHERE id = ${parseInt(id)} LIMIT 1`
  const order = rows[0] as Order | undefined
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  await sql`UPDATE orders SET status = ${status} WHERE id = ${order.id}`

  // Restore stock on cancellation or return
  if (STOCK_RESTORE_STATUSES.includes(status)) {
    const items = order.items as OrderItem[]
    for (const item of items) {
      await sql`
        UPDATE products
        SET stock_count = stock_count + ${item.quantity}
        WHERE id = ${item.id}
      `
    }
  }

  return NextResponse.json({ ok: true, status })
}
