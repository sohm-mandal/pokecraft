import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { OrderRepository } from '@/lib/repositories/OrderRepository'
import { OrderService } from '@/lib/services/OrderService'
import { UpdateStatusSchema, parseBody } from '@/lib/schemas'
import type { Order } from '@/types'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const role = (session?.user as { role?: string })?.role
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHENTICATED' }, { status: 401 })
  }
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required', code: 'FORBIDDEN' }, { status: 403 })
  }

  const { id } = await params
  const numId = parseInt(id)
  if (isNaN(numId)) {
    return NextResponse.json({ error: 'Order ID must be a number', code: 'INVALID_ID' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON', code: 'INVALID_JSON' }, { status: 400 })
  }

  const parsed = parseBody(UpdateStatusSchema, body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error, code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  let order: Order | null
  try {
    order = (await OrderRepository.findById(numId)) as Order | null
  } catch (err) {
    console.error('[PATCH /api/orders/[id]/status] DB lookup:', err)
    return NextResponse.json({ error: 'Failed to fetch order', code: 'DB_ERROR' }, { status: 500 })
  }

  if (!order) {
    return NextResponse.json({ error: `Order #${numId} not found`, code: 'ORDER_NOT_FOUND' }, { status: 404 })
  }

  try {
    await OrderService.updateStatus(order, parsed.data.status)
    return NextResponse.json({ ok: true, orderId: numId, status: parsed.data.status })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[PATCH /api/orders/[id]/status] updateStatus:', msg)
    return NextResponse.json({ error: 'Failed to update order status', code: 'STATUS_UPDATE_ERROR', detail: msg }, { status: 500 })
  }
}
