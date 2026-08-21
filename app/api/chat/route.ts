import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
})

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

  // Convert from widget format {role:'user'|'model', parts:[{text}]} to OpenAI format
  const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = body.messages
    .filter((m: { role: string }) => m.role === 'user' || m.role === 'model')
    .map((m: { role: string; parts: { text: string }[] }) => ({
      role: m.role === 'model' ? 'assistant' : 'user',
      content: m.parts?.[0]?.text ?? '',
    }))
    .filter((m: { content: string }) => m.content)

  try {
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...openaiMessages],
      max_tokens: 300,
    })

    const text = completion.choices[0]?.message?.content ?? 'Sorry, I could not get a response.'
    return NextResponse.json({ text })
  } catch (err) {
    console.error('[POST /api/chat]', err)
    return NextResponse.json({ error: 'Chat service unavailable', code: 'CHAT_ERROR' }, { status: 502 })
  }
}
