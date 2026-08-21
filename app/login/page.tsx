'use client'

import { signIn } from 'next-auth/react'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import sohamImg from '@/assets/soham.png'

const inputStyle: React.CSSProperties = {
  border: '1.5px solid var(--color-border)',
  borderRadius: '10px',
  padding: '13px 16px',
  fontSize: '14px',
  fontFamily: 'inherit',
  background: 'var(--color-surface)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  color: 'var(--color-ink)',
  transition: 'border-color 0.15s',
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

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const dest = callbackUrl === '/login' ? '/' : callbackUrl

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', { username: username.trim(), password, redirect: false })
    if (res?.error) {
      setError('Invalid username or password.')
      setLoading(false)
    } else {
      const sessionRes = await fetch('/api/auth/session')
      const session = await sessionRes.json()
      const role = session?.user?.role
      window.location.href = role === 'admin' ? '/admin' : dest
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');

        .login-page-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg);
          position: relative;
          overflow: hidden;
          padding: 48px 24px;
        }

        .login-form-box {
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 1;
          padding: 44px 40px 40px;
        }

        .login-eyebrow {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--color-accent);
          margin: 0 0 10px;
          font-weight: 500;
        }
        .login-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 2rem;
          color: var(--color-ink);
          margin: 0 0 32px;
          line-height: 1.2;
        }

        .google-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 13px 24px;
          border: 1.5px solid var(--color-border);
          border-radius: 10px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: var(--color-ink);
          font-family: inherit;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .google-btn:hover {
          border-color: var(--color-accent);
          box-shadow: 0 2px 12px rgba(201,144,106,0.12);
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 0;
        }
        .divider-line { flex: 1; height: 1px; background: var(--color-border); }
        .divider-text { font-size: 11px; color: var(--color-muted-3); white-space: nowrap; }

        .signin-btn {
          background: var(--color-ink);
          color: var(--color-fg-on-ink);
          border: none;
          border-radius: 10px;
          padding: 14px;
          font-size: 13px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          font-family: inherit;
          width: 100%;
          transition: opacity 0.15s, background 0.15s;
        }
        .signin-btn:hover:not(:disabled) { background: var(--color-ink-hover); }
        .signin-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .forgot-link {
          font-size: 12px;
          color: var(--color-accent);
          text-decoration: none;
        }
        .forgot-link:hover { text-decoration: underline; }

        .new-account-section {
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1.5px solid var(--color-border);
        }
        .new-account-label {
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--color-muted);
          text-align: center;
          margin: 0 0 14px;
        }
        .new-account-label strong { color: var(--color-ink); font-weight: 600; }

        .new-account-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 13px 24px;
          border: 2px solid var(--color-ink);
          border-radius: 10px;
          background: transparent;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          color: var(--color-ink);
          font-family: inherit;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          box-sizing: border-box;
        }
        .new-account-btn:hover {
          background: var(--color-ink);
          color: var(--color-fg-on-ink);
        }

        .new-account-perks {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 14px;
          flex-wrap: wrap;
        }
        .perk-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: var(--color-muted);
        }
        .perk-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--color-accent);
          flex-shrink: 0;
        }

        .eye-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: var(--color-muted);
          display: flex;
          align-items: center;
          line-height: 0;
        }
        .eye-btn:hover { color: var(--color-ink); }
      `}</style>

      <div className="login-page-wrap">
        <div className="login-form-box">
          <p className="login-eyebrow">Welcome back</p>
          <h1 className="login-heading">Sign in</h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Google */}
            <button className="google-btn" onClick={() => signIn('google', { callbackUrl: dest })}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">or sign in with username</span>
              <div className="divider-line" />
            </div>

            {/* Credentials form */}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                placeholder="Username or Email"
                required
                autoComplete="username"
                style={{ ...inputStyle, borderColor: focusedField === 'username' ? 'var(--color-accent)' : 'var(--color-border)' }}
              />

              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Password"
                  required
                  autoComplete="current-password"
                  style={{ ...inputStyle, borderColor: focusedField === 'password' ? 'var(--color-accent)' : 'var(--color-border)', paddingRight: '44px' }}
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(v => !v)} tabIndex={-1} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  <EyeIcon open={showPassword} />
                </button>
              </div>

              {error && <p style={{ color: 'var(--color-error)', fontSize: '13px', margin: 0 }}>{error}</p>}
              <button type="submit" disabled={loading} className="signin-btn" style={{ marginTop: '4px' }}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
              <div style={{ textAlign: 'center', marginTop: '4px' }}>
                <Link href={`/forgot-password?callbackUrl=${encodeURIComponent(dest)}`} className="forgot-link">
                  Forgot password?
                </Link>
              </div>
            </form>
          </div>

          {/* New account */}
          <div className="new-account-section">
            <p className="new-account-label">
              <strong>New to PokéCraft?</strong> Join our community
            </p>
            <Link href={`/signup?callbackUrl=${encodeURIComponent(dest)}&mode=signup`} className="new-account-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              Create a Free Account
            </Link>
            <div className="new-account-perks">
              <span className="perk-item"><span className="perk-dot"/>Wishlist & orders</span>
              <span className="perk-item"><span className="perk-dot"/>Order tracking</span>
              <span className="perk-item"><span className="perk-dot"/>Early drops</span>
            </div>
          </div>
        </div>
      </div>

        {/* Developer strip */}
        <div style={{ width: '100%', borderTop: '1px solid #E4DBD0', marginTop: '48px', paddingTop: '28px', display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '420px' }}>
          <Image src={sohamImg} alt="Soham Mandal" width={44} height={56} style={{ borderRadius: '6px', objectFit: 'cover', objectPosition: 'top', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A18', margin: '0 0 2px' }}>Soham Mandal</p>
            <p style={{ fontSize: '11px', color: '#9A918A', margin: '0 0 6px' }}>Full-Stack Developer</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="mailto:sohammandal.work24@gmail.com" style={{ fontSize: '11px', color: '#C9906A', textDecoration: 'none' }}>Email</a>
              <a href="https://www.linkedin.com/in/soham-mandal-3aa090246" target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#C9906A', textDecoration: 'none' }}>LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
