export type OrderStatus =
  | 'pending'
  | 'placed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'

export interface Product {
  id: number
  name: string
  slug: string
  pokemon_name: string
  description: string | null
  price: number       // paise
  stock_count: number
  images: string[]
}

export interface CartItem {
  productId: number
  name: string
  price: number       // paise
  quantity: number
  image: string
}

export interface ShippingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
}

export interface OrderItem {
  id: number
  name: string
  quantity: number
  price: number       // paise
}

export interface Order {
  id: number
  razorpay_payment_id: string | null
  razorpay_order_id: string
  buyer_name: string
  buyer_email: string
  buyer_phone: string
  shipping_address: ShippingAddress
  items: OrderItem[]
  total_amount: number  // paise
  status: OrderStatus
  created_at: string
}
