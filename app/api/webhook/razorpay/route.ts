import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { sql } from '@/lib/db'
import { resend } from '@/lib/resend'
import type { Order, OrderItem } from '@/types'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-razorpay-signature') ?? ''
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!

  // Verify HMAC-SHA256 signature
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  if (secret && expectedSig !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(rawBody)
  if (event.event !== 'payment.captured') {
    return NextResponse.json({ ok: true })
  }

  const payment = event.payload.payment.entity
  const razorpayOrderId: string = payment.order_id
  const razorpayPaymentId: string = payment.id

  // Find order — guard: only update if still pending (idempotency via UNIQUE constraint)
  const orderRows = await sql`
    SELECT * FROM orders WHERE razorpay_order_id = ${razorpayOrderId} LIMIT 1
  `
  const order = orderRows[0] as Order | undefined
  if (!order || order.status !== 'pending') {
    return NextResponse.json({ ok: true })  // duplicate webhook — no-op
  }

  // Decrement stock for each item (race-safe: WHERE stock_count >= quantity)
  const items = order.items as OrderItem[]
  for (const item of items) {
    const updated = await sql`
      UPDATE products
      SET stock_count = stock_count - ${item.quantity}
      WHERE id = ${item.id} AND stock_count >= ${item.quantity}
      RETURNING id
    `
    if (!updated.length) {
      // This shouldn't happen in practice — log and continue
      console.error(`Insufficient stock for product ${item.id} on order ${order.id}`)
    }
  }

  // Transition order to placed
  await sql`
    UPDATE orders
    SET status = 'placed', razorpay_payment_id = ${razorpayPaymentId}
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
      <p><strong>Payment ID:</strong> ${razorpayPaymentId}</p>
      <hr/>
      <p><strong>Shipping Address:</strong><br/>
        ${order.shipping_address.line1}<br/>
        ${order.shipping_address.line2 ? order.shipping_address.line2 + '<br/>' : ''}
        ${order.shipping_address.city}, ${order.shipping_address.state} — ${order.shipping_address.pincode}
      </p>
    `,
  })

  return NextResponse.json({ ok: true })
}
