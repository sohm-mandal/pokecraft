import { notFound } from 'next/navigation'
import Link from 'next/link'
import { sql } from '@/lib/db'
import type { Order, OrderItem } from '@/types'

async function getOrder(id: string): Promise<Order | null> {
  const rows = await sql`SELECT * FROM orders WHERE id = ${parseInt(id)} LIMIT 1`
  return (rows[0] as Order) ?? null
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrder(id)
  if (!order) notFound()

  const items = order.items as OrderItem[]
  const total = (order.total_amount / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  })

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center">
      <div className="text-6xl mb-6">
        {order.status === 'placed' ? '🎉' : '⏳'}
      </div>
      <h1 className="font-serif text-4xl mb-3">
        {order.status === 'placed' ? 'Order Confirmed!' : 'Processing your order…'}
      </h1>
      <p className="text-[#6B6560] mb-8">
        {order.status === 'placed'
          ? `Thank you, ${order.buyer_name}! Your order #${order.id} has been placed.`
          : 'Payment is being verified. This page will update shortly.'}
      </p>

      {order.status === 'placed' && (
        <div className="bg-white border border-[#E5DDD4] rounded-2xl p-6 text-left mb-8">
          <h2 className="font-medium mb-4 text-sm tracking-widest uppercase text-[#6B6560]">
            Order Summary
          </h2>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between py-2 border-b border-[#F0EAE0] last:border-0">
              <span>{item.name} × {item.quantity}</span>
              <span>
                {((item.price * item.quantity) / 100).toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 0,
                })}
              </span>
            </div>
          ))}
          <div className="flex justify-between pt-3 font-semibold">
            <span>Total</span>
            <span>{total}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-[#E5DDD4] text-sm text-[#6B6560]">
            <p>Ships to: {order.shipping_address.line1}, {order.shipping_address.city} — {order.shipping_address.pincode}</p>
            <p className="mt-1">Expected delivery: 7–10 business days</p>
          </div>
        </div>
      )}

      <Link
        href="/shop"
        className="inline-block bg-[#1A1A18] text-[#F8F5F0] px-8 py-3 rounded-full font-medium hover:bg-[#C9906A] transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  )
}
