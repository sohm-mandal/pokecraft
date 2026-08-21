import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
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

  try {
    const orderId = await OrderService.createCodOrder({
      buyer_name, buyer_email, buyer_phone, shipping_address, items,
    })
    return NextResponse.json({ orderId }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[POST /api/orders/create-cod]', msg)
    if (msg.toLowerCase().includes('stock')) {
      return NextResponse.json({ error: 'One or more items are out of stock', code: 'OUT_OF_STOCK', detail: msg }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create order', code: 'ORDER_CREATE_ERROR', detail: msg }, { status: 500 })
  }
}
