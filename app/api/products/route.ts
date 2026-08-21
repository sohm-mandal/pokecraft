import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { ProductService } from '@/lib/services/ProductService'
import { CreateProductSchema, parseBody } from '@/lib/schemas'

export async function GET() {
  const products = await ProductService.getAll()
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  const role = (session?.user as { role?: string })?.role
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const parsed = parseBody(CreateProductSchema, await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const product = await ProductService.create(parsed.data)
  return NextResponse.json(product, { status: 201 })
}
