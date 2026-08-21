'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Product } from '@/types'
import { AdminProducts } from '../AdminProducts'

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await fetch('/api/admin/stats', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products)
        setLastUpdated(new Date())
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData(true), 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  const outOfStock = products.filter(p => p.stock_count === 0).length
  const lowStock = products.filter(p => p.stock_count > 0 && p.stock_count <= 3).length

  return (
    <>
      <style>{`
        .skeleton { background: linear-gradient(90deg, #F0EBE1 25%, #E8E0D6 50%, #F0EBE1 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
        @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
        .refresh-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 100px; font-size: 11px;
          font-weight: 500; letter-spacing: 0.04em;
          border: 1.5px solid #E4DBD0; background: white;
          color: #6B6560; cursor: pointer; font-family: inherit;
          transition: border-color 0.12s, color 0.12s;
        }
        .refresh-btn:hover { border-color: #1A1A18; color: #1A1A18; }
        .refresh-spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9906A', margin: '0 0 6px' }}>Admin</p>
            <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '2rem', color: '#1A1A18', margin: 0 }}>Inventory</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {lastUpdated && (
              <span style={{ fontSize: '11px', color: '#B0A8A0' }}>
                Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button className="refresh-btn" onClick={() => fetchData(true)} disabled={refreshing}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                className={refreshing ? 'refresh-spin' : ''}>
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '32px' }}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '74px' }} />
            ))
          ) : (
            [
              { label: 'Total Products', value: products.length },
              { label: 'Out of Stock', value: outOfStock, alert: outOfStock > 0 },
              { label: 'Low Stock (≤3)', value: lowStock, warn: lowStock > 0 },
            ].map(({ label, value, alert, warn }) => (
              <div key={label} style={{ background: 'white', border: `1px solid ${alert ? '#FCC' : warn ? '#FDEFC3' : '#E4DBD0'}`, borderRadius: '10px', padding: '16px 20px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: alert ? '#E05252' : warn ? '#E5A800' : '#9A918A' }}>{label}</p>
                <p style={{ margin: 0, fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.6rem', color: alert ? '#E05252' : warn ? '#E5A800' : '#1A1A18' }}>{value}</p>
              </div>
            ))
          )}
        </div>

        {/* Products */}
        {loading ? (
          <div style={{ display: 'grid', gap: '10px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '68px', borderRadius: '12px' }} />
            ))}
          </div>
        ) : (
          <AdminProducts products={products} onProductChange={() => fetchData(true)} />
        )}
      </div>
    </>
  )
}
