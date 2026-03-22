export const dynamic = 'force-dynamic'

import { sql } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import { SectionHeading } from '@/components/shared/SectionHeading'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Shop our curated faith-forward collections. Each one a chapter, each piece a declaration.',
}

export default async function CollectionsPage() {
  const collections = await sql`SELECT * FROM collections WHERE active = true ORDER BY sort_order`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <SectionHeading
        eyebrow="All Collections"
        title="Every Collection Has a Story"
        subtitle="Each one a chapter. Each piece, a declaration. Find yours."
        className="mb-12"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection, index) => (
          <Link
            key={collection.id}
            href={`/collections/${collection.slug}`}
            className="group relative overflow-hidden aspect-[4/5] bg-warm-gray"
          >
            {collection.image_url ? (
              <Image
                src={collection.image_url}
                alt={collection.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  background: [
                    'linear-gradient(135deg, #FAF8F4 0%, #E8E4DC 100%)',
                    'linear-gradient(135deg, #1C1C1E 0%, #2D2D2D 100%)',
                    'linear-gradient(135deg, #6B7A5E 0%, #A8B59A 100%)',
                    'linear-gradient(135deg, #B8973A 0%, #D4AF6A 100%)',
                    'linear-gradient(135deg, #E8E4DC 0%, #FAF8F4 100%)',
                  ][index % 5],
                }}
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="font-display text-2xl mb-1">{collection.name}</h3>
              {collection.description && (
                <p className="font-body text-xs text-ivory/70 mb-2 line-clamp-2">
                  {collection.description}
                </p>
              )}
              <span className="font-body text-xs font-medium uppercase tracking-widest text-ivory/70 group-hover:text-gold transition-colors">
                Explore →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
