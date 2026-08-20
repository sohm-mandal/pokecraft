import { NextRequest, NextResponse } from 'next/server'
import { mailer } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  const { name, email, phone, pokemon, details } = await req.json()

  if (!name || !email || !pokemon) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const sellerEmail = process.env.GMAIL_USER!

  try {
    // Notify seller
    await mailer.sendMail({
      from: `PokéCraft Custom Orders <${process.env.GMAIL_USER}>`,
      to: sellerEmail,
      subject: `New custom order request — ${pokemon} from ${name}`,
      html: `
        <h2>New Custom Order Request</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px 12px;font-weight:600;background:#f8f5f0">Name</td><td style="padding:8px 12px">${name}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;background:#f8f5f0">Email</td><td style="padding:8px 12px"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;background:#f8f5f0">Phone</td><td style="padding:8px 12px">${phone || '—'}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;background:#f8f5f0">Pokémon</td><td style="padding:8px 12px">${pokemon}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;background:#f8f5f0">Details</td><td style="padding:8px 12px">${details || '—'}</td></tr>
        </table>
        <p style="margin-top:16px;color:#6B6560;font-size:13px">Reply directly to <a href="mailto:${email}">${email}</a> to respond to this request.</p>
      `,
      replyTo: email,
    })

    // Confirm to customer
    await mailer.sendMail({
      from: `PokéCraft <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Your custom order request for ${pokemon} — PokéCraft`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1A1A18">
          <h2 style="color:#C9906A">Request received, ${name}! 🧶</h2>
          <p>Thank you for your custom order request. Here's a summary of what you sent:</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <tr style="background:#F8F5F0"><td style="padding:10px 14px;font-size:13px"><strong>Pokémon</strong></td><td style="padding:10px 14px;font-size:13px">${pokemon}</td></tr>
            <tr><td style="padding:10px 14px;font-size:13px"><strong>Details</strong></td><td style="padding:10px 14px;font-size:13px">${details || '—'}</td></tr>
          </table>
          <p style="font-size:14px;line-height:1.7;color:#6B6560">
            I'll review your request and get back to you within <strong>24 hours</strong> with availability and a quote. No payment is needed yet.
          </p>
          <p style="font-size:14px;line-height:1.7;color:#6B6560">
            Custom orders typically take <strong>2–3 weeks</strong> to complete. Pricing starts at ₹1,200 depending on complexity.
          </p>
          <hr style="border:none;border-top:1px solid #E4DBD0;margin:24px 0"/>
          <p style="font-size:11px;color:#9A918A;text-align:center">PokéCraft — Handmade with love ♥</p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Custom order email failed:', e)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
