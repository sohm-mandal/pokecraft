'use client'

import { useState, FormEvent, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Step = 'email' | 'otp' | 'setup' | 'password'

const inputStyle: React.CSSProperties = {
  border: '1.5px solid #E4DBD0', borderRadius: '12px', padding: '14px 16px',
  fontSize: '14px', fontFamily: 'inherit', background: 'white', outline: 'none', width: '100%', boxSizing: 'border-box',
}
const btnStyle: React.CSSProperties = {
  background: '#1A1A18', color: '#F8F5F0', border: 'none', borderRadius: '12px',
  padding: '14px', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase',
  cursor: 'pointer', fontFamily: 'inherit', width: '100%',
}

function SignupForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'
  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'login'

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const dest = callbackUrl === '/login' || callbackUrl === '/signup' ? '/' : callbackUrl

  // Step 1 — send OTP
  async function handleSendOtp(e: FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, mode }),
    })
    const data = await res.json()
    if (!res.ok) setError(data.error ?? 'Failed to send OTP.')
    else setStep('otp')
    setLoading(false)
  }

  // Step 2 — verify OTP
  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/auth/check-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Invalid code.'); setLoading(false); return }
    // OTP verified — move to next step based on mode
    setStep(mode === 'signup' ? 'setup' : 'password')
    setLoading(false)
  }

  // Step 3a (signup) — create account then sign in
  async function handleSetup(e: FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true); setError('')

    const createRes = await fetch('/api/auth/complete-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    })
    const createData = await createRes.json()
    if (!createRes.ok) { setError(createData.error ?? 'Failed to create account.'); setLoading(false); return }

    // Sign in with the new credentials
    const res = await signIn('credentials', { username: email, password, redirect: false })
    if (res?.error) { setError('Account created but sign-in failed. Please go to login.'); setLoading(false); return }
    window.location.href = dest
  }

  // Step 3b (login) — verify password and sign in
  async function handlePasswordLogin(e: FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await signIn('credentials', { username: email, password, redirect: false })
    if (res?.error) {
      setError('Incorrect password. Please try again.')
      setLoading(false)
    } else {
      window.location.href = dest
    }
  }

  async function resendOtp() {
    setError(''); setCode('')
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, mode }),
    })
    const data = await res.json()
    if (!res.ok) setError(data.error ?? 'Failed to resend.')
  }

  const headings: Record<Step, { eyebrow: string; title: string; subtitle?: string }> = {
    email: {
      eyebrow: mode === 'signup' ? 'New Account' : 'Welcome Back',
      title: mode === 'signup' ? 'Create your account' : 'Sign in to PokéCraft',
    },
    otp: {
      eyebrow: 'Verify Email',
      title: 'Check your inbox',
      subtitle: `We sent a 6-digit code to ${email}`,
    },
    setup: {
      eyebrow: 'Almost there',
      title: 'Set up your account',
    },
    password: {
      eyebrow: 'Welcome back',
      title: 'Enter your password',
      subtitle: `Signing in as ${email}`,
    },
  }

  const h = headings[step]

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9906A', marginBottom: '12px' }}>{h.eyebrow}</p>
          <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '2rem', color: '#1A1A18', margin: 0 }}>{h.title}</h1>
          {h.subtitle && <p style={{ fontSize: '14px', color: '#6B6560', marginTop: '10px', marginBottom: 0 }}>{h.subtitle}</p>}
        </div>

        {/* Step 1 — Email */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" required style={inputStyle} />
            {error && <p style={{ color: '#E05252', fontSize: '13px', margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Sending code…' : 'Send OTP'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#9A918A', marginTop: '8px' }}>
              {mode === 'signup' ? 'Already have an account? ' : 'New here? '}
              <Link href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}&mode=${mode === 'signup' ? 'login' : 'signup'}`} style={{ color: '#C9906A', textDecoration: 'none', fontWeight: 500 }}>
                {mode === 'signup' ? 'Sign in' : 'Create an account'}
              </Link>
            </p>
          </form>
        )}

        {/* Step 2 — OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              required
              maxLength={6}
              inputMode="numeric"
              style={{ ...inputStyle, fontSize: '1.6rem', letterSpacing: '0.4em', textAlign: 'center' }}
            />
            {error && <p style={{ color: '#E05252', fontSize: '13px', margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading || code.length < 6} style={{ ...btnStyle, opacity: loading || code.length < 6 ? 0.6 : 1 }}>
              {loading ? 'Verifying…' : 'Verify Code'}
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9A918A' }}>
              <button type="button" onClick={() => { setStep('email'); setCode(''); setError('') }} style={{ background: 'none', border: 'none', color: '#9A918A', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                ← Change email
              </button>
              <button type="button" onClick={resendOtp} style={{ background: 'none', border: 'none', color: '#C9906A', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                Resend code
              </button>
            </div>
          </form>
        )}

        {/* Step 3a — Setup (signup only) */}
        {step === 'setup' && (
          <form onSubmit={handleSetup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required style={inputStyle} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Choose a password (min 6 chars)" required minLength={6} style={inputStyle} />
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" required style={inputStyle} />
            {error && <p style={{ color: '#E05252', fontSize: '13px', margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Creating account…' : 'Create Account & Sign In'}
            </button>
          </form>
        )}

        {/* Step 3b — Password (login only) */}
        {step === 'password' && (
          <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" required style={inputStyle} />
            {error && <p style={{ color: '#E05252', fontSize: '13px', margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
            <button type="button" onClick={() => { setStep('email'); setPassword(''); setError('') }} style={{ background: 'none', border: 'none', color: '#9A918A', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function SignupPage() {
  return <Suspense><SignupForm /></Suspense>
}
