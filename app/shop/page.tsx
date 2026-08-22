import { sql } from '@/lib/db'
import type { Product } from '@/types'
import { ProductCard } from '@/components/ProductCard'

export const dynamic = 'force-dynamic'

const TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  electric: { label: 'Electric', emoji: '⚡' },
  fire:     { label: 'Fire',     emoji: '🔥' },
  water:    { label: 'Water',    emoji: '💧' },
  grass:    { label: 'Grass',    emoji: '🌿' },
  ghost:    { label: 'Ghost',    emoji: '👻' },
  fairy:    { label: 'Fairy',    emoji: '🌸' },
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  const normalised = type?.toLowerCase().trim()

  const rows = normalised
    ? await sql`SELECT * FROM products WHERE LOWER(pokemon_type) = ${normalised} ORDER BY id`
    : await sql`SELECT * FROM products ORDER BY id`

  const products = rows as Product[]
  const meta = normalised ? TYPE_LABELS[normalised] : null

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <p className="text-xs font-medium tracking-widest uppercase text-[#C9906A] mb-2">
          {meta ? 'Collection' : 'The Collection'}
        </p>
        <h1 className="font-serif text-4xl text-[#1A1A18]">
          {meta ? `${meta.emoji} ${meta.label} Type` : 'All Plushies'}
        </h1>
        {meta && (
          <a href="/shop" className="text-sm text-[#9A918A] mt-2 inline-block hover:text-[#C9906A]" style={{ textDecoration: 'none' }}>
            ← All plushies
          </a>
        )}
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9A918A' }}>
          <p style={{ fontSize: '3rem', marginBottom: '16px' }}>🧶</p>
          <p style={{ fontSize: '16px' }}>No plushies in this collection yet — check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
