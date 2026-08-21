import { NextRequest, NextResponse } from 'next/server'
import { razorpay } from '@/lib/razorpay'
import { OrderService } from '@/lib/services/OrderService'
import { CreateOrderSchema, parseBody } from '@/lib/schemas'

export async function POST(req: NextRequest) {
  const parsed = parseBody(CreateOrderSchema, await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const { buyer_name, buyer_email, buyer_phone, shipping_address, items } = parsed.data
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  // Create Razorpay order first (infrastructure concern stays in the route)
  const rzpOrder = await razorpay.orders.create({
    amount: total,
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  })

  const orderId = await OrderService.createOnlineOrder({
    razorpay_order_id: rzpOrder.id,
    buyer_name,
    buyer_email,
    buyer_phone,
    shipping_address,
    items,
    total_amount: total,
  })

  return NextResponse.json({ orderId, razorpayOrderId: rzpOrder.id, amount: total })
}
