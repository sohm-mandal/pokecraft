import { WishlistRepository } from '@/lib/repositories/WishlistRepository'
import { ProductRepository } from '@/lib/repositories/ProductRepository'
import type { Product } from '@/types'

export const WishlistService = {
  async getWishlist(email: string): Promise<Product[]> {
    const ids = await WishlistRepository.getProductIds(email)
    if (!ids.length) return []
    return ProductRepository.findByIds(ids)
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
