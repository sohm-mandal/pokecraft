import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import type { Order } from '@/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const rows = await sql`SELECT * FROM orders WHERE id = ${parseInt(id)} LIMIT 1`
  const order = rows[0] as Order | undefined
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}
