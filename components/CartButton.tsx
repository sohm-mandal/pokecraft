'use client'

import { useState } from 'react'
import { addToCart } from '@/lib/cart'
import type { CartItem } from '@/types'

interface Props {
  item: CartItem
  disabled?: boolean
}

export function CartButton({ item, disabled = false }: Props) {
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addToCart(item)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  if (disabled) {
    return (
      <button
        disabled
        className="w-full py-3 rounded-xl bg-gray-200 text-gray-400 font-medium cursor-not-allowed"
      >
        Out of Stock
      </button>
    )
  }

  return (
    <button
      onClick={handleAdd}
      className="w-full py-3 rounded-xl bg-[#1A1A18] text-[#F8F5F0] font-medium transition-colors hover:bg-[#C9906A] active:scale-95"
    >
      {added ? 'Added to Cart ✓' : 'Add to Cart'}
    </button>
  )
}
