'use client'

import { useState, FormEvent, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function SignupForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'
  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'login'

  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSendOtp(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, mode }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Failed to send OTP. Please try again.')
    } else {
      setStep('otp')
    }
    setLoading(false)
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('otp', { email, code, redirect: false })
    if (res?.error) {
      setError('Invalid or expired code. Please try again.')
      setLoading(false)
    } else {
      router.push(callbackUrl === '/login' || callbackUrl === '/signup' ? '/' : callbackUrl)
    }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9906A', marginBottom: '12px' }}>
            {step === 'email' ? (mode === 'signup' ? 'New Account' : 'Welcome Back') : 'Verify Email'}
          </p>
          <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '2.2rem', color: '#1A1A18', margin: 0 }}>
            {step === 'email' ? (mode === 'signup' ? 'Create your account' : 'Sign in to PokéCraft') : 'Check your inbox'}
          </h1>
          {step === 'otp' && (
            <p style={{ fontSize: '14px', color: '#6B6560', marginTop: '12px' }}>
              We sent a 6-digit code to<br /><strong>{email}</strong>
            </p>
          )}
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              style={{ border: '1.5px solid #E4DBD0', borderRadius: '12px', padding: '14px 16px', fontSize: '14px', fontFamily: 'inherit', background: 'white', outline: 'none' }}
            />
            {error && <p style={{ color: '#E05252', fontSize: '13px', margin: 0 }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              style={{ background: '#1A1A18', color: '#F8F5F0', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Sending code…' : 'Send OTP'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#9A918A', marginTop: '8px' }}>
              {mode === 'signup' ? 'Already have an account? ' : 'New here? '}
              <Link
                href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}&mode=${mode === 'signup' ? 'login' : 'signup'}`}
                style={{ color: '#C9906A', textDecoration: 'none', fontWeight: 500 }}
              >
                {mode === 'signup' ? 'Sign in' : 'Create an account'}
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit code"
              required
              maxLength={6}
              inputMode="numeric"
              style={{ border: '1.5px solid #E4DBD0', borderRadius: '12px', padding: '14px 16px', fontSize: '1.4rem', fontFamily: 'inherit', background: 'white', outline: 'none', letterSpacing: '0.3em', textAlign: 'center' }}
            />
            {error && <p style={{ color: '#E05252', fontSize: '13px', margin: 0 }}>{error}</p>}
            <button
              type="submit"
              disabled={loading || code.length < 6}
              style={{ background: '#1A1A18', color: '#F8F5F0', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', opacity: loading || code.length < 6 ? 0.6 : 1 }}
            >
              {loading ? 'Verifying…' : 'Verify & Sign In'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('email'); setCode(''); setError('') }}
              style={{ background: 'none', border: 'none', color: '#9A918A', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              ← Change email
            </button>
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#9A918A' }}>
              Didn&apos;t receive it? Check spam or{' '}
              <button
                type="button"
                onClick={() => handleSendOtp({ preventDefault: () => {} } as FormEvent)}
                style={{ background: 'none', border: 'none', color: '#C9906A', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
              >
                resend
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
