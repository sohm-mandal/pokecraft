'use client'

import { useState, FormEvent } from 'react'

export default function CustomOrdersPage() {
  const [form, setForm] = useState({ name: '', pokemon: '', details: '', email: '', phone: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('loading')
    const res = await fetch('/api/custom-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setStatus(res.ok ? 'success' : 'error')
  }

  if (status === 'success') {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '24px' }}>🧶</div>
        <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '2.2rem', color: '#1A1A18', marginBottom: '16px' }}>Request received!</h1>
        <p style={{ fontSize: '15px', lineHeight: 1.8, color: '#6B6560', fontWeight: 300, maxWidth: '480px', margin: '0 auto 32px' }}>
          Thank you for reaching out. I&apos;ll review your request and get back to you at <strong>{form.email}</strong> within 24 hours.
        </p>
        <button
          onClick={() => { setForm({ name: '', pokemon: '', details: '', email: '', phone: '' }); setStatus('idle') }}
          style={{ background: 'none', border: '1.5px solid #1A1A18', padding: '12px 32px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', color: '#1A1A18' }}
        >
          Submit another request
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 1.5rem' }}>
      <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9906A', marginBottom: '16px', fontWeight: 500 }}>Commission</p>
      <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '3rem', color: '#1A1A18', marginBottom: '16px', lineHeight: 1.2 }}>Custom Orders</h1>
      <p style={{ fontSize: '15px', lineHeight: 1.8, color: '#6B6560', fontWeight: 300, marginBottom: '48px' }}>
        Want a Pokémon that&apos;s not in our shop? We take custom commissions! Fill in the form below and I&apos;ll get back to you within 24 hours with a quote.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.05em', color: '#3A3530' }}>Your Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Full name"
            style={{ border: '1.5px solid #E4DBD0', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', fontFamily: 'inherit', background: 'white', outline: 'none' }}
          />
        </div>

        {/* Email */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.05em', color: '#3A3530' }}>Your Email *</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
            style={{ border: '1.5px solid #E4DBD0', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', fontFamily: 'inherit', background: 'white', outline: 'none' }}
          />
        </div>

        {/* Phone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.05em', color: '#3A3530' }}>Phone Number (optional)</label>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="10-digit mobile number"
            style={{ border: '1.5px solid #E4DBD0', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', fontFamily: 'inherit', background: 'white', outline: 'none' }}
          />
        </div>

        {/* Pokémon */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.05em', color: '#3A3530' }}>Which Pokémon? *</label>
          <input
            name="pokemon"
            value={form.pokemon}
            onChange={handleChange}
            required
            placeholder="E.g. Lucario, Shiny Charizard, Togepi…"
            style={{ border: '1.5px solid #E4DBD0', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', fontFamily: 'inherit', background: 'white', outline: 'none' }}
          />
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.05em', color: '#3A3530' }}>Special Requests</label>
          <textarea
            name="details"
            value={form.details}
            onChange={handleChange}
            rows={4}
            placeholder="Size, colour variations, accessories, gifting notes…"
            style={{ border: '1.5px solid #E4DBD0', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', fontFamily: 'inherit', background: 'white', outline: 'none', resize: 'vertical' }}
          />
        </div>

        {status === 'error' && (
          <p style={{ color: '#E05252', fontSize: '13px', margin: 0 }}>Something went wrong. Please try again or email me directly at sohammandal.work24@gmail.com</p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          style={{ background: '#1A1A18', color: '#F8F5F0', border: 'none', padding: '15px 40px', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start', opacity: status === 'loading' ? 0.6 : 1 }}
        >
          {status === 'loading' ? 'Sending…' : 'Send Request'}
        </button>

        <p style={{ fontSize: '12px', color: '#9A918A', margin: 0 }}>
          Custom orders typically take 2–3 weeks. Pricing starts at ₹1,200 depending on complexity. I&apos;ll confirm availability and quote before any payment.
        </p>
      </form>
    </div>
  )
}
