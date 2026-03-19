import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/shop/ProductGrid'
import type { Metadata } from 'next'

interface CollectionPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: collection } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!collection) {
    return { title: 'Collection Not Found' }
  }

  return {
    title: collection.name,
    description: collection.description ?? `Shop the ${collection.name} collection from For His Glory.`,
    openGraph: {
      title: `${collection.name} | For His Glory`,
      description: collection.description ?? undefined,
      images: collection.image_url ? [{ url: collection.image_url }] : [],
    },
  }
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const [{ data: collection }, { data: products }] = await Promise.all([
    supabase
      .from('collections')
      .select('*')
      .eq('slug', slug)
      .eq('active', true)
      .single(),
    supabase
      .from('products')
      .select(`
        *,
        collection:collections(*),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq('active', true)
      .order('created_at', { ascending: false }),
  ])

  if (!collection) {
    notFound()
  }

  // Filter products by collection
  const collectionProducts = (products ?? []).filter(
    (p) => p.collection_id === collection.id
  )

  return (
    <div>
      {/* Collection header */}
      <div className="bg-warm-gray py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-gold mb-3">
            Collection
          </p>
          <h1 className="font-display text-4xl sm:text-6xl text-charcoal mb-4 leading-tight">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="font-body text-base text-charcoal/60 leading-relaxed max-w-xl mx-auto">
              {collection.description}
            </p>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-8">
          <p className="font-body text-sm text-charcoal/60">
            {collectionProducts.length} {collectionProducts.length === 1 ? 'piece' : 'pieces'}
          </p>
        </div>
        <ProductGrid products={collectionProducts} />
      </div>
    </div>
  )
}
