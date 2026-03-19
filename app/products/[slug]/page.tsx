'use client'

import { useState, use } from 'react'
import { notFound } from 'next/navigation'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductInfo } from '@/components/product/ProductInfo'
import { ColorSelector } from '@/components/product/ColorSelector'
import { SizeSelector } from '@/components/product/SizeSelector'
import { AddToCartModule } from '@/components/product/AddToCartModule'
import { FaithStory } from '@/components/product/FaithStory'
import { RelatedProducts } from '@/components/product/RelatedProducts'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product, ProductVariant } from '@/types'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProduct() {
      const supabase = createClient()

      const { data } = await supabase
        .from('products')
        .select(`
          *,
          collection:collections(*),
          images:product_images(*),
          variants:product_variants(*)
        `)
        .eq('slug', slug)
        .eq('active', true)
        .single()

      if (data) {
        setProduct(data)

        // Fetch related products
        if (data.collection_id) {
          const { data: related } = await supabase
            .from('products')
            .select(`
              *,
              collection:collections(*),
              images:product_images(*),
              variants:product_variants(*)
            `)
            .eq('collection_id', data.collection_id)
            .eq('active', true)
            .neq('id', data.id)
            .limit(4)

          setRelatedProducts(related ?? [])
        }
      }

      setLoading(false)
    }

    fetchProduct()
  }, [slug])

  if (loading) return <PageLoader />
  if (!product) return notFound()

  const variants = product.variants ?? []
  const images = (product.images ?? []).sort((a, b) => a.sort_order - b.sort_order)
  const primaryImage = images.find((img) => img.is_primary) ?? images[0] ?? null

  const selectedVariant: ProductVariant | null =
    selectedColor && selectedSize
      ? variants.find(
          (v) =>
            v.color === selectedColor &&
            v.size === selectedSize &&
            v.active
        ) ?? null
      : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Gallery */}
        <ProductGallery images={images} productTitle={product.title} />

        {/* Product details */}
        <div className="space-y-6">
          <ProductInfo product={product} />

          <ColorSelector
            variants={variants}
            selectedColor={selectedColor}
            onColorSelect={(color) => {
              setSelectedColor(color)
              setSelectedSize(null)
            }}
          />

          <SizeSelector
            variants={variants}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            onSizeSelect={setSelectedSize}
          />

          <AddToCartModule
            product={product}
            selectedVariant={selectedVariant}
            primaryImage={primaryImage}
          />

          {product.brand_message && (
            <FaithStory
              brandMessage={product.brand_message}
              longDescription={product.long_description}
            />
          )}
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts products={relatedProducts} />
    </div>
  )
}
