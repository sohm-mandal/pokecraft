import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  const role = (session?.user as { role?: string })?.role
  if (!session?.user || role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [orderRows, productRows] = await Promise.all([
    sql`SELECT * FROM orders ORDER BY created_at DESC`,
    sql`SELECT * FROM products ORDER BY id`,
  ])

  return NextResponse.json({ orders: orderRows, products: productRows })
}
