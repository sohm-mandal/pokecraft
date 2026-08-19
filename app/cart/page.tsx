'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getCart, removeFromCart, updateQuantity, cartTotal } from '@/lib/cart'
import type { CartItem } from '@/types'

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    setCart(getCart())
  }, [])

  function handleRemove(productId: number) {
    setCart(removeFromCart(productId))
  }

  function handleQty(productId: number, qty: number) {
    if (qty < 1) return
    setCart(updateQuantity(productId, qty))
  }

  const total = cartTotal(cart)
  const totalRupees = (total / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  })

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="text-6xl mb-6">🧺</p>
        <h1 className="font-serif text-3xl mb-3">Your cart is empty</h1>
        <p className="text-[#6B6560] mb-8">Add some plushies to get started!</p>
        <Link
          href="/shop"
          className="inline-block bg-[#1A1A18] text-[#F8F5F0] px-8 py-3 rounded-full font-medium hover:bg-[#C9906A] transition-colors"
        >
          Browse the Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-serif text-4xl mb-10">Your Cart</h1>
      <div className="space-y-6 mb-10">
        {cart.map((item) => {
          const itemTotal = (item.price * item.quantity / 100).toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
          })
          return (
            <div key={item.productId} className="flex items-center gap-4 border-b border-[#E5DDD4] pb-6">
              <div className="w-16 h-16 rounded-xl bg-[#F0EAE0] flex items-center justify-center text-3xl flex-shrink-0">
                🧶
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-sm text-[#6B6560]">
                  {(item.price / 100).toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    minimumFractionDigits: 0,
                  })} each
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQty(item.productId, item.quantity - 1)}
                  className="w-8 h-8 rounded-full border border-[#E5DDD4] hover:border-[#1A1A18] transition-colors text-sm"
                >
                  −
                </button>
                <span className="w-6 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => handleQty(item.productId, item.quantity + 1)}
                  className="w-8 h-8 rounded-full border border-[#E5DDD4] hover:border-[#1A1A18] transition-colors text-sm"
                >
                  +
                </button>
              </div>
              <p className="font-semibold w-20 text-right">{itemTotal}</p>
              <button
                onClick={() => handleRemove(item.productId)}
                className="text-[#6B6560] hover:text-red-500 transition-colors ml-2 text-lg"
                aria-label="Remove"
              >
                ×
              </button>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between border-t border-[#1A1A18] pt-6">
        <div>
          <p className="text-sm text-[#6B6560]">Total</p>
          <p className="font-serif text-3xl">{totalRupees}</p>
        </div>
        <Link
          href="/checkout"
          className="bg-[#1A1A18] text-[#F8F5F0] px-10 py-4 rounded-full font-medium hover:bg-[#C9906A] transition-colors"
        >
          Checkout
        </Link>
      </div>
    </div>
  )
}
