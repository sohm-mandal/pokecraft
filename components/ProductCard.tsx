import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/types'
import { StockBadge } from './StockBadge'

interface Props {
  product: Product
}

export function ProductCard({ product }: Props) {
  const rupees = (product.price / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  })

  return (
    <Link href={`/shop/${product.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <div style={{ overflow: 'hidden', borderRadius: '1rem', background: '#F0EAE0', aspectRatio: '1', position: 'relative', marginBottom: '0.75rem' }}>
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            style={{ objectFit: 'contain', padding: '1rem', transition: 'transform 0.3s' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>🧶</div>
        )}
      </div>
      <div>
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9906A', fontWeight: 600, marginBottom: '0.25rem' }}>
          {product.pokemon_name}
        </p>
        <h3 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1rem', color: '#1A1A18', margin: '0 0 0.5rem' }}>
          {product.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, color: '#1A1A18' }}>{rupees}</span>
          <StockBadge count={product.stock_count} />
        </div>
      </div>
    </Link>
  )
}
