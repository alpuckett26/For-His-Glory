import type { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/shared/Badge'

interface ProductInfoProps {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.compare_at_price!) * 100)
    : null

  return (
    <div>
      {product.collection && (
        <p className="font-body text-xs font-semibold uppercase tracking-widest text-gold mb-2">
          {product.collection.name}
        </p>
      )}

      <h1 className="font-display text-3xl sm:text-4xl text-charcoal mb-3 leading-tight">
        {product.title}
      </h1>

      {/* Price */}
      <div className="flex items-center gap-3 mb-4">
        <span className="font-body text-2xl font-semibold text-charcoal">
          {formatPrice(product.price)}
        </span>
        {hasDiscount && (
          <>
            <span className="font-body text-lg text-charcoal/40 line-through">
              {formatPrice(product.compare_at_price!)}
            </span>
            <Badge variant="gold">{discountPercent}% off</Badge>
          </>
        )}
      </div>

      {/* Short description */}
      {product.description && (
        <p className="font-body text-sm text-charcoal/70 leading-relaxed border-t border-warm-gray pt-4">
          {product.description}
        </p>
      )}
    </div>
  )
}
