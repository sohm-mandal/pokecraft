import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { WishlistService } from '@/lib/services/WishlistService'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHENTICATED' }, { status: 401 })

  const { productId } = await params
  const id = parseInt(productId)
  if (isNaN(id)) return NextResponse.json({ error: 'productId must be a number', code: 'INVALID_ID' }, { status: 400 })

  try {
    await WishlistService.removeItem(email, id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[DELETE /api/wishlist/[productId]]', msg)
    return NextResponse.json({ error: 'Failed to remove item from wishlist', code: 'WISHLIST_REMOVE_ERROR', detail: msg }, { status: 500 })
  }
}
