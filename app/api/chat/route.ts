import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

const BASE_PROMPT = `You are a friendly customer support assistant for PokéCraft, a small shop that sells handmade Pokémon crochet plushies.

Key facts about PokéCraft:
- All plushies are 100% handmade to order using premium anti-pilling cotton yarn
- Standard size is 20–25 cm tall
- Ships worldwide, India delivery takes 7–10 business days, international 10–20 days
- No returns unless item arrives damaged (contact within 7 days with photos)
- Custom orders available for any Pokémon not in the shop
- Payment via Razorpay (cards, UPI, netbanking)
- Care: hand wash in cold water, air dry only
- Safe for ages 3+ (safety eyes); under 3, contact for embroidered eyes option

Keep answers short, warm, and helpful. If unsure, suggest they contact the seller.`

interface Message {
  role: 'user' | 'model'
  parts: { text: string }[]
}

export async function POST(req: NextRequest) {
  let body: { messages?: Message[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON', code: 'INVALID_JSON' }, { status: 400 })
  }

  const { messages } = body
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'messages array is required', code: 'MISSING_MESSAGES' }, { status: 400 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Chat service is not configured', code: 'GEMINI_NOT_CONFIGURED' }, { status: 503 })
  }

  // Fetch live product data
  let productContext = ''
  try {
    const products = await sql`SELECT name, price, stock_count FROM products ORDER BY name`
    const lines = (products as { name: string; price: number; stock_count: number }[]).map(
      (p) => `- ${p.name}: ₹${Math.round(p.price / 100)} — ${p.stock_count > 0 ? `${p.stock_count} in stock` : 'OUT OF STOCK'}`
    )
    productContext = `\n\nCurrent products and stock:\n${lines.join('\n')}`
  } catch {
    productContext = ''
  }

  // Check if any user message mentions an order ID
  let orderContext = ''
  const allText = messages.map((m) => m.parts.map((p) => p.text).join(' ')).join(' ')
  const orderIdMatch = allText.match(/\border\s*#?\s*(\d+)\b/i) ?? allText.match(/\b(\d{1,6})\b/)
  if (orderIdMatch) {
    const orderId = orderIdMatch[1]
    try {
      const rows = await sql`SELECT id, status, buyer_name, total_amount, items FROM orders WHERE id = ${Number(orderId)} LIMIT 1`
      const order = rows[0] as { id: number; status: string; buyer_name: string; total_amount: number; items: unknown } | undefined
      if (order) {
        orderContext = `\n\nOrder #${order.id} lookup result: Customer: ${order.buyer_name}, Status: ${order.status}, Total: ₹${Math.round(order.total_amount / 100)}`
      } else {
        orderContext = `\n\nOrder #${orderId} was not found in the system.`
      }
    } catch {
      orderContext = ''
    }
  }

  const systemPrompt = BASE_PROMPT + productContext + orderContext

  let res: Response
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: messages,
        }),
      }
    )
  } catch (err) {
    console.error('[POST /api/chat] Network error reaching Gemini:', err)
    return NextResponse.json({ error: 'Could not reach chat service', code: 'GEMINI_NETWORK_ERROR' }, { status: 502 })
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    console.error('[POST /api/chat] Gemini API error:', res.status, errText)
    return NextResponse.json(
      { error: 'Chat service returned an error', code: 'GEMINI_API_ERROR', detail: `HTTP ${res.status}` },
      { status: 502 }
    )
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    return NextResponse.json({ error: 'Empty response from chat service', code: 'GEMINI_EMPTY_RESPONSE' }, { status: 502 })
  }

  return NextResponse.json({ text })
}
