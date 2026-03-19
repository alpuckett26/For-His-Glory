import type { Product } from '@/types'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { ProductCard } from '@/components/shop/ProductCard'
import Link from 'next/link'

interface BestSellersProps {
  products: Product[]
}

export function BestSellers({ products }: BestSellersProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-ivory">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <SectionHeading
            eyebrow="Best Sellers"
            title="The People's Favorites"
            align="left"
          />
          <Link
            href="/shop"
            className="font-body text-sm font-medium text-charcoal hover:text-gold transition-colors underline underline-offset-4 whitespace-nowrap"
          >
            View All Products →
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
