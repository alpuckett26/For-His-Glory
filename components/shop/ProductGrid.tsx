import type { Product } from '@/types'
import { ProductCard } from './ProductCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { ShoppingBag } from 'lucide-react'

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-12 w-12" />}
        title="No products found"
        description="Try adjusting your filters or browse all of our collections."
        action={{ label: 'Shop All', href: '/shop' }}
      />
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
