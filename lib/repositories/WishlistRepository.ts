import { sql } from '@/lib/db'

export const WishlistRepository = {
  async getProductIds(email: string): Promise<number[]> {
    const rows = await sql`
      SELECT product_id FROM wishlist WHERE user_email = ${email} ORDER BY created_at ASC
    `
    return (rows as { product_id: number }[]).map(r => r.product_id)
  },

  async addItem(email: string, productId: number): Promise<void> {
    await sql`
      INSERT INTO wishlist (user_email, product_id) VALUES (${email}, ${productId})
      ON CONFLICT DO NOTHING
    `
  },

  async removeItem(email: string, productId: number): Promise<void> {
    await sql`
      DELETE FROM wishlist WHERE user_email = ${email} AND product_id = ${productId}
    `
  },
}
