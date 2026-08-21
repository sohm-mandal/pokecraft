import type { OrderItem, ShippingAddress } from '@/types'

// ── Shared helpers ──────────────────────────────────────────────────────────

function fmtRupees(paise: number) {
  return '₹' + Math.round(paise / 100).toLocaleString('en-IN')
}

function layout(body: string) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1A1A18;background:#fff">
      <div style="background:#F8F5F0;padding:20px 32px;border-bottom:1px solid #E4DBD0">
        <span style="font-family:Georgia,serif;font-size:20px;font-weight:600;color:#1A1A18">PokéCraft</span>
      </div>
      <div style="padding:32px">${body}</div>
      <div style="padding:16px 32px;background:#F8F5F0;border-top:1px solid #E4DBD0">
        <p style="margin:0;font-size:11px;color:#9A918A;text-align:center">
          PokéCraft — Handmade with love ♥
        </p>
      </div>
    </div>
  `
}

function itemTable(items: OrderItem[]) {
  const rows = items.map(i => `
    <tr>
      <td style="padding:8px 14px;font-size:13px;border-bottom:1px solid #F0EBE1">${i.name} ×${i.quantity}</td>
      <td style="padding:8px 14px;font-size:13px;border-bottom:1px solid #F0EBE1;text-align:right;font-weight:500">${fmtRupees(i.price * i.quantity)}</td>
    </tr>
  `).join('')
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#F8F5F0;border-radius:8px;overflow:hidden">
      ${rows}
      <tr>
        <td style="padding:10px 14px;font-size:13px;font-weight:700">Total</td>
        <td style="padding:10px 14px;font-size:13px;font-weight:700;text-align:right">${fmtRupees(total)}</td>
      </tr>
    </table>
  `
}

function addrBlock(addr: ShippingAddress) {
  return [addr.line1, addr.line2, `${addr.city}, ${addr.state} – ${addr.pincode}`]
    .filter(Boolean).join('<br/>')
}

// ── Order confirmed (online payment) ────────────────────────────────────────

export function orderConfirmedCustomerHtml(o: {
  orderId: number
  buyerName: string
  items: OrderItem[]
  address: ShippingAddress
}) {
  return layout(`
    <h2 style="color:#C9906A;margin:0 0 8px">Thank you, ${o.buyerName}! 🧶</h2>
    <p style="color:#6B6560;font-size:14px;line-height:1.7">
      Your order is confirmed and we're already getting started on your handmade plushie.
    </p>
    <p style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#9A918A;margin:24px 0 4px">Order #${o.orderId}</p>
    ${itemTable(o.items)}
    <p style="font-size:13px;color:#6B6560;margin:0"><strong>Ships to:</strong> ${addrBlock(o.address)}</p>
    <p style="font-size:13px;color:#6B6560;margin:12px 0 0">Expected delivery: <strong>7–10 business days</strong></p>
  `)
}

export function newOrderSellerHtml(o: {
  orderId: number
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  items: OrderItem[]
  address: ShippingAddress
  paymentId: string
}) {
  return `
    <h2>New Online Order #${o.orderId}</h2>
    <p><strong>Customer:</strong> ${o.buyerName} &lt;${o.buyerEmail}&gt;<br/>
       <strong>Phone:</strong> ${o.buyerPhone}<br/>
       <strong>Payment ID:</strong> ${o.paymentId}</p>
    ${itemTable(o.items)}
    <p><strong>Ship to:</strong><br/>${addrBlock(o.address)}</p>
  `
}

// ── COD order ────────────────────────────────────────────────────────────────

export function codOrderConfirmedCustomerHtml(o: {
  orderId: number
  buyerName: string
  items: OrderItem[]
  address: ShippingAddress
}) {
  return layout(`
    <h2 style="color:#C9906A;margin:0 0 8px">Order confirmed! 🧶</h2>
    <p style="color:#6B6560;font-size:14px;line-height:1.7">
      Hi ${o.buyerName}, your Cash on Delivery order has been placed.
      You'll pay when your order arrives — no action needed now.
    </p>
    <p style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#9A918A;margin:24px 0 4px">Order #${o.orderId}</p>
    ${itemTable(o.items)}
    <p style="font-size:13px;color:#6B6560;margin:0"><strong>Ships to:</strong> ${addrBlock(o.address)}</p>
    <p style="font-size:13px;color:#6B6560;margin:12px 0 0">Expected delivery: <strong>7–10 business days</strong></p>
  `)
}

export function newCodOrderSellerHtml(o: {
  orderId: number
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  items: OrderItem[]
  address: ShippingAddress
}) {
  return `
    <h2>New COD Order #${o.orderId} 🏠</h2>
    <p><strong>Customer:</strong> ${o.buyerName} &lt;${o.buyerEmail}&gt;<br/>
       <strong>Phone:</strong> ${o.buyerPhone}</p>
    ${itemTable(o.items)}
    <p><strong>Ship to:</strong><br/>${addrBlock(o.address)}</p>
  `
}

// ── Order status updates ─────────────────────────────────────────────────────

const STATUS_COPY: Partial<Record<string, { subject: string; heading: string; body: string }>> = {
  shipped: {
    subject: 'Your PokéCraft order has shipped! 📦',
    heading: 'Your order is on its way!',
    body: 'Great news — your handmade plushie has been packed with care and is heading to you. Delivery typically takes 7–10 business days.',
  },
  delivered: {
    subject: 'Your PokéCraft order has been delivered! 🎉',
    heading: 'Your plushie has arrived!',
    body: 'We hope you love your new handmade Pokémon plushie! If anything looks wrong, please contact us within 7 days with photos.',
  },
  cancelled: {
    subject: 'Your PokéCraft order has been cancelled',
    heading: 'Order cancelled',
    body: 'Your order has been cancelled. If you did not request this or have any questions, please get in touch.',
  },
}

export function getStatusEmailCopy(status: string) {
  return STATUS_COPY[status] ?? null
}

export function orderStatusUpdateCustomerHtml(o: {
  orderId: number
  buyerName: string
  items: OrderItem[]
  heading: string
  body: string
}) {
  return layout(`
    <h2 style="color:#C9906A;margin:0 0 8px">${o.heading} 🧶</h2>
    <p style="font-size:14px;color:#6B6560;line-height:1.7">Hi ${o.buyerName},</p>
    <p style="font-size:14px;color:#6B6560;line-height:1.7">${o.body}</p>
    <p style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#9A918A;margin:24px 0 4px">Order #${o.orderId}</p>
    ${itemTable(o.items)}
  `)
}

// ── Custom orders ─────────────────────────────────────────────────────────────

export function customOrderRequestSellerHtml(o: {
  name: string
  email: string
  phone?: string
  pokemon: string
  details?: string
}) {
  return `
    <h2>New Custom Order Request</h2>
    <table style="border-collapse:collapse;width:100%">
      ${[['Name', o.name], ['Email', `<a href="mailto:${o.email}">${o.email}</a>`], ['Phone', o.phone || '—'], ['Pokémon', o.pokemon], ['Details', o.details || '—']]
        .map(([k, v], i) => `<tr${i % 2 === 0 ? ' style="background:#f8f5f0"' : ''}><td style="padding:8px 12px;font-weight:600">${k}</td><td style="padding:8px 12px">${v}</td></tr>`)
        .join('')}
    </table>
    <p style="margin-top:16px;color:#6B6560;font-size:13px">
      Reply directly to <a href="mailto:${o.email}">${o.email}</a> to respond.
    </p>
  `
}

export function customOrderConfirmedCustomerHtml(o: {
  name: string
  pokemon: string
  details?: string
}) {
  return layout(`
    <h2 style="color:#C9906A;margin:0 0 8px">Request received, ${o.name}! 🧶</h2>
    <p style="font-size:14px;color:#6B6560;line-height:1.7">
      Thank you for your custom order request. Here's a summary:
    </p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#F8F5F0;border-radius:8px;overflow:hidden">
      <tr><td style="padding:10px 14px;font-size:13px;font-weight:600">Pokémon</td><td style="padding:10px 14px;font-size:13px">${o.pokemon}</td></tr>
      <tr><td style="padding:10px 14px;font-size:13px;font-weight:600">Details</td><td style="padding:10px 14px;font-size:13px">${o.details || '—'}</td></tr>
    </table>
    <p style="font-size:14px;color:#6B6560;line-height:1.7">
      I'll get back to you within <strong>24 hours</strong> with availability and a quote.
      Custom orders typically take <strong>2–3 weeks</strong> and start at ₹1,200.
    </p>
  `)
}

// ── Admin custom email ────────────────────────────────────────────────────────

export function adminMessageCustomerHtml(o: {
  orderId: number
  buyerName: string
  message: string
  sellerEmail: string
}) {
  const safeMessage = o.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return layout(`
    <p style="margin:0 0 8px;font-size:15px">Hi ${o.buyerName},</p>
    <p style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#9A918A;margin:0 0 16px">Re: Order #${o.orderId}</p>
    <div style="white-space:pre-wrap;font-size:14px;line-height:1.7;color:#3A3530">${safeMessage}</div>
    <p style="font-size:12px;color:#9A918A;margin-top:24px">Replies go to ${o.sellerEmail}</p>
  `)
}
