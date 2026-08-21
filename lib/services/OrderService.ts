import crypto from 'crypto'
import { OrderRepository } from '@/lib/repositories/OrderRepository'
import { decrementStock, restoreStock } from '@/lib/stock'
import { mailer } from '@/lib/mailer'
import {
  newOrderSellerHtml,
  orderConfirmedCustomerHtml,
  newCodOrderSellerHtml,
  codOrderConfirmedCustomerHtml,
  getStatusEmailCopy,
  orderStatusUpdateCustomerHtml,
} from '@/lib/emails'
import type { CartItem, Order, OrderItem, OrderStatus, ShippingAddress } from '@/types'

const sellerEmail = () => process.env.GMAIL_USER!

export const OrderService = {
  async createOnlineOrder(data: {
    razorpay_order_id: string
    buyer_name: string
    buyer_email: string
    buyer_phone: string
    shipping_address: ShippingAddress
    items: CartItem[]
    total_amount: number
  }): Promise<number> {
    const orderItems: OrderItem[] = data.items.map(i => ({
      id: i.productId,
      name: i.name,
      quantity: i.quantity,
      price: i.price,
    }))
    return OrderRepository.insert({
      ...data,
      items: orderItems,
      status: 'pending',
    })
  },

  async createCodOrder(data: {
    buyer_name: string
    buyer_email: string
    buyer_phone: string
    shipping_address: ShippingAddress
    items: CartItem[]
  }): Promise<number> {
    const orderItems: OrderItem[] = data.items.map(i => ({
      id: i.productId,
      name: i.name,
      quantity: i.quantity,
      price: i.price,
    }))
    const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const codRef = `COD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const orderId = await OrderRepository.insert({
      razorpay_order_id: codRef,
      ...data,
      items: orderItems,
      total_amount: total,
      status: 'placed',
    })

    await decrementStock(orderItems)

    const from = `PokéCraft <${sellerEmail()}>`
    const seller = sellerEmail()

    const codResults = await Promise.allSettled([
      mailer.sendMail({
        from,
        to: seller,
        subject: `New COD Order #${orderId} — ₹${Math.round(total / 100).toLocaleString('en-IN')}`,
        html: newCodOrderSellerHtml({
          orderId, buyerName: data.buyer_name, buyerEmail: data.buyer_email,
          buyerPhone: data.buyer_phone, items: orderItems, address: data.shipping_address,
        }),
      }),
      mailer.sendMail({
        from,
        to: data.buyer_email,
        subject: `Order Confirmed — PokéCraft #${orderId} (Cash on Delivery)`,
        html: codOrderConfirmedCustomerHtml({ orderId, buyerName: data.buyer_name, items: orderItems, address: data.shipping_address }),
      }),
    ])
    codResults.forEach((r, i) => { if (r.status === 'rejected') console.error(`[OrderService.createCodOrder] Email ${i} failed:`, r.reason) })

    return orderId
  },

  async confirmOnlinePayment(order: Order, razorpayPaymentId: string): Promise<void> {
    const items = order.items as OrderItem[]
    await decrementStock(items)
    await OrderRepository.updateStatusAndPaymentId(order.id, 'placed', razorpayPaymentId)

    const from = `PokéCraft <${sellerEmail()}>`
    const seller = sellerEmail()

    const confirmResults = await Promise.allSettled([
      mailer.sendMail({
        from: `PokéCraft Orders <${seller}>`,
        to: seller,
        subject: `New order #${order.id} — ₹${Math.round(order.total_amount / 100).toLocaleString('en-IN')}`,
        html: newOrderSellerHtml({
          orderId: order.id, buyerName: order.buyer_name, buyerEmail: order.buyer_email,
          buyerPhone: order.buyer_phone, items, address: order.shipping_address, paymentId: razorpayPaymentId,
        }),
      }),
      mailer.sendMail({
        from,
        to: order.buyer_email,
        subject: `Your PokéCraft order #${order.id} is confirmed!`,
        html: orderConfirmedCustomerHtml({ orderId: order.id, buyerName: order.buyer_name, items, address: order.shipping_address }),
      }),
    ])
    confirmResults.forEach((r, i) => { if (r.status === 'rejected') console.error(`[OrderService.confirmOnlinePayment] Email ${i} failed:`, r.reason) })
  },

  async updateStatus(order: Order, status: OrderStatus): Promise<void> {
    await OrderRepository.updateStatus(order.id, status)

    if (status === 'cancelled' || status === 'returned') {
      await restoreStock(order.items as OrderItem[])
    }

    const emailCopy = getStatusEmailCopy(status)
    if (emailCopy && order.buyer_email) {
      try {
        await mailer.sendMail({
          from: `PokéCraft <${sellerEmail()}>`,
          to: order.buyer_email,
          subject: emailCopy.subject,
          html: orderStatusUpdateCustomerHtml({
            orderId: order.id, buyerName: order.buyer_name,
            items: order.items as OrderItem[], heading: emailCopy.heading, body: emailCopy.body,
          }),
        })
      } catch (e) {
        console.error('[OrderService.updateStatus] Email failed:', e)
      }
    }
  },

  verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')
    return expected === signature
  },

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!secret) return true  // no secret configured — allow in dev
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
    return expected === signature
  },
}
