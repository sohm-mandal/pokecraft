import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { OrderRepository } from '@/lib/repositories/OrderRepository'
import { mailer } from '@/lib/mailer'
import { adminMessageCustomerHtml } from '@/lib/emails'
import { AdminEmailSchema, parseBody } from '@/lib/schemas'

export async function POST(req: NextRequest) {
  const session = await auth()
  const role = (session?.user as { role?: string })?.role
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const parsed = parseBody(AdminEmailSchema, await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const { orderId, subject, message } = parsed.data

  const order = await OrderRepository.findById(orderId)
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const sellerEmail = process.env.GMAIL_USER!

  try {
    await mailer.sendMail({
      from: `PokéCraft <${sellerEmail}>`,
      to: order.buyer_email,
      subject: `${subject} — PokéCraft Order #${order.id}`,
      html: adminMessageCustomerHtml({
        orderId: order.id,
        buyerName: order.buyer_name,
        message,
        sellerEmail,
      }),
    })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[send-email] Mailer error:', msg)
    return NextResponse.json({ error: 'Email failed', detail: msg }, { status: 500 })
  }
}
