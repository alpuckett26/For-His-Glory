export const dynamic = 'force-dynamic'

import { sql } from '@/lib/db'
import { Hero } from '@/components/home/Hero'
import { FeaturedCollections } from '@/components/home/FeaturedCollections'
import { BestSellers } from '@/components/home/BestSellers'
import { MissionSection } from '@/components/home/MissionSection'
import { Testimonials } from '@/components/home/Testimonials'
import { BulkOrdersCTA } from '@/components/home/BulkOrdersCTA'
import { NewsletterSignup } from '@/components/home/NewsletterSignup'
import type { Collection, Product } from '@/types'

export default async function HomePage() {
  const [collections, featuredProducts] = await Promise.all([
    sql`SELECT * FROM collections WHERE active = true ORDER BY sort_order`,
    sql`
      SELECT p.*,
        row_to_json(c.*) AS collection,
        json_agg(DISTINCT pi.*) FILTER (WHERE pi.id IS NOT NULL) AS images,
        json_agg(DISTINCT pv.*) FILTER (WHERE pv.id IS NOT NULL) AS variants
      FROM products p
      LEFT JOIN collections c ON c.id = p.collection_id
      LEFT JOIN product_images pi ON pi.product_id = p.id
      LEFT JOIN product_variants pv ON pv.product_id = p.id
      WHERE p.active = true AND p.featured = true
      GROUP BY p.id, c.id
      LIMIT 4
    `,
  ])

  return (
    <>
      <Hero />
      <FeaturedCollections collections={collections as unknown as Collection[]} />
      <BestSellers products={featuredProducts as unknown as Product[]} />
      <MissionSection />
      <Testimonials />
      <BulkOrdersCTA />
      <NewsletterSignup />
    </>
  )
}
