import { NextRequest, NextResponse } from 'next/server'
import { mailer } from '@/lib/mailer'
import { customOrderRequestSellerHtml, customOrderConfirmedCustomerHtml } from '@/lib/emails'
import { CustomOrderSchema, parseBody } from '@/lib/schemas'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON', code: 'INVALID_JSON' }, { status: 400 })
  }

  const parsed = parseBody(CustomOrderSchema, body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error, code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  const { name, email, phone, pokemon, details } = parsed.data
  const sellerEmail = process.env.GMAIL_USER!

  try {
    const results = await Promise.allSettled([
      mailer.sendMail({
        from: `PokéCraft Custom Orders <${sellerEmail}>`,
        to: sellerEmail,
        replyTo: email,
        subject: `New custom order request — ${pokemon} from ${name}`,
        html: customOrderRequestSellerHtml({ name, email, phone, pokemon, details }),
      }),
      mailer.sendMail({
        from: `PokéCraft <${sellerEmail}>`,
        to: email,
        subject: `Your custom order request for ${pokemon} — PokéCraft`,
        html: customOrderConfirmedCustomerHtml({ name, pokemon, details }),
      }),
    ])
    results.forEach((r, i) => { if (r.status === 'rejected') console.error(`[custom-order] Email ${i} failed:`, r.reason) })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[custom-order] Unexpected error:', e)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
