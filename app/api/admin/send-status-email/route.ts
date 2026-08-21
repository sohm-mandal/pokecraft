import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { OrderRepository } from '@/lib/repositories/OrderRepository'
import { mailer } from '@/lib/mailer'
import { getStatusEmailCopy, orderStatusUpdateCustomerHtml } from '@/lib/emails'
import type { Order, OrderItem } from '@/types'

export async function POST(req: NextRequest) {
  const session = await auth()
  const role = (session?.user as { role?: string })?.role
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { orderId } = await req.json()
  if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })

  const order = await OrderRepository.findById(Number(orderId)) as Order | null
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const copy = getStatusEmailCopy(order.status)
  if (!copy) {
    return NextResponse.json({ error: `No email template for status "${order.status}"` }, { status: 422 })
  }

  try {
    await mailer.sendMail({
      from: `PokéCraft <${process.env.GMAIL_USER}>`,
      to: order.buyer_email,
      subject: copy.subject,
      html: orderStatusUpdateCustomerHtml({
        orderId: order.id,
        buyerName: order.buyer_name,
        items: order.items as OrderItem[],
        heading: copy.heading,
        body: copy.body,
      }),
    })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[send-status-email]', msg)
    return NextResponse.json({ error: 'Email failed', detail: msg }, { status: 500 })
  }
}
