'use client'

import { cn } from '@/lib/utils'
import type { ProductVariant } from '@/types'

interface ColorSelectorProps {
  variants: ProductVariant[]
  selectedColor: string | null
  onColorSelect: (color: string) => void
}

export function ColorSelector({ variants, selectedColor, onColorSelect }: ColorSelectorProps) {
  const uniqueColors = Array.from(
    new Map(
      variants
        .filter((v) => v.color && v.active)
        .map((v) => [v.color, { color: v.color!, colorHex: v.color_hex }])
    ).values()
  )

  if (uniqueColors.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="font-body text-sm font-medium text-charcoal">
          Color:{' '}
          <span className="font-normal text-charcoal/60">{selectedColor ?? 'Select'}</span>
        </span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {uniqueColors.map(({ color, colorHex }) => (
          <button
            key={color}
            onClick={() => onColorSelect(color)}
            title={color}
            className={cn(
              'w-8 h-8 rounded-full border-2 transition-all relative',
              selectedColor === color
                ? 'border-charcoal scale-110 ring-2 ring-charcoal/20 ring-offset-2'
                : 'border-transparent hover:scale-105'
            )}
            style={{ backgroundColor: colorHex ?? '#ccc' }}
          >
            <span className="sr-only">{color}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
