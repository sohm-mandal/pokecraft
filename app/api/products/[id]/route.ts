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
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const parsed = parseBody(UpdateStockSchema, await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const { id } = await params
  await ProductService.updateStock(parseInt(id), parsed.data.stock_count)
  return NextResponse.json({ ok: true })
}
