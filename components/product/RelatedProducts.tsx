import type { Product } from '@/types'
import { ProductCard } from '@/components/shop/ProductCard'
import { SectionHeading } from '@/components/shared/SectionHeading'

interface RelatedProductsProps {
  products: Product[]
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null

  return (
    <section className="border-t border-warm-gray pt-16 mt-16">
      <SectionHeading
        eyebrow="You Might Also Love"
        title="From the Same Collection"
        className="mb-10"
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
