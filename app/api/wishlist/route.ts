import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { WishlistService } from '@/lib/services/WishlistService'
import { parseBody } from '@/lib/schemas'
import { z } from 'zod'

const AddWishlistSchema = z.object({
  productId: z.number().int().positive('productId must be a positive integer'),
})

export async function GET() {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHENTICATED' }, { status: 401 })

  try {
    const products = await WishlistService.getWishlist(email)
    return NextResponse.json(products)
  } catch (err) {
    console.error('[GET /api/wishlist]', err)
    return NextResponse.json({ error: 'Failed to fetch wishlist', code: 'DB_ERROR' }, { status: 500 })
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

  const parsed = parseBody(AddWishlistSchema, body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error, code: 'VALIDATION_ERROR' }, { status: 400 })

  try {
    await WishlistService.addItem(email, parsed.data.productId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[POST /api/wishlist]', msg)
    return NextResponse.json({ error: 'Failed to add item to wishlist', code: 'WISHLIST_UPDATE_ERROR', detail: msg }, { status: 500 })
  }
}
