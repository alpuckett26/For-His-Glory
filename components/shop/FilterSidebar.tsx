'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import type { Collection } from '@/types'
import { SIZES } from '@/lib/constants'

interface FilterSidebarProps {
  collections: Collection[]
}

export function FilterSidebar({ collections }: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === null || params.get(key) === value) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      router.push(`/shop?${params.toString()}`)
    },
    [router, searchParams]
  )

  const activeCollection = searchParams.get('collection')
  const activeSize = searchParams.get('size')

  return (
    <aside className="w-full lg:w-56 xl:w-64 shrink-0">
      {/* Mobile: horizontal scrolling filter row */}
      <div className="lg:hidden space-y-3">
        {/* Collections — horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          <button
            onClick={() => updateFilter('collection', null)}
            className={`shrink-0 px-3 py-1.5 border font-body text-xs font-medium transition-colors ${
              !activeCollection ? 'border-gold bg-gold text-white' : 'border-charcoal/20 text-charcoal'
            }`}
          >
            All
          </button>
          {collections.map((collection) => (
            <button
              key={collection.id}
              onClick={() => updateFilter('collection', collection.slug)}
              className={`shrink-0 px-3 py-1.5 border font-body text-xs font-medium transition-colors ${
                activeCollection === collection.slug
                  ? 'border-gold bg-gold text-white'
                  : 'border-charcoal/20 text-charcoal'
              }`}
            >
              {collection.name}
            </button>
          ))}
        </div>
        {/* Sizes — horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => updateFilter('size', size)}
              className={`shrink-0 px-3 py-1.5 border font-body text-xs font-medium transition-colors ${
                activeSize === size
                  ? 'border-gold bg-gold text-white'
                  : 'border-charcoal/20 text-charcoal'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        {(activeCollection || activeSize) && (
          <button
            onClick={() => router.push('/shop')}
            className="font-body text-xs text-charcoal/50 underline underline-offset-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Desktop: vertical sidebar */}
      <div className="hidden lg:block">
        <div className="mb-8">
          <h3 className="font-body text-xs font-semibold uppercase tracking-widest text-charcoal/50 mb-4">
            Collection
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => updateFilter('collection', null)}
              className={`block font-body text-sm text-left w-full transition-colors ${
                !activeCollection ? 'text-gold font-medium' : 'text-charcoal hover:text-gold'
              }`}
            >
              All Collections
            </button>
            {collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => updateFilter('collection', collection.slug)}
                className={`block font-body text-sm text-left w-full transition-colors ${
                  activeCollection === collection.slug
                    ? 'text-gold font-medium'
                    : 'text-charcoal hover:text-gold'
                }`}
              >
                {collection.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-body text-xs font-semibold uppercase tracking-widest text-charcoal/50 mb-4">
            Size
          </h3>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <button
                key={size}
                onClick={() => updateFilter('size', size)}
                className={`px-3 py-1.5 border font-body text-xs font-medium transition-colors ${
                  activeSize === size
                    ? 'border-gold bg-gold text-white'
                    : 'border-charcoal/20 text-charcoal hover:border-gold hover:text-gold'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {(activeCollection || activeSize) && (
          <button
            onClick={() => router.push('/shop')}
            className="font-body text-xs text-charcoal/50 underline underline-offset-2 hover:text-charcoal transition-colors"
          >
            Clear all filters
          </button>
        )}
      </div>
    </aside>
  )
}
