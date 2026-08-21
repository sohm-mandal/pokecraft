import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { WishlistService } from '@/lib/services/WishlistService'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId } = await params
  const id = parseInt(productId)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })

  await WishlistService.removeItem(email, id)
  return NextResponse.json({ ok: true })
}
