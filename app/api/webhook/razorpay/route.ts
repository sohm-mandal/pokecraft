import { NextRequest, NextResponse } from 'next/server'
import { OrderRepository } from '@/lib/repositories/OrderRepository'
import { OrderService } from '@/lib/services/OrderService'
import type { Order } from '@/types'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-razorpay-signature') ?? ''

  if (!OrderService.verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(rawBody)
  if (event.event !== 'payment.captured') {
    return NextResponse.json({ ok: true })
  }

  const payment = event.payload.payment.entity
  const razorpayOrderId: string = payment.order_id
  const razorpayPaymentId: string = payment.id

  const order = await OrderRepository.findByRazorpayOrderId(razorpayOrderId)

  // Idempotency guard — duplicate webhooks are no-ops
  if (!order || order.status !== 'pending') {
    return NextResponse.json({ ok: true })
  }

  await OrderService.confirmOnlinePayment(order as Order, razorpayPaymentId)

  return NextResponse.json({ ok: true })
}
