'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/shared/Badge'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0]
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      {/* Image */}
      <div className="relative aspect-[3/4] bg-warm-gray overflow-hidden mb-3">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt_text ?? product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-warm-gray">
            <span className="font-display text-4xl text-charcoal/20">
              {product.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.featured && (
            <Badge variant="gold" className="text-[10px]">Best Seller</Badge>
          )}
          {hasDiscount && (
            <Badge variant="default" className="text-[10px]">Sale</Badge>
          )}
        </div>

        {/* Quick add on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="bg-charcoal text-ivory py-2.5 px-4 flex items-center justify-center gap-2 font-body text-xs font-medium uppercase tracking-wider">
            <ShoppingBag className="h-3.5 w-3.5" />
            Quick Add
          </div>
        </div>
      </div>

      {/* Info */}
      <div>
        {product.collection && (
          <p className="font-body text-[11px] text-charcoal/50 uppercase tracking-wider mb-1">
            {product.collection.name}
          </p>
        )}
        <h3 className="font-display text-base sm:text-lg text-charcoal leading-snug mb-1.5 group-hover:text-gold transition-colors">
          {product.title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-body text-sm font-semibold text-charcoal">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="font-body text-sm text-charcoal/40 line-through">
              {formatPrice(product.compare_at_price!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
