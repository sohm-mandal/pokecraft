import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sql } from '@/lib/db'
import { mailer } from '@/lib/mailer'
import type { Order } from '@/types'

export async function POST(req: NextRequest) {
  const session = await auth()
  const role = (session?.user as { role?: string })?.role
  if (role !== 'admin') {
    console.error('[send-email] Forbidden — role:', role)
    return NextResponse.json({ error: 'Forbidden', role }, { status: 403 })
  }

  const { orderId, subject, message } = await req.json()
  if (!orderId || !subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const rows = await sql`SELECT * FROM orders WHERE id = ${orderId} LIMIT 1`
  if (!rows.length) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  const order = rows[0] as Order

  try {
    await mailer.sendMail({
      from: `PokéCraft <${process.env.GMAIL_USER}>`,
      to: order.buyer_email,
      subject: `${subject} — PokéCraft Order #${order.id}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1A1A18">
          <div style="background:#F8F5F0;padding:24px 32px;border-radius:12px 12px 0 0;border-bottom:1px solid #E4DBD0">
            <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#C9906A">PokéCraft — Order #${order.id}</p>
          </div>
          <div style="padding:32px">
            <p style="margin:0 0 8px;font-size:15px">Hi ${order.buyer_name},</p>
            <div style="white-space:pre-wrap;font-size:14px;line-height:1.7;color:#3A3530;margin:16px 0">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>
          <div style="padding:16px 32px;background:#F8F5F0;border-radius:0 0 12px 12px;border-top:1px solid #E4DBD0">
            <p style="margin:0;font-size:11px;color:#9A918A">PokéCraft — Handmade with love ♥ · Replies go to ${process.env.GMAIL_USER}</p>
          </div>
        </div>
      `,
    })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[send-email] Mailer error:', msg)
    return NextResponse.json({ error: 'Email failed', detail: msg }, { status: 500 })
  }
}
