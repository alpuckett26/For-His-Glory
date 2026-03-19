'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'featured', label: 'Featured' },
] as const

export function SortSelect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') ?? 'newest'

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('sort', e.target.value)
      router.push(`/shop?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="flex items-center gap-2">
      <label className="font-body text-xs text-charcoal/50 whitespace-nowrap">Sort by:</label>
      <select
        value={currentSort}
        onChange={handleChange}
        className="font-body text-sm text-charcoal border border-charcoal/20 px-3 py-1.5 focus:outline-none focus:border-gold bg-white"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
