'use client'

import { signIn } from 'next-auth/react'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const inputStyle: React.CSSProperties = {
  border: '1.5px solid #E4DBD0', borderRadius: '10px', padding: '13px 16px',
  fontSize: '14px', fontFamily: 'inherit', background: '#FDFAF7', outline: 'none',
  width: '100%', boxSizing: 'border-box', color: '#1A1A18',
  transition: 'border-color 0.15s',
}

function PokeBallIllustration() {
  return (
    <svg viewBox="0 0 320 320" width="260" height="260" style={{ filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.18))' }}>
      {/* Outer circle */}
      <circle cx="160" cy="160" r="148" fill="white" opacity="0.15"/>
      <circle cx="160" cy="160" r="130" fill="white" opacity="0.1"/>

      {/* Top half */}
      <path d="M32 160 A128 128 0 0 1 288 160 Z" fill="#E05252"/>
      {/* Bottom half */}
      <path d="M32 160 A128 128 0 0 0 288 160 Z" fill="white"/>
      {/* Outer ring */}
      <circle cx="160" cy="160" r="128" fill="none" stroke="#1A1A18" strokeWidth="8"/>
      {/* Middle band */}
      <rect x="32" y="148" width="256" height="24" fill="#1A1A18"/>

      {/* Center button outer */}
      <circle cx="160" cy="160" r="38" fill="#1A1A18"/>
      <circle cx="160" cy="160" r="30" fill="white"/>
      <circle cx="160" cy="160" r="22" fill="#F5F0EB"/>

      {/* Crochet texture dots on top half */}
      <circle cx="100" cy="120" r="5" fill="white" opacity="0.4"/>
      <circle cx="130" cy="100" r="4" fill="white" opacity="0.35"/>
      <circle cx="165" cy="95" r="5" fill="white" opacity="0.4"/>
      <circle cx="200" cy="108" r="4" fill="white" opacity="0.3"/>
      <circle cx="225" cy="130" r="5" fill="white" opacity="0.35"/>
      <circle cx="80" cy="145" r="4" fill="white" opacity="0.3"/>
      <circle cx="115" cy="140" r="3" fill="white" opacity="0.3"/>
      <circle cx="240" cy="145" r="3" fill="white" opacity="0.25"/>

      {/* Stars / sparkles */}
      <g fill="#FBBC05" opacity="0.9">
        <path d="M68 72 l4 10 l10 4 l-10 4 l-4 10 l-4-10 l-10-4 l10-4 Z"/>
        <path d="M252 68 l3 7 l7 3 l-7 3 l-3 7 l-3-7 l-7-3 l7-3 Z"/>
        <path d="M88 210 l2.5 6 l6 2.5 l-6 2.5 l-2.5 6 l-2.5-6 l-6-2.5 l6-2.5 Z"/>
        <path d="M232 218 l2 5 l5 2 l-5 2 l-2 5 l-2-5 l-5-2 l5-2 Z"/>
      </g>

      {/* Yarn loop suggestion */}
      <path d="M55 185 Q80 200 95 190 Q110 180 125 195" stroke="#C9906A" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8"/>
      <path d="M195 192 Q215 182 235 195 Q250 205 265 195" stroke="#C9906A" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8"/>
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
          background: #F8F5F0;
        }

        /* Left panel */
        .login-image-panel {
          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(155deg, #2A1F18 0%, #1A1A18 40%, #3D1A0E 100%);
          position: relative;
          overflow: hidden;
          padding: 60px 48px;
          flex: 0 0 45%;
        }
        @media (min-width: 860px) {
          .login-image-panel { display: flex; }
        }

        /* Decorative rings */
        .login-image-panel::before {
          content: '';
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          border: 1.5px solid rgba(201,144,106,0.15);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .login-image-panel::after {
          content: '';
          position: absolute;
          width: 700px; height: 700px;
          border-radius: 50%;
          border: 1px solid rgba(201,144,106,0.08);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .login-panel-badge {
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #C9906A;
          margin-bottom: 28px;
          font-weight: 500;
        }
        .login-panel-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 2rem;
          color: #F8F5F0;
          text-align: center;
          line-height: 1.3;
          margin: 0 0 16px;
          font-style: italic;
        }
        .login-panel-sub {
          font-size: 13px;
          color: rgba(248,245,240,0.5);
          text-align: center;
          line-height: 1.65;
          max-width: 240px;
          margin: 0;
        }
        .login-panel-dots {
          display: flex;
          gap: 6px;
          margin-top: 32px;
        }
        .login-panel-dots span {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: rgba(201,144,106,0.4);
        }
        .login-panel-dots span.active {
          background: #C9906A;
          width: 20px;
          border-radius: 3px;
        }

        /* Right panel */
        .login-form-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          overflow-y: auto;
        }

        .login-form-box {
          width: 100%;
          max-width: 400px;
        }

        .login-eyebrow {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #C9906A;
          margin: 0 0 10px;
          font-weight: 500;
        }
        .login-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 2rem;
          color: #1A1A18;
          margin: 0 0 36px;
          line-height: 1.2;
        }

        .google-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 14px 24px;
          border: 1.5px solid #E4DBD0;
          border-radius: 10px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #1A1A18;
          font-family: inherit;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .google-btn:hover {
          border-color: #C9906A;
          box-shadow: 0 2px 12px rgba(201,144,106,0.12);
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 0;
        }
        .divider-line { flex: 1; height: 1px; background: #E4DBD0; }
        .divider-text { font-size: 11px; color: #B0A8A0; white-space: nowrap; }

        .signin-btn {
          background: #1A1A18;
          color: #F8F5F0;
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
        .signin-btn:hover:not(:disabled) { background: #2D2D2A; }
        .signin-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .forgot-link {
          font-size: 12px;
          color: #C9906A;
          text-decoration: none;
        }
        .forgot-link:hover { text-decoration: underline; }

        /* New account section */
        .new-account-section {
          margin-top: 32px;
          padding-top: 28px;
          border-top: 1.5px solid #E4DBD0;
        }
        .new-account-label {
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #9A918A;
          text-align: center;
          margin: 0 0 14px;
        }
        .new-account-label strong {
          color: #1A1A18;
          font-weight: 600;
        }
        .new-account-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px 24px;
          border: 2px solid #1A1A18;
          border-radius: 10px;
          background: transparent;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          color: #1A1A18;
          font-family: inherit;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          box-sizing: border-box;
        }
        .new-account-btn:hover {
          background: #1A1A18;
          color: #F8F5F0;
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
          color: #9A918A;
        }
        .perk-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #C9906A;
          flex-shrink: 0;
        }
      `}</style>

      <div className="login-page-wrap">
        {/* Left image panel */}
        <div className="login-image-panel">
          <p className="login-panel-badge">PokéCraft</p>
          <PokeBallIllustration />
          <h2 className="login-panel-heading" style={{ marginTop: '32px' }}>
            Handcrafted with love,<br />one stitch at a time
          </h2>
          <p className="login-panel-sub">
            Unique crochet Pokémon figures made to order — each one its own little adventure.
          </p>
          <div className="login-panel-dots">
            <span className="active" />
            <span />
            <span />
          </div>
        </div>

        {/* Right form panel */}
        <div className="login-form-panel">
          <div className="login-form-box">
            <p className="login-eyebrow">Welcome back</p>
            <h1 className="login-heading">Sign in</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Google */}
              <button
                className="google-btn"
                onClick={() => signIn('google', { callbackUrl: dest })}
              >
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
                  style={{ ...inputStyle, borderColor: focusedField === 'username' ? '#C9906A' : '#E4DBD0' }}
                />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Password"
                  required
                  autoComplete="current-password"
                  style={{ ...inputStyle, borderColor: focusedField === 'password' ? '#C9906A' : '#E4DBD0' }}
                />
                {error && <p style={{ color: '#E05252', fontSize: '13px', margin: 0 }}>{error}</p>}
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

            {/* New account — emphasized */}
            <div className="new-account-section">
              <p className="new-account-label">
                <strong>New to PokéCraft?</strong> Join our community
              </p>
              <Link
                href={`/signup?callbackUrl=${encodeURIComponent(dest)}&mode=signup`}
                className="new-account-btn"
              >
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
