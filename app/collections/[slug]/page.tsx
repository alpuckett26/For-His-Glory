export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { sql } from '@/lib/db'
import { ProductGrid } from '@/components/shop/ProductGrid'
import type { Metadata } from 'next'
import type { Product } from '@/types'

interface CollectionPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params
  const rows = await sql`SELECT * FROM collections WHERE slug = ${slug} AND active = true LIMIT 1`
  const collection = rows[0]

  if (!collection) return { title: 'Collection Not Found' }

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

  const [collectionRows, collectionProducts] = await Promise.all([
    sql`SELECT * FROM collections WHERE slug = ${slug} AND active = true LIMIT 1`,
    sql`
      SELECT p.*,
        row_to_json(c.*) AS collection,
        json_agg(DISTINCT pi.*) FILTER (WHERE pi.id IS NOT NULL) AS images,
        json_agg(DISTINCT pv.*) FILTER (WHERE pv.id IS NOT NULL) AS variants
      FROM products p
      INNER JOIN collections c ON c.id = p.collection_id AND c.slug = ${slug}
      LEFT JOIN product_images pi ON pi.product_id = p.id
      LEFT JOIN product_variants pv ON pv.product_id = p.id
      WHERE p.active = true
      GROUP BY p.id, c.id
      ORDER BY p.created_at DESC
    `,
  ])

  const collection = collectionRows[0]
  if (!collection) notFound()

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
        <ProductGrid products={collectionProducts as unknown as Product[]} />
      </div>
    </div>
  )
}
