import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { ProductService } from '@/lib/services/ProductService'
import { z } from 'zod'
import { parseBody } from '@/lib/schemas'

const UpdateStockSchema = z.object({
  stock_count: z.coerce.number().int().min(0, 'Stock cannot be negative'),
})

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
    return NextResponse.json({ error: 'Product ID must be a number', code: 'INVALID_ID' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON', code: 'INVALID_JSON' }, { status: 400 })
  }

  const parsed = parseBody(UpdateStockSchema, body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error, code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  try {
    await ProductService.updateStock(numId, parsed.data.stock_count)
    return NextResponse.json({ ok: true, productId: numId, stock_count: parsed.data.stock_count })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[PATCH /api/products/[id]]', msg)
    return NextResponse.json({ error: 'Failed to update stock', code: 'STOCK_UPDATE_ERROR', detail: msg }, { status: 500 })
  }
}
