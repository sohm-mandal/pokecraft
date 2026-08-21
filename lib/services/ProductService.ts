import { ProductRepository } from '@/lib/repositories/ProductRepository'
import type { Product } from '@/types'

export const ProductService = {
  getAll(): Promise<Product[]> {
    return ProductRepository.findAll()
  },

  getBySlug(slug: string): Promise<Product | null> {
    return ProductRepository.findBySlug(slug)
  },

  getByIds(ids: number[]): Promise<Product[]> {
    return ProductRepository.findByIds(ids)
  },

  async create(data: {
    name: string
    slug: string
    pokemon_name: string
    description?: string
    price: number
    stock_count: number
    image_url?: string
  }): Promise<Product> {
    const images = data.image_url ? [data.image_url] : []
    return ProductRepository.insert({ ...data, images })
  },

  updateStock(id: number, stock_count: number): Promise<void> {
    return ProductRepository.updateStock(id, stock_count)
  },
}
