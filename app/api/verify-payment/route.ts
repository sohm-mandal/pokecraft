import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { sql } from '@/lib/db'
import { resend } from '@/lib/resend'
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

    // Send seller notification email
    const sellerEmail = process.env.SELLER_EMAIL!
    const itemList = items.map((i) => `${i.name} × ${i.quantity}`).join(', ')
    const total = (order.total_amount / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    })

    try {
      await resend.emails.send({
        from: 'PokéCraft Orders <onboarding@resend.dev>',
        to: sellerEmail,
        subject: `New order #${order.id} — ${total}`,
        html: `
          <h2>New Order Received</h2>
          <p><strong>Order #${order.id}</strong></p>
          <p><strong>Customer:</strong> ${order.buyer_name} (${order.buyer_email})</p>
          <p><strong>Phone:</strong> ${order.buyer_phone}</p>
          <p><strong>Items:</strong> ${itemList}</p>
          <p><strong>Total:</strong> ${total}</p>
          <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
          <hr/>
          <p><strong>Shipping Address:</strong><br/>
            ${(order.shipping_address as { line1: string; line2?: string; city: string; state: string; pincode: string }).line1}<br/>
            ${(order.shipping_address as { line2?: string }).line2 ? (order.shipping_address as { line2: string }).line2 + '<br/>' : ''}
            ${(order.shipping_address as { city: string; state: string; pincode: string }).city}, ${(order.shipping_address as { state: string }).state} — ${(order.shipping_address as { pincode: string }).pincode}
          </p>
        `,
      })
    } catch (e) {
      console.error('Failed to send order email:', e)
    }
  }

  return NextResponse.json({ verified: true })
}
