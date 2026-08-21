import { sql } from './db'
import type { OrderItem } from '@/types'

// Decrements stock for all items atomically per-row.
// Throws OUT_OF_STOCK if any item can't be fulfilled, and compensates
// already-decremented items so stock is never left in a partial state.
export async function decrementStock(items: OrderItem[]): Promise<void> {
  const decremented: OrderItem[] = []

  for (const item of items) {
    const rows = await sql`
      UPDATE products
      SET stock_count = stock_count - ${item.quantity}
      WHERE id = ${item.id} AND stock_count >= ${item.quantity}
      RETURNING id
    `

    if (rows.length === 0) {
      // Compensate — restore everything we already decremented this call
      if (decremented.length > 0) {
        await restoreStock(decremented)
      }
      throw Object.assign(
        new Error(`Product ${item.id} is out of stock or has insufficient quantity`),
        { code: 'OUT_OF_STOCK', productId: item.id }
      )
    }

    decremented.push(item)
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
