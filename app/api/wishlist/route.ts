import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import type { Product } from '@/types'

export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get('ids')
  if (!idsParam) return NextResponse.json([])

  const ids = idsParam.split(',').map(Number).filter(n => Number.isInteger(n) && n > 0)
  if (!ids.length) return NextResponse.json([])

  // Fetch each product individually and collect results — avoids ANY($1::int[])
  // array parameter serialization issues with the Neon HTTP driver
  const results = await Promise.all(
    ids.map(id => sql`SELECT * FROM products WHERE id = ${id} LIMIT 1`)
  )

  const products = results
    .flat()
    .filter(Boolean) as Product[]

  return NextResponse.json(products)
}
