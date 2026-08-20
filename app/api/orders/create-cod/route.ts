import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { mailer } from '@/lib/mailer'
import type { CartItem, ShippingAddress } from '@/types'

interface Body {
  buyer_name: string
  buyer_email: string
  buyer_phone: string
  shipping_address: ShippingAddress
  items: CartItem[]
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Body
  const { buyer_name, buyer_email, buyer_phone, shipping_address, items } = body

  if (!buyer_name || !buyer_email || !buyer_phone || !shipping_address || !items?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const orderItems = items.map((i) => ({
    id: i.productId,
    name: i.name,
    quantity: i.quantity,
    price: i.price,
  }))

  // Unique COD reference — no Razorpay involved
  const codRef = `COD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  // Insert as placed immediately (no payment pending)
  const rows = await sql`
    INSERT INTO orders (
      razorpay_order_id, buyer_name, buyer_email, buyer_phone,
      shipping_address, items, total_amount, status
    ) VALUES (
      ${codRef}, ${buyer_name}, ${buyer_email}, ${buyer_phone},
      ${JSON.stringify(shipping_address)}, ${JSON.stringify(orderItems)}, ${total}, 'placed'
    )
    RETURNING id
  `
  const orderId = (rows[0] as { id: number }).id

  // Decrement stock
  for (const item of orderItems) {
    await sql`
      UPDATE products SET stock_count = stock_count - ${item.quantity}
      WHERE id = ${item.id} AND stock_count >= ${item.quantity}
    `
  }

  // Notify seller
  const itemsList = orderItems.map(i => `${i.name} ×${i.quantity}`).join(', ')
  try {
    await mailer.sendMail({
      from: `PokéCraft <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER!,
      subject: `New COD Order #${orderId} — ₹${Math.round(total / 100)}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1A1A18">
          <h2 style="color:#C9906A">New Cash on Delivery Order 🏠</h2>
          <p><strong>Order #${orderId}</strong></p>
          <p><strong>Customer:</strong> ${buyer_name} &lt;${buyer_email}&gt;<br/>
             <strong>Phone:</strong> ${buyer_phone}<br/>
             <strong>Items:</strong> ${itemsList}<br/>
             <strong>Total:</strong> ₹${Math.round(total / 100)}<br/>
             <strong>Address:</strong> ${shipping_address.line1}${shipping_address.line2 ? ', ' + shipping_address.line2 : ''}, ${shipping_address.city}, ${shipping_address.state} – ${shipping_address.pincode}</p>
        </div>
      `,
    })
  } catch (e) {
    console.error('COD seller email failed:', e)
  }

  // Customer confirmation
  try {
    await mailer.sendMail({
      from: `PokéCraft <${process.env.GMAIL_USER}>`,
      to: buyer_email,
      subject: `Order Confirmed — PokéCraft #${orderId} (Cash on Delivery)`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1A1A18">
          <h2 style="color:#C9906A">Order confirmed! 🧶</h2>
          <p>Hi ${buyer_name}, your order has been placed successfully.</p>
          <p><strong>Items:</strong> ${itemsList}<br/>
             <strong>Total:</strong> ₹${Math.round(total / 100)}<br/>
             <strong>Payment:</strong> Cash on Delivery</p>
          <p style="color:#6B6560;font-size:13px">You'll pay when your order arrives. India delivery typically takes 7–10 business days.</p>
          <hr style="border:none;border-top:1px solid #E4DBD0;margin:24px 0"/>
          <p style="font-size:11px;color:#9A918A;text-align:center">PokéCraft — Handmade with love ♥</p>
        </div>
      `,
    })
  } catch (e) {
    console.error('COD customer email failed:', e)
  }

  return NextResponse.json({ orderId })
}
