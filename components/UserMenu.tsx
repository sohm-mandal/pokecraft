'use client'

import { useState, useRef, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

interface Props {
  name: string
  image: string | null
  role: string
}

export function UserMenu({ name, image, role }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        title={name}
        style={{
          width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid #E4DBD0',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', background: open ? '#1A1A18' : '#F0EBE1',
          transition: 'background 0.15s, border-color 0.15s',
          padding: 0,
        }}
        onMouseEnter={e => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = '#E4DBD0' }}
        onMouseLeave={e => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = '#F0EBE1' }}
      >
        {image
          ? <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '12px', fontWeight: 600, color: open ? '#F8F5F0' : '#1A1A18', letterSpacing: '0.04em', transition: 'color 0.15s' }}>{initials}</span>
        }
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0, zIndex: 200,
          background: 'white', border: '1px solid #E4DBD0', borderRadius: '14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)', minWidth: '200px', overflow: 'hidden',
          animation: 'dropIn 0.15s ease',
        }}>
          {/* Identity */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #F0EBE1' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1A1A18' }}>{name}</p>
            {role === 'admin' && (
              <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C9906A' }}>Admin</span>
            )}
          </div>

          {/* Links */}
          <div style={{ padding: '6px 0' }}>
            <DropItem href="/account" label="My Account" icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            } onClick={() => setOpen(false)} />
            {role === 'admin' && (
              <DropItem href="/admin" label="Admin Panel" icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              } onClick={() => setOpen(false)} />
            )}
          </div>

          {/* Sign out */}
          <div style={{ borderTop: '1px solid #F0EBE1', padding: '6px 0' }}>
            <DropButton
              label="Sign out"
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              }
              onClick={async () => {
                setOpen(false)
                await signOut({ redirect: false })
                window.location.href = '/login'
              }}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

function DropItem({ href, label, icon, onClick }: { href: string; label: string; icon: React.ReactNode; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 16px',
        fontSize: '13px', color: hovered ? '#C9906A' : '#1A1A18',
        background: hovered ? '#FBF8F5' : 'transparent',
        textDecoration: 'none', transition: 'color 0.12s, background 0.12s',
      }}
    >
      <span style={{ flexShrink: 0, color: hovered ? '#C9906A' : '#9A918A', transition: 'color 0.12s' }}>{icon}</span>
      {label}
    </Link>
  )
}

function DropButton({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 16px',
        fontSize: '13px', color: hovered ? '#E05252' : '#6B6560',
        background: hovered ? '#FFF5F5' : 'transparent',
        border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        textAlign: 'left', transition: 'color 0.12s, background 0.12s',
      }}
    >
      <span style={{ flexShrink: 0, color: hovered ? '#E05252' : '#9A918A', transition: 'color 0.12s' }}>{icon}</span>
      {label}
    </button>
  )
}
