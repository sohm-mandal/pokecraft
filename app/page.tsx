import Link from 'next/link'
import { sql } from '@/lib/db'
import type { Product } from '@/types'
import { ProductCard } from '@/components/ProductCard'

async function getFeaturedProducts(): Promise<Product[]> {
  const rows = await sql`
    SELECT * FROM products
    ORDER BY id
    LIMIT 4
  `
  return rows as Product[]
}

export default async function HomePage() {
  const products = await getFeaturedProducts()

  return (
    <>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs font-medium tracking-widest uppercase text-[#C9906A] mb-4">
            Handmade with love
          </p>
          <h1 className="font-serif text-5xl md:text-6xl leading-tight mb-6 text-[#1A1A18]">
            Your favourite<br />Pokémon,<br />crocheted.
          </h1>
          <p className="text-[#6B6560] text-lg max-w-md mb-8">
            Each plushie is handcrafted to order using premium cotton yarn. Ships across India.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-[#1A1A18] text-[#F8F5F0] px-8 py-4 rounded-full font-medium hover:bg-[#C9906A] transition-colors"
          >
            Shop the Collection
          </Link>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-80 h-80 rounded-full bg-[#F0EAE0] flex items-center justify-center text-[10rem]">
            🧶
          </div>
        </div>
      </section>

      {/* Benefits bar */}
      <div className="bg-[#1A1A18] text-[#F8F5F0] py-4">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-8 text-sm font-medium">
          <span>✦ Handmade to order</span>
          <span>✦ Ships pan-India</span>
          <span>✦ Premium cotton yarn</span>
          <span>✦ Secure Razorpay payments</span>
        </div>
      </div>

      {/* Featured products */}
      {products.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-[#C9906A] mb-2">
                Best Sellers
              </p>
              <h2 className="font-serif text-4xl text-[#1A1A18]">Fan Favourites</h2>
            </div>
            <Link
              href="/shop"
              className="text-sm font-medium underline underline-offset-4 hover:text-[#C9906A] transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
