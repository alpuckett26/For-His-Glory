import { Suspense } from 'react'
import { sql } from '@/lib/db'
import { ProductGrid } from '@/components/shop/ProductGrid'
import { FilterSidebar } from '@/components/shop/FilterSidebar'
import { SortSelect } from '@/components/shop/SortSelect'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import type { Metadata } from 'next'
import type { Product } from '@/types'

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Browse our full collection of premium Christian apparel. Faith-forward designs, premium quality.',
}

interface ShopPageProps {
  searchParams: Promise<{
    collection?: string
    size?: string
    sort?: string
  }>
}

async function ShopContent({ searchParams }: ShopPageProps) {
  const params = await searchParams

  const sortClause =
    params.sort === 'price_asc' ? sql`ORDER BY p.price ASC` :
    params.sort === 'price_desc' ? sql`ORDER BY p.price DESC` :
    params.sort === 'featured' ? sql`ORDER BY p.featured DESC, p.created_at DESC` :
    sql`ORDER BY p.created_at DESC`

  const collectionFilter = params.collection
    ? sql`AND c.slug = ${params.collection}`
    : sql``

  const [allProducts, collections] = await Promise.all([
    sql`
      SELECT p.*,
        row_to_json(c.*) AS collection,
        json_agg(DISTINCT pi.*) FILTER (WHERE pi.id IS NOT NULL) AS images,
        json_agg(DISTINCT pv.*) FILTER (WHERE pv.id IS NOT NULL) AS variants
      FROM products p
      LEFT JOIN collections c ON c.id = p.collection_id
      LEFT JOIN product_images pi ON pi.product_id = p.id
      LEFT JOIN product_variants pv ON pv.product_id = p.id
      WHERE p.active = true ${collectionFilter}
      GROUP BY p.id, c.id
      ${sortClause}
    `,
    sql`SELECT * FROM collections WHERE active = true ORDER BY sort_order`,
  ])

  let filteredProducts = allProducts as Product[]
  if (params.size) {
    filteredProducts = filteredProducts.filter((p) =>
      p.variants?.some((v) => v.size === params.size && v.active)
    )
  }

  return (
    <div className="flex gap-10">
      <Suspense>
        <FilterSidebar collections={collections as unknown as never[]} />
      </Suspense>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <p className="font-body text-sm text-charcoal/60">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>
          <Suspense>
            <SortSelect />
          </Suspense>
        </div>
        <ProductGrid products={filteredProducts} />
      </div>
    </div>
  )
}

export default function ShopPage({ searchParams }: ShopPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="font-display text-4xl sm:text-5xl text-charcoal mb-2">Shop All</h1>
        <p className="font-body text-sm text-charcoal/60">
          Premium faith-forward apparel. Worn daily, worn with purpose.
        </p>
      </div>

      <Suspense fallback={<PageLoader />}>
        <ShopContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
