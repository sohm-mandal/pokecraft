'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

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
    const res = await signIn('admin', { username, password, callbackUrl, redirect: false })
    if (res?.error) {
      setError('Invalid username or password')
      setLoading(false)
    } else {
      window.location.href = callbackUrl
    }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9906A', marginBottom: '12px' }}>Welcome</p>
          <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '2.2rem', color: '#1A1A18', margin: 0 }}>
            {adminMode ? 'Admin Login' : 'Sign in to PokéCraft'}
          </h1>
        </div>

        {!adminMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => signIn('google', { callbackUrl })}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', width: '100%', padding: '14px 24px', border: '1.5px solid #E4DBD0', borderRadius: '12px', background: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#1A1A18', fontFamily: 'inherit' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>

            <div style={{ textAlign: 'center', padding: '8px 0', fontSize: '12px', color: '#9A918A' }}>or</div>

            <button
              onClick={() => setAdminMode(true)}
              style={{ width: '100%', padding: '14px 24px', border: '1.5px solid #E4DBD0', borderRadius: '12px', background: 'transparent', cursor: 'pointer', fontSize: '13px', color: '#6B6560', fontFamily: 'inherit', letterSpacing: '0.05em' }}
            >
              Admin Login
            </button>

            <p style={{ textAlign: 'center', fontSize: '12px', color: '#9A918A', marginTop: '16px' }}>
              New here? Just sign in with Google — we&apos;ll create your account automatically.
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
            <button type="button" onClick={() => setAdminMode(false)} style={{ background: 'none', border: 'none', color: '#9A918A', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
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
