'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

interface Props {
  name: string
  image: string | null
  pendingOrderCount?: number
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="admin-nav-link">
      {label}
    </Link>
  )
}

export function AdminTopBar({ name, image, pendingOrderCount = 0 }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      <style>{`
        .admin-topbar {
          background: #1A1A18;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          position: sticky; top: 0; z-index: 200;
        }
        .admin-topbar-inner {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; padding: 0 20px; height: 60px;
        }
        .admin-bar-left { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .admin-bar-nav { display: flex; align-items: center; gap: 2px; flex: 1; justify-content: center; }
        .admin-bar-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .admin-nav-link {
          font-size: 12px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase;
          color: #C0B8B0; text-decoration: none; padding: 6px 10px; border-radius: 6px;
          background: transparent; transition: color 0.12s, background 0.12s;
        }
        .admin-nav-link:hover { color: #C9906A; background: rgba(201,144,106,0.12); }
        .admin-name-text { display: flex; flex-direction: column; }
        .admin-signout-text { display: inline; }
        .admin-hamburger { display: none; }
        .admin-mobile-nav {
          display: none; background: #111110; border-top: 1px solid rgba(255,255,255,0.06);
          padding: 12px 20px; gap: 4px; flex-direction: column;
        }
        .admin-mobile-nav.open { display: flex; }
        .admin-mobile-nav .admin-nav-link {
          display: block; padding: 10px 12px; font-size: 13px;
        }
        @media (max-width: 700px) {
          .admin-bar-nav { display: none; }
          .admin-hamburger { display: flex; }
          .admin-name-text { display: none; }
        }
        @media (max-width: 420px) {
          .admin-topbar-inner { padding: 0 14px; }
          .admin-signout-text { display: none; }
        }
      `}</style>

      <div className="admin-topbar">
        <div className="admin-topbar-inner">

          {/* Left: logo + admin badge */}
          <div className="admin-bar-left">
            <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="15" stroke="#C9906A" strokeWidth="1.5"/>
                <path d="M1 16h30" stroke="#C9906A" strokeWidth="1.5"/>
                <circle cx="16" cy="16" r="4.5" fill="#1A1A18" stroke="#C9906A" strokeWidth="1.5"/>
              </svg>
              <span style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '16px', color: '#F8F5F0', fontWeight: 600 }}>PokéCraft</span>
            </Link>
            <span style={{
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: '#C9906A', padding: '3px 7px', border: '1px solid rgba(201,144,106,0.35)', borderRadius: '4px',
            }}>
              Admin
            </span>
          </div>

          {/* Centre: desktop nav */}
          <nav className="admin-bar-nav">
            <NavLink href="/admin" label="Dashboard" />
            <NavLink href="/admin/orders" label="Orders" />
            <NavLink href="/admin/inventory" label="Inventory" />
            {pendingOrderCount > 0 && (
              <span style={{
                fontSize: '10px', fontWeight: 700, color: 'white', background: '#E05252',
                borderRadius: '10px', padding: '2px 8px', marginLeft: '6px',
              }}>
                {pendingOrderCount}
              </span>
            )}
          </nav>

          {/* Right: identity + sign out + hamburger */}
          <div className="admin-bar-right">
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {image
                ? <img src={image} alt={name} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(201,144,106,0.6)', flexShrink: 0 }} />
                : (
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(201,144,106,0.2)', border: '1.5px solid rgba(201,144,106,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#C9906A', flexShrink: 0 }}>
                    {initials}
                  </div>
                )
              }
              <div className="admin-name-text">
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#F8F5F0', lineHeight: 1.2 }}>{name}</p>
                <p style={{ margin: 0, fontSize: '10px', color: '#C9906A', letterSpacing: '0.06em' }}>Administrator</p>
              </div>
            </div>

            {/* Sign out */}
            <button
              onClick={async () => { await signOut({ redirect: false }); window.location.href = '/login' }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', color: '#6A6560',
                background: 'none', border: '1px solid rgba(255,255,255,0.07)',
                padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'color 0.12s, border-color 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#E05252'; e.currentTarget.style.borderColor = 'rgba(224,82,82,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6A6560'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span className="admin-signout-text">Sign out</span>
            </button>

            {/* Hamburger — mobile only */}
            <button
              className="admin-hamburger"
              onClick={() => setMenuOpen(v => !v)}
              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '7px 9px', cursor: 'pointer', color: '#C0B8B0', display: 'none' }}
              aria-label="Toggle navigation"
            >
              {menuOpen
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        <div className={`admin-mobile-nav${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)}>
          <NavLink href="/admin" label="Dashboard" />
          <NavLink href="/admin/orders" label={`Orders${pendingOrderCount > 0 ? ` (${pendingOrderCount} pending)` : ''}`} />
          <NavLink href="/admin/inventory" label="Inventory" />
        </div>
      </div>
    </>
  )
}
