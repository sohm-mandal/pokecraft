import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { stock_count } = await req.json()
  await sql`UPDATE products SET stock_count = ${stock_count} WHERE id = ${parseInt(id)}`
  return NextResponse.json({ ok: true })
}
