'use client'

import { useWishlist } from '@/lib/context/WishlistContext'

export function WishlistButton({ productId }: { productId: number }) {
  const { inWishlist, toggle } = useWishlist()
  const wished = inWishlist(productId)

  return (
    <button
      onClick={() => toggle(productId)}
      title={wished ? 'Remove from wishlist' : 'Add to wishlist'}
      style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: '1.5px solid #E4DBD0', borderRadius: '12px', padding: '12px 20px', cursor: 'pointer', fontSize: '13px', color: wished ? '#C9906A' : '#6B6560', fontFamily: 'inherit', marginTop: '10px', width: '100%', justifyContent: 'center' }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={wished ? '#C9906A' : 'none'} stroke={wished ? '#C9906A' : 'currentColor'} strokeWidth="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      {wished ? 'Wishlisted' : 'Add to Wishlist'}
    </button>
  )
}
