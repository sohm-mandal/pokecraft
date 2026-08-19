import { NextRequest, NextResponse } from 'next/server'
import { razorpay } from '@/lib/razorpay'
import { sql } from '@/lib/db'
import type { CartItem, ShippingAddress } from '@/types'

interface CreateOrderBody {
  buyer_name: string
  buyer_email: string
  buyer_phone: string
  shipping_address: ShippingAddress
  items: CartItem[]
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as CreateOrderBody
  const { buyer_name, buyer_email, buyer_phone, shipping_address, items } = body

  if (!buyer_name || !buyer_email || !buyer_phone || !shipping_address || !items?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Create Razorpay order first
  const rzpOrder = await razorpay.orders.create({
    amount: total,
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  })

  const orderItems = items.map((i) => ({
    id: i.productId,
    name: i.name,
    quantity: i.quantity,
    price: i.price,
  }))

  // Persist pending order to DB — stock NOT decremented yet
  const rows = await sql`
    INSERT INTO orders (
      razorpay_order_id, buyer_name, buyer_email, buyer_phone,
      shipping_address, items, total_amount, status
    ) VALUES (
      ${rzpOrder.id}, ${buyer_name}, ${buyer_email}, ${buyer_phone},
      ${JSON.stringify(shipping_address)}, ${JSON.stringify(orderItems)}, ${total}, 'pending'
    )
    RETURNING id
  `

  return NextResponse.json({
    orderId: (rows[0] as { id: number }).id,
    razorpayOrderId: rzpOrder.id,
    amount: total,
  })
}
