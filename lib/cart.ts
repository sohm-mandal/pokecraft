'use client'

import type { CartItem } from '@/types'

const CART_KEY = 'pokecraft_cart'

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveCart(cart: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

export function addToCart(item: CartItem): CartItem[] {
  const cart = getCart()
  const existing = cart.find((c) => c.productId === item.productId)
  if (existing) {
    existing.quantity += item.quantity
  } else {
    cart.push(item)
  }
  saveCart(cart)
  return cart
}

export function removeFromCart(productId: number): CartItem[] {
  const cart = getCart().filter((c) => c.productId !== productId)
  saveCart(cart)
  return cart
}

export function updateQuantity(productId: number, quantity: number): CartItem[] {
  const cart = getCart()
  const item = cart.find((c) => c.productId === productId)
  if (item) {
    item.quantity = quantity
  }
  saveCart(cart)
  return cart
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY)
}

export function cartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
}
