import { notFound } from 'next/navigation'
import Image from 'next/image'
import { sql } from '@/lib/db'
import type { Product } from '@/types'
import { StockBadge } from '@/components/StockBadge'

export const dynamic = 'force-dynamic'
import { CartButton } from '@/components/CartButton'
import { WishlistButton } from '@/components/WishlistButton'

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
        <CartButton item={cartItem} stockCount={product.stock_count} disabled={product.stock_count === 0} />
        <WishlistButton productId={product.id} />
        <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#6B6560', textAlign: 'center' }}>
          Handmade to order · Ships within 7–10 days · Pan-India delivery
        </p>
      </div>
      {/* Watch Us Make It */}
      <div style={{ gridColumn: '1 / -1', marginTop: '48px' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9906A', marginBottom: '8px', fontWeight: 500 }}>Behind the Scenes</p>
        <h2 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.8rem', color: '#1A1A18', marginBottom: '24px' }}>Watch Us Make It</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {[
            { id: 'OfnWOLmJbr8', title: 'Crochet Gengar Custom Order' },
            { id: 'gj-G0frikmI', title: 'Pokémon Plushies for Anime Con' },
            { id: 'i3LdtHfRsSw', title: 'Fluffy Pokémon Plushies Vlog' },
            { id: 'WvoU3Yt3t2A', title: 'Turning Pokémon into a Plushie' },
            { id: 'lfgYHmiPlQ4', title: 'Pikachu Amigurumi Tutorial' },
          ].map(({ id, title }) => (
            <div key={id} style={{ borderRadius: '12px', overflow: 'hidden', background: '#1A1A18' }}>
              <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                />
              </div>
              <p style={{ padding: '10px 14px', fontSize: '12px', color: '#9A918A', margin: 0 }}>{title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
