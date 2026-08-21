import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { CartService } from '@/lib/services/CartService'
import { parseBody } from '@/lib/schemas'
import { z } from 'zod'

const AddItemSchema = z.object({
  productId: z.number().int().positive('productId must be a positive integer'),
  quantity: z.number().int().positive('quantity must be a positive integer'),
})

export async function GET() {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHENTICATED' }, { status: 401 })

  try {
    const items = await CartService.getCart(email)
    return NextResponse.json(items)
  } catch (err) {
    console.error('[GET /api/cart]', err)
    return NextResponse.json({ error: 'Failed to fetch cart', code: 'DB_ERROR' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHENTICATED' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON', code: 'INVALID_JSON' }, { status: 400 })
  }

  const parsed = parseBody(AddItemSchema, body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error, code: 'VALIDATION_ERROR' }, { status: 400 })

  try {
    await CartService.addOrUpdateItem(email, parsed.data.productId, parsed.data.quantity)
    const items = await CartService.getCart(email)
    return NextResponse.json(items)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[POST /api/cart]', msg)
    return NextResponse.json({ error: 'Failed to add item to cart', code: 'CART_UPDATE_ERROR', detail: msg }, { status: 500 })
  }
}

export async function DELETE() {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHENTICATED' }, { status: 401 })

  try {
    await CartService.clearCart(email)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/cart]', err)
    return NextResponse.json({ error: 'Failed to clear cart', code: 'CART_CLEAR_ERROR' }, { status: 500 })
  }
}
