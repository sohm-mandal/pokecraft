import { sql } from '@/lib/db'
import type { Product } from '@/types'

export const ProductRepository = {
  async findAll(): Promise<Product[]> {
    const rows = await sql`SELECT * FROM products ORDER BY created_at DESC`
    return rows as Product[]
  },

  async findBySlug(slug: string): Promise<Product | null> {
    const rows = await sql`SELECT * FROM products WHERE slug = ${slug} LIMIT 1`
    return (rows[0] as Product) ?? null
  },

  async findByIds(ids: number[]): Promise<Product[]> {
    if (!ids.length) return []
    const results = await Promise.all(
      ids.map(id => sql`SELECT * FROM products WHERE id = ${id} LIMIT 1`)
    )
    return results.flat().filter(Boolean) as Product[]
  },

  async insert(data: {
    name: string
    slug: string
    pokemon_name: string
    description?: string
    price: number
    stock_count: number
    images: string[]
  }): Promise<Product> {
    const rows = await sql`
      INSERT INTO products (name, slug, pokemon_name, description, price, stock_count, images)
      VALUES (${data.name}, ${data.slug}, ${data.pokemon_name}, ${data.description ?? null},
              ${data.price}, ${data.stock_count}, ${data.images})
      RETURNING *
    `
    return rows[0] as Product
  },

  async updateStock(id: number, stock_count: number): Promise<void> {
    await sql`UPDATE products SET stock_count = ${stock_count} WHERE id = ${id}`
  },
}
