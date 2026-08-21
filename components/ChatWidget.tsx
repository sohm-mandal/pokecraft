'use client'

import { useState, useRef, useEffect } from 'react'

function formatMessage(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    // Bullet point
    const isBullet = /^[-*]\s+/.test(line)
    const content = line.replace(/^[-*]\s+/, '')
    // Bold: **text**
    const parts = (isBullet ? content : line).split(/\*\*(.*?)\*\*/g)
    const formatted = parts.map((p, j) =>
      j % 2 === 1 ? <strong key={j}>{p}</strong> : <span key={j}>{p}</span>
    )
    if (isBullet) {
      return <div key={i} style={{ display: 'flex', gap: '6px', marginTop: i === 0 ? 0 : '4px' }}><span style={{ flexShrink: 0 }}>•</span><span>{formatted}</span></div>
    }
    return <div key={i} style={{ marginTop: i === 0 ? 0 : '6px' }}>{formatted}</div>
  })
}

interface Message {
  role: 'user' | 'model'
  parts: { text: string }[]
}

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', parts: [{ text: 'Hi! 👋 I\'m PokéCraft\'s assistant. Ask me anything about our plushies, shipping, custom orders, or anything else!' }] }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', parts: [{ text: input.trim() }] }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      const text = data.text ?? 'Sorry, I could not get a response.'
      setMessages([...next, { role: 'model', parts: [{ text }] }])
    } catch {
      setMessages([...next, { role: 'model', parts: [{ text: 'Sorry, something went wrong. Please try again!' }] }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
          width: '56px', height: '56px', borderRadius: '50%',
          background: '#1A1A18', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          transition: 'transform 0.2s',
        }}
        aria-label="Open chat"
      >
        {open
          ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F8F5F0" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F8F5F0" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        }
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '92px', right: '24px', zIndex: 1000,
          width: '340px', maxWidth: 'calc(100vw - 48px)',
          background: '#F8F5F0', borderRadius: '16px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          border: '1px solid #E4DBD0',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ background: '#1A1A18', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>🧶</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#F8F5F0' }}>PokéCraft Assistant</div>
              <div style={{ fontSize: '11px', color: '#9A918A' }}>Usually replies instantly</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.role === 'user' ? '#1A1A18' : 'white',
                  color: m.role === 'user' ? '#F8F5F0' : '#1A1A18',
                  fontSize: '13px', lineHeight: 1.5,
                  border: m.role === 'model' ? '1px solid #E4DBD0' : 'none',
                }}>
                  {formatMessage(m.parts[0].text)}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: 'white', border: '1px solid #E4DBD0', borderRadius: '16px 16px 16px 4px', padding: '10px 16px', fontSize: '18px', letterSpacing: '2px' }}>
                  ···
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px', borderTop: '1px solid #E4DBD0', display: 'flex', gap: '8px' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask anything…"
              style={{ flex: 1, border: '1.5px solid #E4DBD0', borderRadius: '100px', padding: '9px 16px', fontSize: '13px', fontFamily: 'inherit', background: 'white', outline: 'none' }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1A1A18', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: loading || !input.trim() ? 0.4 : 1 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F8F5F0" strokeWidth="2" strokeLinecap="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
