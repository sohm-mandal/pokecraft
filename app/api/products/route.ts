import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { ProductService } from '@/lib/services/ProductService'
import { CreateProductSchema, parseBody } from '@/lib/schemas'

export async function GET() {
  try {
    const products = await ProductService.getAll()
    return NextResponse.json(products)
  } catch (err) {
    console.error('[GET /api/products]', err)
    return NextResponse.json({ error: 'Failed to fetch products', code: 'DB_ERROR' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  const role = (session?.user as { role?: string })?.role
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHENTICATED' }, { status: 401 })
  }
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required', code: 'FORBIDDEN' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON', code: 'INVALID_JSON' }, { status: 400 })
  }

  const parsed = parseBody(CreateProductSchema, body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error, code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  try {
    const product = await ProductService.create(parsed.data)
    return NextResponse.json(product, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[POST /api/products]', msg)
    if (msg.toLowerCase().includes('unique') || msg.toLowerCase().includes('duplicate')) {
      return NextResponse.json({ error: 'A product with this slug already exists', code: 'DUPLICATE_SLUG' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create product', code: 'DB_ERROR', detail: msg }, { status: 500 })
  }
}
