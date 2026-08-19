import { notFound } from 'next/navigation'
import Image from 'next/image'
import { sql } from '@/lib/db'
import type { Product } from '@/types'
import { StockBadge } from '@/components/StockBadge'
import { CartButton } from '@/components/CartButton'

async function getProduct(slug: string): Promise<Product | null> {
  const rows = await sql`SELECT * FROM products WHERE slug = ${slug} LIMIT 1`
  return (rows[0] as Product) ?? null
}

export async function generateStaticParams() {
  const rows = await sql`SELECT slug FROM products`
  return (rows as { slug: string }[]).map((r) => ({ slug: r.slug }))
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const rupees = (product.price / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  })

  const cartItem = {
    productId: product.id,
    name: product.name,
    price: product.price,
    quantity: 1,
    image: product.images[0] ?? '',
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-12">
      {/* Image */}
      <div className="aspect-square rounded-2xl bg-[#F0EAE0] overflow-hidden relative">
        {product.images[0] ? (
          <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl">🧶</div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col justify-center">
        <p className="text-xs font-medium tracking-widest uppercase text-[#C9906A] mb-3">
          {product.pokemon_name}
        </p>
        <h1 className="font-serif text-4xl text-[#1A1A18] mb-3">{product.name}</h1>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl font-semibold">{rupees}</span>
          <StockBadge count={product.stock_count} />
        </div>
        {product.description && (
          <p className="text-[#6B6560] leading-relaxed mb-8">{product.description}</p>
        )}
        <CartButton item={cartItem} disabled={product.stock_count === 0} />
        <p className="mt-4 text-xs text-[#6B6560] text-center">
          Handmade to order · Ships within 7–10 days · Pan-India delivery
        </p>
      </div>
    </div>
  )
}
