import { sql } from '@/lib/db'
import type { CartItem } from '@/types'

export const CartRepository = {
  async findByEmail(email: string): Promise<CartItem[]> {
    const rows = await sql`
      SELECT
        c.product_id   AS "productId",
        p.name,
        p.price,
        c.quantity,
        COALESCE(p.image_url, '') AS image,
        p.stock_count  AS "stockCount"
      FROM cart c
      JOIN products p ON p.id = c.product_id
      WHERE c.user_email = ${email}
      ORDER BY c.created_at ASC
    `
    return rows as CartItem[]
  },

  async upsertItem(email: string, productId: number, quantity: number): Promise<void> {
    await sql`
      INSERT INTO cart (user_email, product_id, quantity)
      VALUES (${email}, ${productId}, ${quantity})
      ON CONFLICT (user_email, product_id)
      DO UPDATE SET quantity = ${quantity}, updated_at = NOW()
    `
  },

  async updateQuantity(email: string, productId: number, quantity: number): Promise<void> {
    await sql`
      UPDATE cart SET quantity = ${quantity}, updated_at = NOW()
      WHERE user_email = ${email} AND product_id = ${productId}
    `
  },

  async removeItem(email: string, productId: number): Promise<void> {
    await sql`
      DELETE FROM cart WHERE user_email = ${email} AND product_id = ${productId}
    `
  },

  async clearCart(email: string): Promise<void> {
    await sql`DELETE FROM cart WHERE user_email = ${email}`
  },
}
