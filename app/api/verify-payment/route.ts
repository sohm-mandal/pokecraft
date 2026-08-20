import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { sql } from '@/lib/db'
import { mailer } from '@/lib/mailer'
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

    const addr = order.shipping_address as { line1: string; line2?: string; city: string; state: string; pincode: string }

    try {
      // Seller notification
      await mailer.sendMail({
        from: `PokéCraft Orders <${process.env.GMAIL_USER}>`,
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
            ${addr.line1}<br/>
            ${addr.line2 ? addr.line2 + '<br/>' : ''}
            ${addr.city}, ${addr.state} — ${addr.pincode}
          </p>
        `,
      })
    } catch (e) {
      console.error('Failed to send seller email:', e)
    }

    try {
      // Customer confirmation
      await mailer.sendMail({
        from: `PokéCraft <${process.env.GMAIL_USER}>`,
        to: order.buyer_email,
        subject: `Your PokéCraft order #${order.id} is confirmed!`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1A1A18">
            <h2 style="color:#C9906A">Thank you, ${order.buyer_name}! 🧶</h2>
            <p>Your order has been confirmed and we're already getting started on your handmade plushie.</p>
            <table style="width:100%;border-collapse:collapse;margin:24px 0">
              <tr style="background:#F8F5F0">
                <td style="padding:10px 14px;font-size:13px"><strong>Order</strong></td>
                <td style="padding:10px 14px;font-size:13px">#${order.id}</td>
              </tr>
              <tr>
                <td style="padding:10px 14px;font-size:13px"><strong>Items</strong></td>
                <td style="padding:10px 14px;font-size:13px">${itemList}</td>
              </tr>
              <tr style="background:#F8F5F0">
                <td style="padding:10px 14px;font-size:13px"><strong>Total</strong></td>
                <td style="padding:10px 14px;font-size:13px">${total}</td>
              </tr>
              <tr>
                <td style="padding:10px 14px;font-size:13px"><strong>Ships to</strong></td>
                <td style="padding:10px 14px;font-size:13px">${addr.line1}, ${addr.city}, ${addr.state} — ${addr.pincode}</td>
              </tr>
            </table>
            <p style="font-size:13px;color:#6B6560">Expected delivery: <strong>7–10 business days</strong></p>
            <p style="font-size:13px;color:#6B6560">Questions? Reply to this email or contact us at ${sellerEmail}</p>
            <hr style="border:none;border-top:1px solid #E4DBD0;margin:24px 0"/>
            <p style="font-size:11px;color:#9A918A;text-align:center">PokéCraft — Handmade with love ♥</p>
          </div>
        `,
      })
    } catch (e) {
      console.error('Failed to send customer email:', e)
    }
  }

  return NextResponse.json({ verified: true })
}
