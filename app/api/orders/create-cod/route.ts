import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/lib/services/OrderService'
import { CreateOrderSchema, parseBody } from '@/lib/schemas'

export async function POST(req: NextRequest) {
  const parsed = parseBody(CreateOrderSchema, await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const { buyer_name, buyer_email, buyer_phone, shipping_address, items } = parsed.data

  const orderId = await OrderService.createCodOrder({
    buyer_name, buyer_email, buyer_phone, shipping_address, items,
  })

  return NextResponse.json({ orderId })
}
