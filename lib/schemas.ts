import { z } from 'zod'

export const ShippingAddressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Invalid 6-digit PIN code'),
})

export const CartItemSchema = z.object({
  productId: z.number().int().positive(),
  name: z.string().min(1),
  price: z.number().int().positive(),
  quantity: z.number().int().positive(),
  image: z.string(),
})

export const CreateOrderSchema = z.object({
  buyer_name: z.string().min(1, 'Name is required'),
  buyer_email: z.string().email('Invalid email address'),
  buyer_phone: z.string().regex(/^[6-9][0-9]{9}$/, 'Invalid 10-digit Indian mobile number'),
  shipping_address: ShippingAddressSchema,
  items: z.array(CartItemSchema).min(1, 'Cart cannot be empty'),
})

export const UpdateStatusSchema = z.object({
  status: z.enum(['placed', 'shipped', 'delivered', 'cancelled', 'returned']),
})

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers and hyphens only'),
  pokemon_name: z.string().min(1, 'Pokémon name is required'),
  description: z.string().optional(),
  price: z.coerce.number().int().positive('Price must be a positive integer in paise'),
  stock_count: z.coerce.number().int().min(0).default(0),
  image_url: z.string().optional(),
})

export const CustomOrderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  pokemon: z.string().min(1, 'Pokémon name is required'),
  details: z.string().optional(),
})

export const VerifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
})

export const AdminEmailSchema = z.object({
  orderId: z.coerce.number().int().positive(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
})

// Helper: parse and return a 400 response on failure
export function parseBody<T>(schema: z.ZodSchema<T>, data: unknown):
  | { success: true; data: T }
  | { success: false; error: string } {
  const result = schema.safeParse(data)
  if (!result.success) {
    const first = result.error.issues[0]
    return { success: false, error: `${first.path.join('.')}: ${first.message}` }
  }
  return { success: true, data: result.data }
}
