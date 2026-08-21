import { NextRequest, NextResponse } from 'next/server'
import { OrderRepository } from '@/lib/repositories/OrderRepository'
import { OrderService } from '@/lib/services/OrderService'
import { VerifyPaymentSchema, parseBody } from '@/lib/schemas'
import type { Order } from '@/types'

export async function POST(req: NextRequest) {
  const parsed = parseBody(VerifyPaymentSchema, await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data

  if (!OrderService.verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const order = await OrderRepository.findByRazorpayOrderId(razorpay_order_id)

  if (order && order.status === 'pending') {
    await OrderService.confirmOnlinePayment(order as Order, razorpay_payment_id)
  }

  return NextResponse.json({ verified: true })
}
