import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { CartService } from '@/lib/services/CartService'
import { parseBody } from '@/lib/schemas'
import { z } from 'zod'

const AddItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
})

export async function GET() {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const items = await CartService.getCart(email)
    return NextResponse.json(items)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = parseBody(AddItemSchema, await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

  try {
    await CartService.addOrUpdateItem(email, parsed.data.productId, parsed.data.quantity)
    const items = await CartService.getCart(email)
    return NextResponse.json(items)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to add item'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}

export async function DELETE() {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await CartService.clearCart(email)
  } catch { /* non-fatal */ }
  return NextResponse.json({ ok: true })
}
