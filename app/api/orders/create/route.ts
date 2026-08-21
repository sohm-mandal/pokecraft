import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { razorpay } from '@/lib/razorpay'
import { OrderService } from '@/lib/services/OrderService'
import { CreateOrderSchema, parseBody } from '@/lib/schemas'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required to place an order', code: 'UNAUTHENTICATED' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON', code: 'INVALID_JSON' }, { status: 400 })
  }

  const parsed = parseBody(CreateOrderSchema, body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error, code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  const { buyer_name, buyer_email, buyer_phone, shipping_address, items } = parsed.data
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  if (total <= 0) {
    return NextResponse.json({ error: 'Order total must be greater than zero', code: 'INVALID_TOTAL' }, { status: 400 })
  }

  let rzpOrder: { id: string }
  try {
    rzpOrder = await razorpay.orders.create({
      amount: total,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[POST /api/orders/create] Razorpay error:', msg)
    return NextResponse.json({ error: 'Payment gateway error — could not create order', code: 'RAZORPAY_ERROR', detail: msg }, { status: 502 })
  }

  try {
    const orderId = await OrderService.createOnlineOrder({
      razorpay_order_id: rzpOrder.id,
      buyer_name, buyer_email, buyer_phone, shipping_address, items, total_amount: total,
    })
    return NextResponse.json({ orderId, razorpayOrderId: rzpOrder.id, amount: total }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[POST /api/orders/create] DB error:', msg)
    return NextResponse.json({ error: 'Failed to save order after payment gateway succeeded', code: 'DB_ERROR', detail: msg }, { status: 500 })
  }
}
