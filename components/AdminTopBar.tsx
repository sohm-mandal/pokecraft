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
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: '12px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
        color: hovered ? '#C9906A' : '#C0B8B0', textDecoration: 'none',
        padding: '6px 10px', borderRadius: '6px',
        background: hovered ? 'rgba(201,144,106,0.12)' : 'transparent',
        transition: 'color 0.12s, background 0.12s',
      }}
    >
      {label}
    </Link>
  )
}

export function AdminTopBar({ name, image, pendingOrderCount = 0 }: Props) {
  const [signOutHovered, setSignOutHovered] = useState(false)
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div style={{
      background: '#1A1A18', borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: '16px', position: 'sticky', top: 0, zIndex: 200,
    }}>

      {/* Left: logo + admin badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" stroke="#C9906A" strokeWidth="1.5"/>
            <path d="M1 16h30" stroke="#C9906A" strokeWidth="1.5"/>
            <circle cx="16" cy="16" r="4.5" fill="#1A1A18" stroke="#C9906A" strokeWidth="1.5"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '17px', color: '#F8F5F0', fontWeight: 600 }}>PokéCraft</span>
        </Link>
        <span style={{
          fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: '#C9906A', padding: '3px 8px', border: '1px solid rgba(201,144,106,0.35)', borderRadius: '4px',
        }}>
          Admin
        </span>
      </div>

      {/* Centre: nav */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        <NavLink href="/admin" label="Dashboard" />
        <NavLink href="/admin#orders" label="Orders" />
        <NavLink href="/admin#products" label="Products" />
        <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)', margin: '0 6px' }} />
        <NavLink href="/shop" label="View Shop" />
        {pendingOrderCount > 0 && (
          <span style={{
            fontSize: '10px', fontWeight: 700, color: 'white', background: '#E05252',
            borderRadius: '10px', padding: '2px 8px', marginLeft: '6px',
          }}>
            {pendingOrderCount} pending
          </span>
        )}
      </nav>

      {/* Right: identity + sign out */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {image
            ? <img src={image} alt={name} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(201,144,106,0.6)' }} />
            : (
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(201,144,106,0.2)', border: '1.5px solid rgba(201,144,106,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#C9906A' }}>
                {initials}
              </div>
            )
          }
          <div>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#F8F5F0', lineHeight: 1.2 }}>{name}</p>
            <p style={{ margin: 0, fontSize: '10px', color: '#C9906A', letterSpacing: '0.06em' }}>Administrator</p>
          </div>
        </div>

        <button
          onMouseEnter={() => setSignOutHovered(true)}
          onMouseLeave={() => setSignOutHovered(false)}
          onClick={async () => {
            await signOut({ redirect: false })
            window.location.href = '/login'
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em',
            color: signOutHovered ? '#E05252' : '#6A6560',
            background: 'none', border: '1px solid',
            borderColor: signOutHovered ? 'rgba(224,82,82,0.3)' : 'rgba(255,255,255,0.07)',
            padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit',
            transition: 'color 0.12s, border-color 0.12s',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </div>
    </div>
  )
}
