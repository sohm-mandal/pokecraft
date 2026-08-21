import { sql } from './db'
import type { OrderItem } from '@/types'

export async function decrementStock(items: OrderItem[]): Promise<void> {
  for (const item of items) {
    await sql`
      UPDATE products
      SET stock_count = stock_count - ${item.quantity}
      WHERE id = ${item.id} AND stock_count >= ${item.quantity}
    `
  }
}

export async function restoreStock(items: OrderItem[]): Promise<void> {
  for (const item of items) {
    await sql`
      UPDATE products
      SET stock_count = stock_count + ${item.quantity}
      WHERE id = ${item.id}
    `
  }
}
