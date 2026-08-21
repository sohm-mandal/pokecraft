import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { CartService } from '@/lib/services/CartService'
import { parseBody } from '@/lib/schemas'
import { z } from 'zod'

const UpdateQtySchema = z.object({
  quantity: z.number().int().min(0, 'quantity must be 0 or more'),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHENTICATED' }, { status: 401 })

  const { productId } = await params
  const id = parseInt(productId)
  if (isNaN(id)) return NextResponse.json({ error: 'productId must be a number', code: 'INVALID_ID' }, { status: 400 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON', code: 'INVALID_JSON' }, { status: 400 })
  }

  const parsed = parseBody(UpdateQtySchema, body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error, code: 'VALIDATION_ERROR' }, { status: 400 })

  try {
    await CartService.updateQuantity(email, id, parsed.data.quantity)
    const items = await CartService.getCart(email)
    return NextResponse.json(items)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[PATCH /api/cart/[productId]]', msg)
    return NextResponse.json({ error: 'Failed to update cart quantity', code: 'CART_UPDATE_ERROR', detail: msg }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHENTICATED' }, { status: 401 })

  const { productId } = await params
  const id = parseInt(productId)
  if (isNaN(id)) return NextResponse.json({ error: 'productId must be a number', code: 'INVALID_ID' }, { status: 400 })

  try {
    await CartService.removeItem(email, id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[DELETE /api/cart/[productId]]', msg)
    return NextResponse.json({ error: 'Failed to remove item from cart', code: 'CART_REMOVE_ERROR', detail: msg }, { status: 500 })
  }
}
