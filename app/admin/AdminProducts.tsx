'use client'

import { useState } from 'react'
import type { Product } from '@/types'

export function AdminProducts({ products }: { products: Product[] }) {
  const [list, setList] = useState(products)
  const [editing, setEditing] = useState<number | null>(null)
  const [stock, setStock] = useState<Record<number, number>>({})
  const [saving, setSaving] = useState<number | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', stock_count: '', image_url: '', slug: '' })
  const [adding, setAdding] = useState(false)

  async function saveStock(id: number) {
    setSaving(id)
    await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock_count: stock[id] }),
    })
    setList(prev => prev.map(p => p.id === id ? { ...p, stock_count: stock[id] } : p))
    setEditing(null)
    setSaving(null)
  }

  async function addProduct() {
    setAdding(true)
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newProduct,
        price: Math.round(parseFloat(newProduct.price) * 100),
        stock_count: parseInt(newProduct.stock_count),
      }),
    })
    const p = await res.json()
    setList(prev => [...prev, p])
    setNewProduct({ name: '', description: '', price: '', stock_count: '', image_url: '', slug: '' })
    setShowAdd(false)
    setAdding(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.5rem', color: '#1A1A18', margin: 0 }}>Products</h2>
        <button
          onClick={() => setShowAdd(s => !s)}
          style={{ background: '#1A1A18', color: '#F8F5F0', border: 'none', padding: '10px 20px', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '8px', fontFamily: 'inherit' }}
        >
          + Add Product
        </button>
      </div>

      {showAdd && (
        <div style={{ background: 'white', border: '1px solid #E4DBD0', borderRadius: '12px', padding: '24px', marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            ['name', 'Name'], ['slug', 'Slug (URL)'], ['price', 'Price (₹)'], ['stock_count', 'Stock'],
            ['image_url', 'Image URL'], ['description', 'Description'],
          ].map(([key, label]) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6560' }}>{label}</label>
              <input
                value={newProduct[key as keyof typeof newProduct]}
                onChange={e => setNewProduct(p => ({ ...p, [key]: e.target.value }))}
                style={{ border: '1px solid #E4DBD0', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', fontFamily: 'inherit' }}
              />
            </div>
          ))}
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px' }}>
            <button onClick={addProduct} disabled={adding} style={{ background: '#1A1A18', color: '#F8F5F0', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px' }}>
              {adding ? 'Adding…' : 'Add Product'}
            </button>
            <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: '1px solid #E4DBD0', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '12px' }}>
        {list.map(p => (
          <div key={p.id} style={{ background: 'white', border: '1px solid #E4DBD0', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            {p.image_url && <img src={p.image_url} alt={p.name} style={{ width: '56px', height: '56px', objectFit: 'contain', borderRadius: '8px', background: '#F8F5F0' }} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: '14px' }}>{p.name}</div>
              <div style={{ fontSize: '12px', color: '#9A918A' }}>₹{(p.price / 100).toLocaleString('en-IN')} · /shop/{p.slug}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {editing === p.id ? (
                <>
                  <input
                    type="number"
                    value={stock[p.id] ?? p.stock_count}
                    onChange={e => setStock(s => ({ ...s, [p.id]: parseInt(e.target.value) }))}
                    style={{ width: '72px', border: '1.5px solid #1A1A18', borderRadius: '8px', padding: '6px 10px', fontSize: '13px', fontFamily: 'inherit', textAlign: 'center' }}
                  />
                  <button onClick={() => saveStock(p.id)} disabled={saving === p.id} style={{ background: '#1A1A18', color: '#F8F5F0', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {saving === p.id ? '…' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(null)} style={{ background: 'none', border: '1px solid #E4DBD0', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '13px', color: p.stock_count === 0 ? '#E05252' : p.stock_count <= 3 ? '#E5A800' : '#2D9E6B', fontWeight: 600 }}>
                    {p.stock_count === 0 ? 'Out of stock' : `${p.stock_count} in stock`}
                  </span>
                  <button
                    onClick={() => { setEditing(p.id); setStock(s => ({ ...s, [p.id]: p.stock_count })) }}
                    style={{ background: 'none', border: '1px solid #E4DBD0', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Edit Stock
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
