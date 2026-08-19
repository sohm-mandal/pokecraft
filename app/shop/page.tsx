import { sql } from '@/lib/db'
import type { Product } from '@/types'
import { ProductCard } from '@/components/ProductCard'

async function getAllProducts(): Promise<Product[]> {
  const rows = await sql`SELECT * FROM products ORDER BY id`
  return rows as Product[]
}

export default async function ShopPage() {
  const products = await getAllProducts()

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-xs font-medium tracking-widest uppercase text-[#C9906A] mb-2">
          The Collection
        </p>
        <h1 className="font-serif text-4xl text-[#1A1A18]">All Plushies</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
