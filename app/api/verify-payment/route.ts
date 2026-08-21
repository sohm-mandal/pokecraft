import { NextRequest, NextResponse } from 'next/server'
import { OrderRepository } from '@/lib/repositories/OrderRepository'
import { OrderService } from '@/lib/services/OrderService'
import { VerifyPaymentSchema, parseBody } from '@/lib/schemas'
import type { Order } from '@/types'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON', code: 'INVALID_JSON' }, { status: 400 })
  }

  const parsed = parseBody(VerifyPaymentSchema, body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error, code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data

  if (!OrderService.verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return NextResponse.json(
      { error: 'Payment signature verification failed', code: 'INVALID_SIGNATURE' },
      { status: 400 }
    )
  }

  let order: Order | null
  try {
    order = (await OrderRepository.findByRazorpayOrderId(razorpay_order_id)) as Order | null
  } catch (err) {
    console.error('[POST /api/verify-payment] DB lookup failed:', err)
    return NextResponse.json({ error: 'Failed to look up order', code: 'DB_ERROR' }, { status: 500 })
  }

  if (!order) {
    return NextResponse.json(
      { error: `No order found for Razorpay order ${razorpay_order_id}`, code: 'ORDER_NOT_FOUND' },
      { status: 404 }
    )
  }

  if (order.status !== 'pending') {
    // Already confirmed — idempotent success
    return NextResponse.json({ verified: true, orderId: order.id, alreadyConfirmed: true })
  }

  try {
    await OrderService.confirmOnlinePayment(order, razorpay_payment_id)
  } catch (err) {
    console.error('[POST /api/verify-payment] confirmOnlinePayment failed:', err)
    return NextResponse.json({ error: 'Payment confirmed but post-processing failed', code: 'CONFIRM_ERROR' }, { status: 500 })
  }

  return NextResponse.json({ verified: true, orderId: order.id })
}
