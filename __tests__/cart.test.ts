import type { CartItem } from '@/types'
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  cartTotal,
  getCart,
} from '@/lib/cart'

const mockItem = (productId: number, quantity = 1, price = 50000): CartItem => ({
  productId,
  name: `Pokemon ${productId}`,
  price,
  quantity,
  image: '/img.jpg',
})

let store: Record<string, string> = {}
const localStorageMock = {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v },
  removeItem: (k: string) => { delete store[k] },
  clear: () => { store = {} },
}

beforeAll(() => {
  Object.defineProperty(global, 'localStorage', { value: localStorageMock })
  Object.defineProperty(global, 'window', { value: global })
})

beforeEach(() => {
  localStorageMock.clear()
})

test('getCart returns empty array when nothing stored', () => {
  expect(getCart()).toEqual([])
})

test('addToCart adds a new item', () => {
  const cart = addToCart(mockItem(1))
  expect(cart).toHaveLength(1)
  expect(cart[0].productId).toBe(1)
})

test('addToCart increments quantity for existing item', () => {
  addToCart(mockItem(1, 1))
  const cart = addToCart(mockItem(1, 2))
  expect(cart).toHaveLength(1)
  expect(cart[0].quantity).toBe(3)
})

test('removeFromCart removes item by productId', () => {
  addToCart(mockItem(1))
  addToCart(mockItem(2))
  const cart = removeFromCart(1)
  expect(cart).toHaveLength(1)
  expect(cart[0].productId).toBe(2)
})

test('updateQuantity changes item quantity', () => {
  addToCart(mockItem(1, 1))
  const cart = updateQuantity(1, 5)
  expect(cart[0].quantity).toBe(5)
})

test('clearCart empties the cart', () => {
  addToCart(mockItem(1))
  clearCart()
  expect(getCart()).toEqual([])
})

test('cartTotal sums price × quantity in paise', () => {
  const cart = [mockItem(1, 2, 50000), mockItem(2, 1, 75000)]
  expect(cartTotal(cart)).toBe(175000)
})
