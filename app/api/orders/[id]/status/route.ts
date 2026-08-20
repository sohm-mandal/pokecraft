import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { mailer } from '@/lib/mailer'
import type { Order, OrderItem, OrderStatus } from '@/types'

const STOCK_RESTORE_STATUSES: OrderStatus[] = ['cancelled', 'returned']

const STATUS_EMAIL: Partial<Record<OrderStatus, { subject: string; heading: string; body: string }>> = {
  shipped: {
    subject: 'Your PokéCraft order has shipped! 📦',
    heading: 'Your order is on its way!',
    body: 'Great news — your handmade plushie has been packed with care and is now on its way to you. India delivery typically takes 7–10 business days.',
  },
  delivered: {
    subject: 'Your PokéCraft order has been delivered! 🎉',
    heading: 'Your plushie has arrived!',
    body: 'We hope you love your new handmade Pokémon plushie! If anything looks wrong, please contact us within 7 days with photos.',
  },
  cancelled: {
    subject: 'Your PokéCraft order has been cancelled',
    heading: 'Order cancelled',
    body: 'Your order has been cancelled. If you did not request this or have any questions, please get in touch with us.',
  },
}

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

  // Send customer status email if there's an email and a template for this status
  const emailTemplate = STATUS_EMAIL[status]
  if (emailTemplate && order.buyer_email) {
    const items = order.items as OrderItem[]
    const itemsList = items.map(i => `<li>${i.name} ×${i.quantity}</li>`).join('')
    const total = Math.round(order.total_amount / 100).toLocaleString('en-IN')

    try {
      await mailer.sendMail({
        from: `PokéCraft <${process.env.GMAIL_USER}>`,
        to: order.buyer_email,
        subject: emailTemplate.subject,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1A1A18">
            <h2 style="color:#C9906A">${emailTemplate.heading} 🧶</h2>
            <p style="font-size:15px;color:#6B6560">Hi ${order.buyer_name},</p>
            <p style="font-size:15px;color:#6B6560">${emailTemplate.body}</p>
            <div style="background:#F8F5F0;border:1px solid #E4DBD0;border-radius:12px;padding:20px;margin:20px 0">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#9A918A">Order #${order.id}</p>
              <ul style="margin:0;padding-left:18px;color:#1A1A18;font-size:14px">${itemsList}</ul>
              <p style="margin:12px 0 0;font-size:14px;font-weight:600">Total: ₹${total}</p>
            </div>
            <hr style="border:none;border-top:1px solid #E4DBD0;margin:24px 0"/>
            <p style="font-size:11px;color:#9A918A;text-align:center">PokéCraft — Handmade with love ♥</p>
          </div>
        `,
      })
    } catch (e) {
      console.error('Status email failed:', e)
    }
  }

  return NextResponse.json({ ok: true, status })
}
