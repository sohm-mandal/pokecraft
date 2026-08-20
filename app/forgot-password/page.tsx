'use client'

import { useState, FormEvent, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Step = 'email' | 'reset'

const inputStyle: React.CSSProperties = {
  border: '1.5px solid #E4DBD0', borderRadius: '12px', padding: '14px 16px',
  fontSize: '14px', fontFamily: 'inherit', background: 'white', outline: 'none', width: '100%', boxSizing: 'border-box',
}
const btnStyle: React.CSSProperties = {
  background: '#1A1A18', color: '#F8F5F0', border: 'none', borderRadius: '12px',
  padding: '14px', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase',
  cursor: 'pointer', fontFamily: 'inherit', width: '100%',
}

function ForgotPasswordForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const dest = callbackUrl === '/login' ? '/' : callbackUrl

  // Step 1 — send OTP to email
  async function handleSendOtp(e: FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, mode: 'forgot-password' }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Failed to send code.'); setLoading(false); return }
    setStep('reset')
    setLoading(false)
  }

  // Step 2 — verify OTP + set new password
  async function handleReset(e: FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (code.length < 6) { setError('Please enter the 6-digit code from your email.'); return }
    setLoading(true); setError('')

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Failed to reset password.'); setLoading(false); return }

    // Auto sign-in with new password
    const signInRes = await signIn('credentials', { username: email, password: newPassword, redirect: false })
    if (signInRes?.error) {
      // Password reset succeeded but sign-in failed — show success and redirect to login
      setSuccess(true)
      setLoading(false)
      setTimeout(() => { window.location.href = '/login' }, 2500)
    } else {
      window.location.href = dest
    }
  }

  async function resendOtp() {
    setError(''); setCode('')
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, mode: 'forgot-password' }),
    })
    const data = await res.json()
    if (!res.ok) setError(data.error ?? 'Failed to resend.')
  }

  if (success) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✓</div>
          <h2 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.6rem', color: '#1A1A18', marginBottom: '8px' }}>Password reset!</h2>
          <p style={{ color: '#6B6560', fontSize: '14px' }}>Redirecting you to sign in…</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9906A', marginBottom: '12px' }}>
            {step === 'email' ? 'Account Recovery' : 'Reset Password'}
          </p>
          <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '2rem', color: '#1A1A18', margin: 0 }}>
            {step === 'email' ? 'Forgot your password?' : 'Set a new password'}
          </h1>
          {step === 'reset' && (
            <p style={{ fontSize: '14px', color: '#6B6560', marginTop: '10px', marginBottom: 0 }}>
              Enter the 6-digit code sent to <strong>{email}</strong> and choose a new password.
            </p>
          )}
        </div>

        {/* Step 1 — Email */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your account email address"
              required
              autoComplete="email"
              style={inputStyle}
            />
            {error && <p style={{ color: '#E05252', fontSize: '13px', margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Sending code…' : 'Send Reset Code'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#9A918A', marginTop: '8px' }}>
              <Link href="/login" style={{ color: '#C9906A', textDecoration: 'none' }}>← Back to sign in</Link>
            </p>
          </form>
        )}

        {/* Step 2 — OTP + new password */}
        {step === 'reset' && (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#9A918A', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Verification Code</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                required
                maxLength={6}
                inputMode="numeric"
                style={{ ...inputStyle, fontSize: '1.4rem', letterSpacing: '0.3em', textAlign: 'center' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#9A918A', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                autoComplete="new-password"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#9A918A', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                required
                autoComplete="new-password"
                style={inputStyle}
              />
            </div>
            {error && <p style={{ color: '#E05252', fontSize: '13px', margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.6 : 1, marginTop: '4px' }}>
              {loading ? 'Resetting…' : 'Reset Password & Sign In'}
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <button type="button" onClick={() => { setStep('email'); setCode(''); setError('') }} style={{ background: 'none', border: 'none', color: '#9A918A', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                ← Change email
              </button>
              <button type="button" onClick={resendOtp} style={{ background: 'none', border: 'none', color: '#C9906A', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                Resend code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return <Suspense><ForgotPasswordForm /></Suspense>
}
