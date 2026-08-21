import { WishlistRepository } from '@/lib/repositories/WishlistRepository'
import { sql } from '@/lib/db'
import type { Product } from '@/types'

export const WishlistService = {
  async getWishlist(email: string): Promise<Product[]> {
    // Single JOIN query — avoids the ANY($1::int[]) Neon HTTP driver issue
    const rows = await sql`
      SELECT p.*
      FROM products p
      JOIN wishlist w ON w.product_id = p.id
      WHERE w.user_email = ${email}
      ORDER BY w.created_at ASC
    `
    return rows as Product[]
  },

  getProductIds(email: string): Promise<number[]> {
    return WishlistRepository.getProductIds(email)
  },

  addItem(email: string, productId: number): Promise<void> {
    return WishlistRepository.addItem(email, productId)
  },

  removeItem(email: string, productId: number): Promise<void> {
    return WishlistRepository.removeItem(email, productId)
  },
}
