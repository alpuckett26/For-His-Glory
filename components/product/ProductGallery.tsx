'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { ProductImage } from '@/types'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
  images: ProductImage[]
  productTitle: string
}

export function ProductGallery({ images, productTitle }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const displayImages = images.length > 0 ? images : []
  const activeImage = displayImages[activeIndex]

  if (displayImages.length === 0) {
    return (
      <div className="aspect-square bg-warm-gray flex items-center justify-center">
        <span className="font-display text-6xl text-charcoal/20">
          {productTitle.charAt(0)}
        </span>
      </div>
    )
  }

  return (
    <div className="flex gap-4">
      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="hidden sm:flex flex-col gap-2 w-16 shrink-0">
          {displayImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative aspect-square overflow-hidden border-2 transition-colors',
                activeIndex === index
                  ? 'border-gold'
                  : 'border-transparent hover:border-charcoal/20'
              )}
            >
              <Image
                src={image.url}
                alt={image.alt_text ?? `${productTitle} view ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="flex-1">
        <div className="relative aspect-square sm:aspect-[4/5] bg-warm-gray overflow-hidden">
          {activeImage && (
            <Image
              src={activeImage.url}
              alt={activeImage.alt_text ?? productTitle}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          )}
        </div>

        {/* Mobile thumbnails */}
        {displayImages.length > 1 && (
          <div className="flex gap-2 mt-3 sm:hidden overflow-x-auto pb-1">
            {displayImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'relative w-14 h-14 shrink-0 overflow-hidden border-2 transition-colors',
                  activeIndex === index
                    ? 'border-gold'
                    : 'border-transparent hover:border-charcoal/20'
                )}
              >
                <Image
                  src={image.url}
                  alt={image.alt_text ?? `${productTitle} view ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
