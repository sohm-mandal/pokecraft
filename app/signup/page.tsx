'use client'

import { useState, FormEvent, Suspense, useEffect, useRef } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { StarBackground } from '@/components/StarBackground'

type Step = 'email' | 'otp' | 'setup'

const inputStyle: React.CSSProperties = {
  border: '1.5px solid var(--color-border)',
  borderRadius: '12px',
  padding: '14px 16px',
  fontSize: '14px',
  fontFamily: 'inherit',
  background: 'white',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  color: 'var(--color-ink)',
}

const btnStyle: React.CSSProperties = {
  background: 'var(--color-ink)',
  color: 'var(--color-fg-on-ink)',
  border: 'none',
  borderRadius: '12px',
  padding: '14px',
  fontSize: '13px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  fontFamily: 'inherit',
  width: '100%',
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

const eyeBtnStyle: React.CSSProperties = {
  position: 'absolute',
  right: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  padding: '4px',
  cursor: 'pointer',
  color: 'var(--color-muted)',
  display: 'flex',
  alignItems: 'center',
  lineHeight: '0',
}

function SignupForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const dest = callbackUrl === '/login' || callbackUrl === '/signup' ? '/' : callbackUrl

  function handleUsernameChange(value: string) {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setUsername(cleaned)

    if (usernameTimer.current) clearTimeout(usernameTimer.current)

    if (!cleaned) { setUsernameStatus('idle'); return }
    if (cleaned.length < 3) { setUsernameStatus('invalid'); return }
    if (!/^[a-z0-9_]+$/.test(cleaned)) { setUsernameStatus('invalid'); return }

    setUsernameStatus('checking')
    usernameTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(cleaned)}`)
        const data = await res.json()
        if (data.available === true) setUsernameStatus('available')
        else if (data.reason === 'invalid_chars' || data.reason === 'too_short' || data.reason === 'too_long') setUsernameStatus('invalid')
        else setUsernameStatus('taken')
      } catch {
        setUsernameStatus('idle')
      }
    }, 450)
  }

  useEffect(() => () => { if (usernameTimer.current) clearTimeout(usernameTimer.current) }, [])

  async function handleSendOtp(e: FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mode: 'signup' }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error ?? 'Failed to send OTP.')
      else setStep('otp')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/check-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Invalid code.'); return }
      setStep('setup')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSetup(e: FormEvent) {
    e.preventDefault()
    if (!username || username.length < 3) { setError('Please choose a username (min 3 characters).'); return }
    if (usernameStatus === 'taken') { setError('That username is already taken. Please choose another.'); return }
    if (usernameStatus === 'invalid') { setError('Username can only contain letters, numbers, and underscores.'); return }
    if (usernameStatus === 'checking') { setError('Still checking username availability — please wait a moment.'); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true); setError('')
    try {
      const createRes = await fetch('/api/auth/complete-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, username, password }),
      })
      const createData = await createRes.json()
      if (!createRes.ok) { setError(createData.error ?? 'Failed to create account.'); return }

      const res = await signIn('credentials', { username: email, password, redirect: false })
      if (res?.error) { setError('Account created but sign-in failed. Please go to login.'); return }
      window.location.href = dest
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function resendOtp() {
    setError(''); setCode('')
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, mode: 'signup' }),
    })
    const data = await res.json()
    if (!res.ok) setError(data.error ?? 'Failed to resend.')
  }

  const headings: Record<Step, { eyebrow: string; title: string; subtitle?: string }> = {
    email: { eyebrow: 'New Account', title: 'Create your account' },
    otp: { eyebrow: 'Verify Email', title: 'Check your inbox', subtitle: `We sent a 6-digit code to ${email}` },
    setup: { eyebrow: 'Almost there', title: 'Set up your account' },
  }

  const h = headings[step]

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative', overflow: 'hidden' }}>
      <StarBackground />
      <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: '12px' }}>{h.eyebrow}</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-ink)', margin: 0 }}>{h.title}</h1>
          {h.subtitle && <p style={{ fontSize: '14px', color: 'var(--color-muted-2)', marginTop: '10px', marginBottom: 0 }}>{h.subtitle}</p>}
        </div>

        {/* Step 1 — Email */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" required style={inputStyle} />
            {error && <p style={{ color: 'var(--color-error)', fontSize: '13px', margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Sending code…' : 'Send Verification Code'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-muted)', marginTop: '8px' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
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
            {error && <p style={{ color: 'var(--color-error)', fontSize: '13px', margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading || code.length < 6} style={{ ...btnStyle, opacity: loading || code.length < 6 ? 0.6 : 1 }}>
              {loading ? 'Verifying…' : 'Verify Code'}
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-muted)' }}>
              <button type="button" onClick={() => { setStep('email'); setCode(''); setError('') }} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                ← Change email
              </button>
              <button type="button" onClick={resendOtp} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                Resend code
              </button>
            </div>
          </form>
        )}

        {/* Step 3 — Setup */}
        {step === 'setup' && (
          <form onSubmit={handleSetup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required style={inputStyle} />

            {/* Username */}
            <div>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={username}
                  onChange={e => handleUsernameChange(e.target.value)}
                  placeholder="Choose a username"
                  required
                  maxLength={30}
                  autoComplete="username"
                  style={{
                    ...inputStyle,
                    paddingRight: '36px',
                    borderColor:
                      usernameStatus === 'available' ? '#4CAF50' :
                      usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'var(--color-error)' :
                      'var(--color-border)',
                  }}
                />
                {/* Status indicator */}
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', lineHeight: 1 }}>
                  {usernameStatus === 'checking' && <span style={{ color: 'var(--color-muted)' }}>…</span>}
                  {usernameStatus === 'available' && <span style={{ color: '#4CAF50' }}>✓</span>}
                  {usernameStatus === 'taken' && <span style={{ color: 'var(--color-error)' }}>✗</span>}
                  {usernameStatus === 'invalid' && <span style={{ color: 'var(--color-error)' }}>✗</span>}
                </span>
              </div>
              <p style={{ fontSize: '11px', color:
                usernameStatus === 'available' ? '#4CAF50' :
                usernameStatus === 'taken' ? 'var(--color-error)' :
                usernameStatus === 'invalid' ? 'var(--color-error)' :
                'var(--color-muted)',
                margin: '5px 0 0', lineHeight: 1.4,
              }}>
                {usernameStatus === 'idle' && 'No spaces. Letters, numbers, and underscores only. Must be unique.'}
                {usernameStatus === 'checking' && 'Checking availability…'}
                {usernameStatus === 'available' && `@${username} is available!`}
                {usernameStatus === 'taken' && `@${username} is already taken. Try another.`}
                {usernameStatus === 'invalid' && 'No spaces allowed. Use letters (a–z), numbers, and underscores. Min 3 chars.'}
              </p>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Choose a password (min 6 chars)"
                required
                minLength={6}
                style={{ ...inputStyle, paddingRight: '44px' }}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1} aria-label={showPassword ? 'Hide password' : 'Show password'} style={eyeBtnStyle}>
                <EyeIcon open={showPassword} />
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                style={{ ...inputStyle, paddingRight: '44px' }}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)} tabIndex={-1} aria-label={showConfirm ? 'Hide password' : 'Show password'} style={eyeBtnStyle}>
                <EyeIcon open={showConfirm} />
              </button>
            </div>

            {error && <p style={{ color: 'var(--color-error)', fontSize: '13px', margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Creating account…' : 'Create Account & Sign In'}
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
