import { notFound } from 'next/navigation'
import Image from 'next/image'
import { sql } from '@/lib/db'
import type { Product } from '@/types'
import { StockBadge } from '@/components/StockBadge'

export const dynamic = 'force-dynamic'
import { CartButton } from '@/components/CartButton'

function isVideo(url: string) {
  return /\.(mp4|webm|ogg|mov)$/i.test(url)
}

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

  const firstMedia = product.images[0] ?? null

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
      {/* Media — image or video */}
      <div style={{ borderRadius: '1.25rem', background: '#F0EAE0', overflow: 'hidden', aspectRatio: '1', position: 'relative' }}>
        {firstMedia ? (
          isVideo(firstMedia) ? (
            <video
              src={firstMedia}
              controls
              autoPlay
              muted
              loop
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Image
              src={firstMedia}
              alt={product.name}
              fill
              style={{ objectFit: 'contain', padding: '1.5rem' }}
            />
          )
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem' }}>🧶</div>
        )}
      </div>

      {/* Extra media thumbnails if more than 1 */}
      {product.images.length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', gridColumn: '1', marginTop: '-2rem' }}>
          {product.images.slice(1).map((url, i) => (
            <div key={i} style={{ width: '4rem', height: '4rem', borderRadius: '0.5rem', background: '#F0EAE0', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
              {isVideo(url) ? (
                <video src={url} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Image src={url} alt={`${product.name} ${i + 2}`} fill style={{ objectFit: 'cover' }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9906A', marginBottom: '0.75rem', fontWeight: 600 }}>
          {product.pokemon_name}
        </p>
        <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '2.5rem', color: '#1A1A18', marginBottom: '0.75rem', lineHeight: 1.2 }}>
          {product.name}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 600 }}>{rupees}</span>
          <StockBadge count={product.stock_count} />
        </div>
        {product.description && (
          <p style={{ color: '#6B6560', lineHeight: 1.7, marginBottom: '2rem' }}>{product.description}</p>
        )}
        <CartButton item={cartItem} disabled={product.stock_count === 0} />
        <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#6B6560', textAlign: 'center' }}>
          Handmade to order · Ships within 7–10 days · Pan-India delivery
        </p>
      </div>
    </div>
  )
}
