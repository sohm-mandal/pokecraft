'use client'

import { useState } from 'react'
import type { Product } from '@/types'

export function AdminProducts({ products }: { products: Product[] }) {
  const [list, setList] = useState(products)
  const [editing, setEditing] = useState<number | null>(null)
  const [stock, setStock] = useState<Record<number, number>>({})
  const [saving, setSaving] = useState<number | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', pokemon_name: '', slug: '', price: '', stock_count: '', image_url: '', description: '' })
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
    setNewProduct({ name: '', pokemon_name: '', slug: '', price: '', stock_count: '', image_url: '', description: '' })
    setShowAdd(false)
    setAdding(false)
  }

  return (
    <>
      <style>{`
        .product-row { display: flex; align-items: center; gap: 14px; padding: 14px 18px; flex-wrap: wrap; }
        .product-row-info { flex: 1; min-width: 0; }
        .product-row-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; flex-wrap: wrap; }
        .add-product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 520px) {
          .product-row { padding: 12px 14px; }
          .product-row-actions { width: 100%; margin-top: 4px; }
          .add-product-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '1.5rem', color: '#1A1A18', margin: 0 }}>Products</h2>
          <button
            onClick={() => setShowAdd(s => !s)}
            style={{ background: '#1A1A18', color: '#F8F5F0', border: 'none', padding: '10px 20px', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '8px', fontFamily: 'inherit' }}
          >
            + Add Product
          </button>
        </div>

        {/* Add product form */}
        {showAdd && (
          <div style={{ background: 'white', border: '1px solid #E4DBD0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <div className="add-product-grid">
              {([
                ['name', 'Name'], ['pokemon_name', 'Pokémon Name'], ['slug', 'Slug (URL)'],
                ['price', 'Price (₹)'], ['stock_count', 'Stock'],
                ['image_url', 'Image URL'], ['description', 'Description'],
              ] as [keyof typeof newProduct, string][]).map(([key, label]) => (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6560' }}>{label}</label>
                  <input
                    value={newProduct[key]}
                    onChange={e => setNewProduct(p => ({ ...p, [key]: e.target.value }))}
                    style={{ border: '1px solid #E4DBD0', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
              <button onClick={addProduct} disabled={adding} style={{ background: '#1A1A18', color: '#F8F5F0', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px' }}>
                {adding ? 'Adding…' : 'Add Product'}
              </button>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: '1px solid #E4DBD0', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Product list */}
        <div style={{ display: 'grid', gap: '10px' }}>
          {list.map(p => (
            <div key={p.id} style={{ background: 'white', border: '1px solid #E4DBD0', borderRadius: '12px', overflow: 'hidden' }}>
              <div className="product-row">
                {p.images?.[0] && (
                  <img src={p.images[0]} alt={p.name} style={{ width: '52px', height: '52px', objectFit: 'contain', borderRadius: '8px', background: '#F8F5F0', flexShrink: 0 }} />
                )}
                <div className="product-row-info">
                  <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '2px' }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: '#9A918A' }}>₹{(p.price / 100).toLocaleString('en-IN')} · /shop/{p.slug}</div>
                </div>
                <div className="product-row-actions">
                  {editing === p.id ? (
                    <>
                      <input
                        type="number"
                        value={stock[p.id] ?? p.stock_count}
                        onChange={e => setStock(s => ({ ...s, [p.id]: parseInt(e.target.value) }))}
                        style={{ width: '70px', border: '1.5px solid #1A1A18', borderRadius: '8px', padding: '6px 10px', fontSize: '13px', fontFamily: 'inherit', textAlign: 'center' }}
                      />
                      <button onClick={() => saveStock(p.id)} disabled={saving === p.id} style={{ background: '#1A1A18', color: '#F8F5F0', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                        {saving === p.id ? '…' : 'Save'}
                      </button>
                      <button onClick={() => setEditing(null)} style={{ background: 'none', border: '1px solid #E4DBD0', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: p.stock_count === 0 ? '#E05252' : p.stock_count <= 3 ? '#E5A800' : '#2D9E6B' }}>
                        {p.stock_count === 0 ? 'Out of stock' : `${p.stock_count} in stock`}
                      </span>
                      <button
                        onClick={() => { setEditing(p.id); setStock(s => ({ ...s, [p.id]: p.stock_count })) }}
                        style={{ background: 'none', border: '1px solid #E4DBD0', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                      >
                        Edit Stock
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
