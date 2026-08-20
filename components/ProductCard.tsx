'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import type { Product } from '@/types'
import { StockBadge } from './StockBadge'

interface Props {
  product: Product
}

export function ProductCard({ product }: Props) {
  const [hovered, setHovered] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)

  useEffect(() => {
    const ids: number[] = JSON.parse(localStorage.getItem('pokecraft_wishlist') ?? '[]')
    setWishlisted(ids.includes(product.id))
  }, [product.id])

  function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const ids: number[] = JSON.parse(localStorage.getItem('pokecraft_wishlist') ?? '[]')
    const next = wishlisted ? ids.filter(id => id !== product.id) : [...ids, product.id]
    localStorage.setItem('pokecraft_wishlist', JSON.stringify(next))
    setWishlisted(!wishlisted)
    window.dispatchEvent(new Event('wishlist-updated'))
  }

  const rupees = (product.price / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  })

  return (
    <Link href={`/shop/${product.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <div
        style={{ overflow: 'hidden', borderRadius: '1rem', background: '#F0EAE0', aspectRatio: '1', position: 'relative', marginBottom: '0.75rem' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
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

        {/* Wishlist button — appears on hover */}
        <button
          onClick={toggleWishlist}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          style={{
            position: 'absolute', top: '10px', right: '10px',
            width: '36px', height: '36px',
            background: 'white',
            border: '1.5px solid #E4DBD0',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            opacity: hovered || wishlisted ? 1 : 0,
            transform: hovered || wishlisted ? 'scale(1)' : 'scale(0.8)',
            transition: 'opacity 0.2s, transform 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? '#E05252' : 'none'} stroke={wishlisted ? '#E05252' : '#6B6560'} strokeWidth="1.8" strokeLinecap="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
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
