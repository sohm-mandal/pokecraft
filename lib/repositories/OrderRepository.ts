import { sql } from '@/lib/db'
import type { Order, OrderItem, OrderStatus, ShippingAddress } from '@/types'

export const OrderRepository = {
  async findById(id: number): Promise<Order | null> {
    const rows = await sql`SELECT * FROM orders WHERE id = ${id} LIMIT 1`
    return (rows[0] as Order) ?? null
  },

  async findByEmail(email: string): Promise<Order[]> {
    const rows = await sql`SELECT * FROM orders WHERE buyer_email = ${email} ORDER BY created_at DESC`
    return rows as Order[]
  },

  async findAll(): Promise<Order[]> {
    const rows = await sql`SELECT * FROM orders ORDER BY created_at DESC`
    return rows as Order[]
  },

  async findByRazorpayOrderId(razorpayOrderId: string): Promise<Order | null> {
    const rows = await sql`
      SELECT * FROM orders WHERE razorpay_order_id = ${razorpayOrderId} LIMIT 1
    `
    return (rows[0] as Order) ?? null
  },

  async countByStatus(): Promise<Record<string, number>> {
    const rows = await sql`SELECT status, COUNT(*) as count FROM orders GROUP BY status`
    return Object.fromEntries((rows as { status: string; count: string }[]).map(r => [r.status, parseInt(r.count)]))
  },

  async insert(data: {
    razorpay_order_id: string
    buyer_name: string
    buyer_email: string
    buyer_phone: string
    shipping_address: ShippingAddress
    items: OrderItem[]
    total_amount: number
    status: OrderStatus
  }): Promise<number> {
    const rows = await sql`
      INSERT INTO orders (
        razorpay_order_id, buyer_name, buyer_email, buyer_phone,
        shipping_address, items, total_amount, status
      ) VALUES (
        ${data.razorpay_order_id}, ${data.buyer_name}, ${data.buyer_email}, ${data.buyer_phone},
        ${JSON.stringify(data.shipping_address)}, ${JSON.stringify(data.items)},
        ${data.total_amount}, ${data.status}
      )
      RETURNING id
    `
    return (rows[0] as { id: number }).id
  },

  async updateStatus(id: number, status: OrderStatus): Promise<void> {
    await sql`UPDATE orders SET status = ${status} WHERE id = ${id}`
  },

  async updateStatusAndPaymentId(id: number, status: OrderStatus, paymentId: string): Promise<void> {
    await sql`
      UPDATE orders SET status = ${status}, razorpay_payment_id = ${paymentId} WHERE id = ${id}
    `
  },
}
