import { CartRepository } from '@/lib/repositories/CartRepository'
import { sql } from '@/lib/db'
import type { CartItem } from '@/types'

export const CartService = {
  getCart(email: string): Promise<CartItem[]> {
    return CartRepository.findByEmail(email)
  },

  async addOrUpdateItem(email: string, productId: number, quantity: number): Promise<void> {
    const rows = await sql`SELECT stock_count FROM products WHERE id = ${productId}`
    const product = rows[0] as { stock_count: number } | undefined
    if (!product) throw new Error('Product not found')
    const capped = Math.min(quantity, product.stock_count)
    if (capped < 1) throw new Error('No stock available')
    await CartRepository.upsertItem(email, productId, capped)
  },

  async updateQuantity(email: string, productId: number, quantity: number): Promise<void> {
    if (quantity < 1) {
      await CartRepository.removeItem(email, productId)
      return
    }
    const rows = await sql`SELECT stock_count FROM products WHERE id = ${productId}`
    const product = rows[0] as { stock_count: number } | undefined
    const capped = product ? Math.min(quantity, product.stock_count) : quantity
    await CartRepository.updateQuantity(email, productId, capped)
  },

  removeItem(email: string, productId: number): Promise<void> {
    return CartRepository.removeItem(email, productId)
  },

  clearCart(email: string): Promise<void> {
    return CartRepository.clearCart(email)
  },
}
