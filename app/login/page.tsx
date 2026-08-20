'use client'

import { signIn } from 'next-auth/react'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'
  const [adminMode, setAdminMode] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', { username, password, redirect: false })
    if (res?.error) {
      setError('Invalid username or password')
      setLoading(false)
    } else {
      const sessionRes = await fetch('/api/auth/session')
      const session = await sessionRes.json()
      const role = session?.user?.role
      window.location.href = role === 'admin' ? '/admin' : (callbackUrl === '/login' ? '/' : callbackUrl)
    }
  }

  const dest = callbackUrl === '/login' ? '/' : callbackUrl

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9906A', marginBottom: '12px' }}>Welcome</p>
          <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '2.2rem', color: '#1A1A18', margin: 0 }}>
            {adminMode ? 'Staff Login' : 'Sign in to PokéCraft'}
          </h1>
        </div>

        {!adminMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Google */}
            <button
              onClick={() => signIn('google', { callbackUrl: dest })}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', width: '100%', padding: '14px 24px', border: '1.5px solid #E4DBD0', borderRadius: '12px', background: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#1A1A18', fontFamily: 'inherit' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#E4DBD0' }} />
              <span style={{ fontSize: '11px', color: '#9A918A' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: '#E4DBD0' }} />
            </div>

            {/* Existing guest — OTP login */}
            <Link
              href={`/signup?callbackUrl=${encodeURIComponent(dest)}&mode=login`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '14px 24px', border: '1.5px solid #E4DBD0', borderRadius: '12px', background: 'white', cursor: 'pointer', fontSize: '13px', color: '#1A1A18', fontFamily: 'inherit', textDecoration: 'none', boxSizing: 'border-box' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Sign in as existing guest
            </Link>

            {/* New guest — sign up */}
            <Link
              href={`/signup?callbackUrl=${encodeURIComponent(dest)}&mode=signup`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '14px 24px', border: '1.5px solid #C9906A', borderRadius: '12px', background: '#FDF8F4', cursor: 'pointer', fontSize: '13px', color: '#C9906A', fontFamily: 'inherit', textDecoration: 'none', boxSizing: 'border-box', fontWeight: 500 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
              Create a new account
            </Link>

            {/* Hidden admin link — small text at bottom */}
            <p style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                onClick={() => setAdminMode(true)}
                style={{ background: 'none', border: 'none', fontSize: '11px', color: '#C0B8B0', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em' }}
              >
                Staff login
              </button>
            </p>
          </div>
        ) : (
          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Username"
              required
              style={{ border: '1.5px solid #E4DBD0', borderRadius: '12px', padding: '14px 16px', fontSize: '14px', fontFamily: 'inherit', background: 'white', outline: 'none' }}
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
              style={{ border: '1.5px solid #E4DBD0', borderRadius: '12px', padding: '14px 16px', fontSize: '14px', fontFamily: 'inherit', background: 'white', outline: 'none' }}
            />
            {error && <p style={{ color: '#E05252', fontSize: '13px', margin: 0 }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              style={{ background: '#1A1A18', color: '#F8F5F0', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
            <button type="button" onClick={() => { setAdminMode(false); setError('') }} style={{ background: 'none', border: 'none', color: '#9A918A', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
