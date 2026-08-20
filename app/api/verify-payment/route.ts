import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { sql } from '@/lib/db'
import type { Order, OrderItem } from '@/types'

interface VerifyBody {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as VerifyBody
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Signature verified — update order to placed
  const orderRows = await sql`
    SELECT * FROM orders WHERE razorpay_order_id = ${razorpay_order_id} LIMIT 1
  `
  const order = orderRows[0] as Order | undefined

  if (order && order.status === 'pending') {
    const items = order.items as OrderItem[]

    for (const item of items) {
      await sql`
        UPDATE products
        SET stock_count = stock_count - ${item.quantity}
        WHERE id = ${item.id} AND stock_count >= ${item.quantity}
      `
    }

    await sql`
      UPDATE orders
      SET status = 'placed', razorpay_payment_id = ${razorpay_payment_id}
      WHERE id = ${order.id}
    `
  }

  return NextResponse.json({ verified: true })
}
