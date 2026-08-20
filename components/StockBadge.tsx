interface Props {
  count: number
}

export function StockBadge({ count }: Props) {
  if (count === 0) {
    return (
      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
        Out of Stock
      </span>
    )
  }
  if (count <= 3) {
    return (
      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded">
        Only {count} left!
      </span>
    )
  }
  return (
    <span className="inline-block px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
      In Stock ({count})
    </span>
  )
}
