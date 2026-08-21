import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { CartService } from '@/lib/services/CartService'
import { parseBody } from '@/lib/schemas'
import { z } from 'zod'

const UpdateQtySchema = z.object({
  quantity: z.number().int().min(0),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId } = await params
  const id = parseInt(productId)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })

  const parsed = parseBody(UpdateQtySchema, await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

  await CartService.updateQuantity(email, id, parsed.data.quantity)
  const items = await CartService.getCart(email)
  return NextResponse.json(items)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId } = await params
  const id = parseInt(productId)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })

  await CartService.removeItem(email, id)
  return NextResponse.json({ ok: true })
}
