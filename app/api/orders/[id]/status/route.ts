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
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const parsed = parseBody(UpdateStatusSchema, await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const { id } = await params
  const order = await OrderRepository.findById(parseInt(id))
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  await OrderService.updateStatus(order as Order, parsed.data.status)

  return NextResponse.json({ ok: true, status: parsed.data.status })
}
