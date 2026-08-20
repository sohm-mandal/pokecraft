import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get('ids')
  if (!idsParam) return NextResponse.json([])

  const ids = idsParam.split(',').map(Number).filter(Boolean)
  if (!ids.length) return NextResponse.json([])

  const rows = await sql`SELECT * FROM products WHERE id = ANY(${ids})`
  return NextResponse.json(rows)
}
