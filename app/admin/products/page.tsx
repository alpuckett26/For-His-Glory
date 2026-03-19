'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminTable } from '@/components/admin/AdminTable'
import { formatPrice, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { Product } from '@/types'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, collection:collections(*)')
      .order('created_at', { ascending: false })

    setProducts(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const toggleActive = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ active: !product.active })
      .eq('id', product.id)

    if (error) {
      toast.error('Failed to update product')
    } else {
      toast.success(`${product.title} ${product.active ? 'deactivated' : 'activated'}`)
      fetchProducts()
    }
  }

  const toggleFeatured = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ featured: !product.featured })
      .eq('id', product.id)

    if (error) {
      toast.error('Failed to update product')
    } else {
      fetchProducts()
    }
  }

  if (loading) return <div className="font-body text-sm text-charcoal/50">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-charcoal mb-1">Products</h1>
          <p className="font-body text-sm text-charcoal/50">{products.length} products</p>
        </div>
      </div>

      <div className="bg-white border border-warm-gray">
        <AdminTable
          columns={[
            { key: 'title', label: 'Product' },
            {
              key: 'collection',
              label: 'Collection',
              render: (row) => (
                <span>{row.collection?.name ?? '—'}</span>
              ),
            },
            {
              key: 'price',
              label: 'Price',
              render: (row) => <span>{formatPrice(row.price)}</span>,
            },
            {
              key: 'featured',
              label: 'Featured',
              render: (row) => (
                <button
                  onClick={() => toggleFeatured(row)}
                  className={`text-xs font-body font-medium transition-colors ${
                    row.featured ? 'text-gold' : 'text-charcoal/40 hover:text-charcoal'
                  }`}
                >
                  {row.featured ? '★ Featured' : '☆ Feature'}
                </button>
              ),
            },
            {
              key: 'active',
              label: 'Status',
              render: (row) => (
                <button
                  onClick={() => toggleActive(row)}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-medium transition-colors ${
                    row.active
                      ? 'bg-green-100 text-green-800 hover:bg-red-100 hover:text-red-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-800'
                  }`}
                >
                  {row.active ? 'Active' : 'Inactive'}
                </button>
              ),
            },
            {
              key: 'created_at',
              label: 'Created',
              render: (row) => <span>{formatDate(row.created_at)}</span>,
            },
            {
              key: 'actions',
              label: '',
              render: (row) => (
                <a
                  href={`/products/${row.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-xs text-gold hover:text-gold-light transition-colors"
                >
                  View →
                </a>
              ),
            },
          ]}
          data={products}
          emptyMessage="No products yet."
        />
      </div>
    </div>
  )
}
