import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are PokéCraft's friendly customer assistant. PokéCraft sells handmade crochet Pokémon plushies, all made to order by Soham Mandal.

Key facts:
- Every plushie is 100% handmade — no factories
- Materials: premium anti-pilling cotton yarn, safety eyes, polyester fiberfill
- Standard size: ~20–25 cm tall, custom sizes available
- Shipping: 7–10 business days to craft + shipping time, worldwide delivery
- Returns: only accepted for damaged items (contact within 7 days with photos)
- Custom orders: any Pokémon on request via the Custom Orders page
- Payments: Razorpay (UPI, cards, netbanking)

Be warm, helpful, and concise. If you don't know something specific, suggest they reach out via the Custom Orders or Contact page.`

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.messages || !Array.isArray(body.messages)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Chat service not configured', code: 'NO_API_KEY' }, { status: 503 })
  }

  // Convert widget format {role:'user'|'model', parts:[{text}]} → Groq format
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...body.messages
      .filter((m: { role: string }) => m.role === 'user' || m.role === 'model')
      .map((m: { role: string; parts: { text: string }[] }) => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.parts?.[0]?.text ?? '',
      }))
      .filter((m: { content: string }) => m.content),
  ]

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'compound-beta-mini',
        messages,
        max_tokens: 300,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[POST /api/chat] Groq error:', res.status, err)
      return NextResponse.json({ error: 'Chat service error', code: 'CHAT_ERROR', detail: err, status: res.status }, { status: 502 })
    }

    const data = await res.json()
    const raw: string = data.choices?.[0]?.message?.content ?? ''
    // Strip <think>...</think> reasoning blocks some models emit
    const text = raw.replace(/<think>[\s\S]*?<\/think>/g, '').trim() || 'Sorry, I could not get a response.'
    return NextResponse.json({ text })
  } catch (err) {
    console.error('[POST /api/chat]', err)
    return NextResponse.json({ error: 'Chat service unavailable', code: 'CHAT_ERROR' }, { status: 502 })
  }
}
