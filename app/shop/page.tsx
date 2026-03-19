import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
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
  const supabase = await createClient()

  // Build the query
  let query = supabase
    .from('products')
    .select(`
      *,
      collection:collections(*),
      images:product_images(*),
      variants:product_variants(*)
    `)
    .eq('active', true)

  // Collection filter
  if (params.collection) {
    const { data: collection } = await supabase
      .from('collections')
      .select('id')
      .eq('slug', params.collection)
      .single()

    if (collection) {
      query = query.eq('collection_id', collection.id)
    }
  }

  // Sort
  switch (params.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'featured':
      query = query.order('featured', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const [{ data: products }, { data: collections }] = await Promise.all([
    query,
    supabase.from('collections').select('*').eq('active', true).order('sort_order'),
  ])

  // Size filter (client-side after fetch since it's on variants)
  let filteredProducts = (products ?? []) as Product[]
  if (params.size) {
    filteredProducts = filteredProducts.filter((p) =>
      p.variants?.some((v) => v.size === params.size && v.active)
    )
  }

  return (
    <div className="flex gap-10">
      <Suspense>
        <FilterSidebar collections={collections ?? []} />
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
