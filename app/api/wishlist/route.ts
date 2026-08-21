import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { WishlistService } from '@/lib/services/WishlistService'
import { parseBody } from '@/lib/schemas'
import { z } from 'zod'

const AddWishlistSchema = z.object({
  productId: z.number().int().positive(),
})

export async function GET() {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    console.log('[wishlist] fetching for', email)
    const products = await WishlistService.getWishlist(email)
    console.log('[wishlist] got', products.length, 'products')
    return NextResponse.json(products)
  } catch (err) {
    console.error('[wishlist] error', err)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = parseBody(AddWishlistSchema, await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

  await WishlistService.addItem(email, parsed.data.productId)
  return NextResponse.json({ ok: true })
}
