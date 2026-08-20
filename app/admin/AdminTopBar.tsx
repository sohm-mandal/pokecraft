'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import type { Order } from '@/types'

interface Props {
  name: string
  image: string | null
  orders: Order[]
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
        color: hovered ? '#C9906A' : '#F8F5F0', textDecoration: 'none',
        padding: '6px 10px', borderRadius: '6px',
        background: hovered ? 'rgba(201,144,106,0.12)' : 'transparent',
        transition: 'color 0.12s, background 0.12s',
      }}
    >
      {label}
    </Link>
  )
}

export function AdminTopBar({ name, image, orders }: Props) {
  const [signOutHovered, setSignOutHovered] = useState(false)

  const pendingCount = orders.filter(o => o.status === 'placed').length
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div style={{
      background: '#1A1A18', borderBottom: '1px solid rgba(255,255,255,0.07)',
      padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: '16px', position: 'sticky', top: 0, zIndex: 200,
    }}>
      {/* Left: brand + badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" stroke="#C9906A" strokeWidth="1.5"/>
            <path d="M1 16h30" stroke="#C9906A" strokeWidth="1.5"/>
            <circle cx="16" cy="16" r="4.5" fill="#1A1A18" stroke="#C9906A" strokeWidth="1.5"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '16px', color: '#F8F5F0', fontWeight: 600 }}>PokéCraft</span>
        </Link>
        <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9906A', padding: '3px 8px', border: '1px solid rgba(201,144,106,0.4)', borderRadius: '4px' }}>
          Admin
        </span>
      </div>

      {/* Centre: nav links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <NavLink href="/admin" label="Dashboard" />
        <NavLink href="/admin#orders" label="Orders" />
        <NavLink href="/admin#products" label="Products" />
        <NavLink href="/shop" label="View Shop" />
        {pendingCount > 0 && (
          <span style={{
            fontSize: '10px', fontWeight: 700, color: 'white', background: '#E05252',
            borderRadius: '10px', padding: '2px 7px', marginLeft: '4px',
          }}>
            {pendingCount} new
          </span>
        )}
      </nav>

      {/* Right: admin identity + sign out */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {image
            ? <img src={image} alt={name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #C9906A' }} />
            : <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#C9906A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#1A1A18' }}>{initials}</div>
          }
          <span style={{ fontSize: '12px', color: '#C0B8B0', fontWeight: 500 }}>{name}</span>
        </div>
        <button
          onMouseEnter={() => setSignOutHovered(true)}
          onMouseLeave={() => setSignOutHovered(false)}
          onClick={async () => {
            await signOut({ redirect: false })
            window.location.href = '/login'
          }}
          style={{
            fontSize: '11px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: signOutHovered ? '#E05252' : '#6A6560',
            background: 'none', border: '1px solid',
            borderColor: signOutHovered ? 'rgba(224,82,82,0.4)' : 'rgba(255,255,255,0.08)',
            padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit',
            transition: 'color 0.12s, border-color 0.12s',
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
