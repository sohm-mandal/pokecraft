import { NextRequest, NextResponse } from 'next/server'
import { OrderRepository } from '@/lib/repositories/OrderRepository'
import { OrderService } from '@/lib/services/OrderService'
import type { Order } from '@/types'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-razorpay-signature') ?? ''

  if (!OrderService.verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Signature verification failed', code: 'INVALID_SIGNATURE' }, { status: 400 })
  }

  let event: { event: string; payload: { payment: { entity: { order_id: string; id: string } } } }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Webhook body is not valid JSON', code: 'INVALID_JSON' }, { status: 400 })
  }

  if (event.event !== 'payment.captured') {
    return NextResponse.json({ ok: true, skipped: true, reason: `Unhandled event: ${event.event}` })
  }

  const payment = event.payload.payment.entity
  const razorpayOrderId: string = payment.order_id
  const razorpayPaymentId: string = payment.id

  let order: Order | null
  try {
    order = (await OrderRepository.findByRazorpayOrderId(razorpayOrderId)) as Order | null
  } catch (err) {
    console.error('[webhook/razorpay] DB lookup failed:', err)
    return NextResponse.json({ error: 'Failed to look up order', code: 'DB_ERROR' }, { status: 500 })
  }

  // Idempotency — duplicate webhooks or already-confirmed orders are no-ops
  if (!order) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'Order not found — may have been deleted' })
  }
  if (order.status !== 'pending') {
    return NextResponse.json({ ok: true, skipped: true, reason: `Order already in status: ${order.status}` })
  }

  try {
    await OrderService.confirmOnlinePayment(order, razorpayPaymentId)
  } catch (err) {
    console.error('[webhook/razorpay] confirmOnlinePayment failed:', err)
    return NextResponse.json({ error: 'Failed to confirm payment', code: 'CONFIRM_ERROR' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, orderId: order.id })
}
