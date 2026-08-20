import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { name, slug, description, price, stock_count, image_url } = await req.json()
  const rows = await sql`
    INSERT INTO products (name, slug, description, price, stock_count, image_url)
    VALUES (${name}, ${slug}, ${description}, ${price}, ${stock_count}, ${image_url})
    RETURNING *
  `
  return NextResponse.json(rows[0])
}
