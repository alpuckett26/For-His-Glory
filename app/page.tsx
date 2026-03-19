import { createClient } from '@/lib/supabase/server'
import { Hero } from '@/components/home/Hero'
import { FeaturedCollections } from '@/components/home/FeaturedCollections'
import { BestSellers } from '@/components/home/BestSellers'
import { MissionSection } from '@/components/home/MissionSection'
import { Testimonials } from '@/components/home/Testimonials'
import { BulkOrdersCTA } from '@/components/home/BulkOrdersCTA'
import { NewsletterSignup } from '@/components/home/NewsletterSignup'

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: collections }, { data: featuredProducts }] = await Promise.all([
    supabase
      .from('collections')
      .select('*')
      .eq('active', true)
      .order('sort_order'),
    supabase
      .from('products')
      .select(`
        *,
        collection:collections(*),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq('active', true)
      .eq('featured', true)
      .limit(4),
  ])

  return (
    <>
      <Hero />
      <FeaturedCollections collections={collections ?? []} />
      <BestSellers products={featuredProducts ?? []} />
      <MissionSection />
      <Testimonials />
      <BulkOrdersCTA />
      <NewsletterSignup />
    </>
  )
}
