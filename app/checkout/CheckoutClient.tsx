'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { getCart, clearCart, cartTotal } from '@/lib/cart'
import type { CartItem } from '@/types'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

interface Props {
  sessionEmail: string
  sessionName: string
}

export function CheckoutClient({ sessionEmail, sessionName }: Props) {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    buyer_name: sessionName,
    buyer_email: sessionEmail,
    buyer_phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  })

  useEffect(() => {
    const c = getCart()
    if (c.length === 0) router.replace('/cart')
    setCart(c)
  }, [router])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyer_name: form.buyer_name,
        buyer_email: form.buyer_email,
        buyer_phone: form.buyer_phone,
        shipping_address: {
          line1: form.line1,
          line2: form.line2 || undefined,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
        items: cart,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      alert(data.error ?? 'Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    const rzp = new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: data.amount,
      currency: 'INR',
      name: 'PokéCraft',
      description: 'Handmade Pokémon crochet plushies',
      order_id: data.razorpayOrderId,
      prefill: {
        name: form.buyer_name,
        email: form.buyer_email,
        contact: form.buyer_phone,
      },
      handler: async (response: {
        razorpay_payment_id: string
        razorpay_order_id: string
        razorpay_signature: string
      }) => {
        const verifyRes = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        })
        if (!verifyRes.ok) {
          alert('Payment verification failed. Please contact support with your payment ID: ' + response.razorpay_payment_id)
          setLoading(false)
          return
        }
        clearCart()
        router.push(`/order/${data.orderId}`)
      },
      modal: {
        ondismiss: () => setLoading(false),
      },
    })

    rzp.open()
  }

  const total = cartTotal(cart)
  const totalRupees = (total / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  })

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-serif text-4xl mb-10">Checkout</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <section>
          <h2 className="font-medium text-sm tracking-widest uppercase text-[#6B6560] mb-4">
            Contact Details
          </h2>
          <div className="space-y-4">
            <input
              name="buyer_name"
              value={form.buyer_name}
              onChange={handleChange}
              required
              placeholder="Full Name"
              className="w-full border border-[#E5DDD4] rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-[#1A1A18]"
            />
            <input
              name="buyer_email"
              type="email"
              value={form.buyer_email}
              onChange={handleChange}
              required
              placeholder="Email Address"
              readOnly={!!sessionEmail}
              className={`w-full border border-[#E5DDD4] rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-[#1A1A18] ${sessionEmail ? 'bg-[#F8F5F0] text-[#6B6560] cursor-not-allowed' : ''}`}
            />
            <input
              name="buyer_phone"
              type="tel"
              value={form.buyer_phone}
              onChange={handleChange}
              required
              pattern="[6-9][0-9]{9}"
              title="Enter a valid 10-digit Indian mobile number"
              placeholder="Mobile Number (10 digits)"
              className="w-full border border-[#E5DDD4] rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-[#1A1A18]"
            />
          </div>
        </section>

        <section>
          <h2 className="font-medium text-sm tracking-widest uppercase text-[#6B6560] mb-4">
            Shipping Address
          </h2>
          <div className="space-y-4">
            <input
              name="line1"
              value={form.line1}
              onChange={handleChange}
              required
              placeholder="Address Line 1"
              className="w-full border border-[#E5DDD4] rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-[#1A1A18]"
            />
            <input
              name="line2"
              value={form.line2}
              onChange={handleChange}
              placeholder="Address Line 2 (optional)"
              className="w-full border border-[#E5DDD4] rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-[#1A1A18]"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                placeholder="City"
                className="border border-[#E5DDD4] rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-[#1A1A18]"
              />
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                required
                placeholder="State"
                className="border border-[#E5DDD4] rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-[#1A1A18]"
              />
            </div>
            <input
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              required
              pattern="[1-9][0-9]{5}"
              title="Enter a valid 6-digit PIN code"
              placeholder="PIN Code"
              className="w-full border border-[#E5DDD4] rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-[#1A1A18]"
            />
          </div>
        </section>

        <div className="border-t border-[#E5DDD4] pt-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#6B6560]">Order Total</p>
            <p className="font-serif text-3xl">{totalRupees}</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#1A1A18] text-[#F8F5F0] px-10 py-4 rounded-full font-medium hover:bg-[#C9906A] transition-colors disabled:opacity-60"
          >
            {loading ? 'Opening payment…' : `Pay ${totalRupees}`}
          </button>
        </div>
      </form>
    </div>
  )
}
