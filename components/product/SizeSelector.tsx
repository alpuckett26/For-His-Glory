'use client'

import { cn } from '@/lib/utils'
import type { ProductVariant } from '@/types'
import { SIZES } from '@/lib/constants'

interface SizeSelectorProps {
  variants: ProductVariant[]
  selectedColor: string | null
  selectedSize: string | null
  onSizeSelect: (size: string) => void
}

export function SizeSelector({
  variants,
  selectedColor,
  selectedSize,
  onSizeSelect,
}: SizeSelectorProps) {
  const availableSizes = Array.from(
    new Set(
      variants
        .filter((v) => v.size && v.active && (!selectedColor || v.color === selectedColor))
        .map((v) => v.size!)
    )
  ).sort((a, b) => {
    const aIdx = SIZES.indexOf(a)
    const bIdx = SIZES.indexOf(b)
    if (aIdx === -1 && bIdx === -1) return 0
    if (aIdx === -1) return 1
    if (bIdx === -1) return -1
    return aIdx - bIdx
  })

  if (availableSizes.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="font-body text-sm font-medium text-charcoal">
          Size:{' '}
          <span className="font-normal text-charcoal/60">{selectedSize ?? 'Select'}</span>
        </span>
        <button className="font-body text-xs text-charcoal/50 underline underline-offset-2 hover:text-gold transition-colors">
          Size Guide
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {availableSizes.map((size) => (
          <button
            key={size}
            onClick={() => onSizeSelect(size)}
            className={cn(
              'px-4 py-2 border font-body text-sm font-medium transition-colors min-w-[52px]',
              selectedSize === size
                ? 'border-charcoal bg-charcoal text-ivory'
                : 'border-charcoal/20 text-charcoal hover:border-charcoal'
            )}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  )
}
