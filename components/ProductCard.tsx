import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/types'
import { StockBadge } from './StockBadge'

interface Props {
  product: Product
}

export function ProductCard({ product }: Props) {
  const rupees = (product.price / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  })

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="overflow-hidden rounded-2xl bg-[#F0EAE0] aspect-square relative mb-3">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🧶</div>
        )}
      </div>
      <div className="px-1">
        <p className="text-xs text-[#C9906A] font-medium tracking-widest uppercase mb-1">
          {product.pokemon_name}
        </p>
        <h3 className="font-serif text-[#1A1A18] text-lg leading-tight mb-1">{product.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="font-medium text-[#1A1A18]">{rupees}</span>
          <StockBadge count={product.stock_count} />
        </div>
      </div>
    </Link>
  )
}
