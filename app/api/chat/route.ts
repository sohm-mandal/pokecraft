import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are a friendly customer support assistant for PokéCraft, a small shop that sells handmade Pokémon crochet plushies.

Key facts about PokéCraft:
- All plushies are 100% handmade to order using premium anti-pilling cotton yarn
- Standard size is 20–25 cm tall
- Prices start from ₹849
- Ships worldwide, India delivery takes 7–10 business days, international 10–20 days
- No returns unless item arrives damaged (contact within 7 days with photos)
- Custom orders available for any Pokémon not in the shop — visit the Custom Orders page
- Payment via Razorpay (cards, UPI, netbanking)
- Care: hand wash in cold water, air dry only
- Safe for ages 3+ (safety eyes); under 3, contact for embroidered eyes option
- Materials: anti-pilling cotton yarn, safety eyes, polyester fiberfill stuffing

Keep answers short, warm, and helpful. If unsure, suggest they visit the FAQ page or use the Custom Orders form. Don't make up prices or delivery dates beyond what's stated above.`

interface Message {
  role: 'user' | 'model'
  parts: { text: string }[]
}

export async function POST(req: NextRequest) {
  const { messages } = (await req.json()) as { messages: Message[] }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'No API key' }, { status: 500 })

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: messages,
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: err }, { status: res.status })
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sorry, I could not get a response. Please try again.'
  return NextResponse.json({ text })
}
