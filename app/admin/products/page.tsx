'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Star, Upload, X, PlusCircle } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { AdminTable } from '@/components/admin/AdminTable'
import { AdminDrawer } from '@/components/admin/AdminDrawer'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { formatPrice, formatDate, slugify } from '@/lib/utils'
import type { Product, ProductVariant, ProductImage, Collection } from '@/types'

// ─── Zod schema ────────────────────────────────────────────────────────────────

const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  long_description: z.string().optional(),
  brand_message: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be ≥ 0'),
  compare_at_price: z.coerce.number().optional().nullable(),
  collection_id: z.string().optional().nullable(),
  featured: z.boolean(),
  active: z.boolean(),
  tags: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

const variantSchema = z.object({
  size: z.string().optional(),
  color: z.string().optional(),
  color_hex: z.string().optional(),
  price: z.coerce.number().optional().nullable(),
  sku: z.string().optional(),
})

type VariantFormValues = z.infer<typeof variantSchema>

// ─── Helper ────────────────────────────────────────────────────────────────────

type ProductWithRelations = Product & {
  images?: ProductImage[]
  variants?: ProductVariant[]
}

function inputClass(error?: boolean) {
  return `w-full px-3 py-2.5 border font-body text-sm focus:outline-none focus:border-gold transition-colors ${
    error ? 'border-red-400' : 'border-charcoal/20'
  }`
}

function labelClass() {
  return 'block font-body text-sm font-medium text-charcoal mb-1.5'
}

// ─── Product Form ──────────────────────────────────────────────────────────────

interface ProductFormProps {
  product: ProductWithRelations | null
  collections: Collection[]
  onSaved: () => void
}

function ProductFormContent({ product, collections, onSaved }: ProductFormProps) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [savedProductId, setSavedProductId] = useState<string | null>(product?.id ?? null)

  // Variants
  const [variants, setVariants] = useState<VariantFormValues[]>(
    product?.variants?.map((v) => ({
      size: v.size ?? '',
      color: v.color ?? '',
      color_hex: v.color_hex ?? '',
      price: v.price ?? null,
      sku: v.sku ?? '',
    })) ?? []
  )
  const [addingVariant, setAddingVariant] = useState(false)
  const [variantDraft, setVariantDraft] = useState<VariantFormValues>({
    size: '',
    color: '',
    color_hex: '',
    price: null,
    sku: '',
  })

  // Images
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? [])
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: product?.title ?? '',
      slug: product?.slug ?? '',
      description: product?.description ?? '',
      long_description: product?.long_description ?? '',
      brand_message: product?.brand_message ?? '',
      price: product?.price ?? 0,
      compare_at_price: product?.compare_at_price ?? null,
      collection_id: product?.collection_id ?? null,
      featured: product?.featured ?? false,
      active: product?.active ?? true,
      tags: product?.tags?.join(', ') ?? '',
    },
  })

  const title = watch('title')
  useEffect(() => {
    if (!product) {
      setValue('slug', slugify(title))
    }
  }, [title, product, setValue])

  const onSubmit = async (data: ProductFormValues) => {
    setSaving(true)
    try {
      const payload = {
        title: data.title,
        slug: data.slug,
        description: data.description ?? null,
        long_description: data.long_description ?? null,
        brand_message: data.brand_message ?? null,
        price: data.price,
        compare_at_price: data.compare_at_price ?? null,
        collection_id: data.collection_id ?? null,
        featured: data.featured,
        active: data.active,
        tags: data.tags
          ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      }

      if (product) {
        const { error } = await supabase.from('products').update(payload).eq('id', product.id)
        if (error) throw error
        setSavedProductId(product.id)
        toast.success('Product updated')
      } else {
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert(payload)
          .select()
          .single()
        if (error) throw error
        setSavedProductId(newProduct.id)
        toast.success('Product created')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const addVariant = async () => {
    if (!savedProductId) return toast.error('Save the product first')
    const { error } = await supabase.from('product_variants').insert({
      product_id: savedProductId,
      size: variantDraft.size || null,
      color: variantDraft.color || null,
      color_hex: variantDraft.color_hex || null,
      price: variantDraft.price ?? null,
      sku: variantDraft.sku || null,
      active: true,
      inventory_count: 0,
    })
    if (error) return toast.error('Failed to add variant')
    setVariants((prev) => [...prev, variantDraft])
    setVariantDraft({ size: '', color: '', color_hex: '', price: null, sku: '' })
    setAddingVariant(false)
    toast.success('Variant added')
  }

  const deleteVariant = async (idx: number) => {
    if (!savedProductId) return
    const variant = product?.variants?.[idx]
    if (variant?.id) {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variant.id)
      if (error) return toast.error('Failed to delete variant')
    }
    setVariants((prev) => prev.filter((_, i) => i !== idx))
    toast.success('Variant removed')
  }

  const uploadImage = async (file: File) => {
    if (!savedProductId) return toast.error('Save the product first')
    setUploadingImage(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${savedProductId}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file)
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
      const isPrimary = images.length === 0

      const { data: img, error: dbError } = await supabase
        .from('product_images')
        .insert({
          product_id: savedProductId,
          url: urlData.publicUrl,
          alt_text: file.name,
          sort_order: images.length,
          is_primary: isPrimary,
        })
        .select()
        .single()
      if (dbError) throw dbError
      setImages((prev) => [...prev, img])
      toast.success('Image uploaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  const deleteImage = async (img: ProductImage) => {
    const { error } = await supabase.from('product_images').delete().eq('id', img.id)
    if (error) return toast.error('Failed to delete image')
    setImages((prev) => prev.filter((i) => i.id !== img.id))
    toast.success('Image removed')
  }

  return (
    <div className="space-y-8">
      {/* Core fields */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass()}>Title *</label>
            <input {...register('title')} className={inputClass(!!errors.title)} />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>
          <div>
            <label className={labelClass()}>Slug *</label>
            <input {...register('slug')} className={inputClass(!!errors.slug)} />
            {errors.slug && (
              <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className={labelClass()}>Description</label>
          <textarea {...register('description')} rows={3} className={inputClass()} />
        </div>

        <div>
          <label className={labelClass()}>Long Description</label>
          <textarea {...register('long_description')} rows={4} className={inputClass()} />
        </div>

        <div>
          <label className={labelClass()}>Brand Message (faith pull quote)</label>
          <textarea {...register('brand_message')} rows={2} className={inputClass()} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass()}>Price ($) *</label>
            <input type="number" step="0.01" {...register('price')} className={inputClass(!!errors.price)} />
            {errors.price && (
              <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>
            )}
          </div>
          <div>
            <label className={labelClass()}>Compare At Price ($)</label>
            <input type="number" step="0.01" {...register('compare_at_price')} className={inputClass()} />
          </div>
        </div>

        <div>
          <label className={labelClass()}>Collection</label>
          <select {...register('collection_id')} className={inputClass()}>
            <option value="">— None —</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass()}>Tags (comma-separated)</label>
          <input {...register('tags')} placeholder="faith, apparel, unisex" className={inputClass()} />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('active')} className="rounded" />
            <span className="font-body text-sm text-charcoal">Active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('featured')} className="rounded" />
            <span className="font-body text-sm text-charcoal">Featured</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-charcoal text-ivory font-body text-sm font-medium py-3 hover:bg-charcoal/80 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : product ? 'Update Product' : 'Create Product'}
        </button>
      </form>

      {/* Variants */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg text-charcoal">Variants</h3>
          <button
            onClick={() => setAddingVariant(true)}
            className="flex items-center gap-1.5 font-body text-xs text-gold hover:text-gold-light transition-colors"
          >
            <PlusCircle className="h-4 w-4" /> Add variant
          </button>
        </div>

        {variants.length > 0 && (
          <div className="border border-warm-gray divide-y divide-warm-gray mb-3">
            {variants.map((v, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 flex items-center gap-4 flex-wrap">
                  {v.color_hex && (
                    <span
                      className="h-4 w-4 rounded-full border border-charcoal/20 shrink-0"
                      style={{ background: v.color_hex }}
                    />
                  )}
                  <span className="font-body text-sm text-charcoal">
                    {[v.color, v.size].filter(Boolean).join(' / ') || '—'}
                  </span>
                  {v.price && (
                    <span className="font-body text-sm text-charcoal/60">
                      {formatPrice(v.price)}
                    </span>
                  )}
                  {v.sku && (
                    <span className="font-mono text-xs text-charcoal/40">{v.sku}</span>
                  )}
                </div>
                <button
                  onClick={() => deleteVariant(i)}
                  className="text-charcoal/30 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {addingVariant && (
          <div className="border border-warm-gray p-4 space-y-3 mb-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-body text-xs font-medium text-charcoal/60 mb-1">Size</label>
                <input
                  value={variantDraft.size ?? ''}
                  onChange={(e) => setVariantDraft((d) => ({ ...d, size: e.target.value }))}
                  placeholder="M"
                  className={inputClass()}
                />
              </div>
              <div>
                <label className="block font-body text-xs font-medium text-charcoal/60 mb-1">Color</label>
                <input
                  value={variantDraft.color ?? ''}
                  onChange={(e) => setVariantDraft((d) => ({ ...d, color: e.target.value }))}
                  placeholder="Black"
                  className={inputClass()}
                />
              </div>
              <div>
                <label className="block font-body text-xs font-medium text-charcoal/60 mb-1">Color Hex</label>
                <input
                  value={variantDraft.color_hex ?? ''}
                  onChange={(e) => setVariantDraft((d) => ({ ...d, color_hex: e.target.value }))}
                  placeholder="#1C1C1E"
                  className={inputClass()}
                />
              </div>
              <div>
                <label className="block font-body text-xs font-medium text-charcoal/60 mb-1">Price Override ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={variantDraft.price ?? ''}
                  onChange={(e) =>
                    setVariantDraft((d) => ({ ...d, price: e.target.value ? Number(e.target.value) : null }))
                  }
                  className={inputClass()}
                />
              </div>
              <div className="col-span-2">
                <label className="block font-body text-xs font-medium text-charcoal/60 mb-1">SKU</label>
                <input
                  value={variantDraft.sku ?? ''}
                  onChange={(e) => setVariantDraft((d) => ({ ...d, sku: e.target.value }))}
                  className={inputClass()}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addVariant}
                className="flex-1 bg-charcoal text-ivory font-body text-sm py-2 hover:bg-charcoal/80 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setAddingVariant(false)}
                className="px-4 font-body text-sm text-charcoal/60 hover:text-charcoal border border-charcoal/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {variants.length === 0 && !addingVariant && (
          <p className="font-body text-xs text-charcoal/40">No variants yet.</p>
        )}
      </div>

      {/* Images */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg text-charcoal">Images</h3>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage || !savedProductId}
            className="flex items-center gap-1.5 font-body text-xs text-gold hover:text-gold-light transition-colors disabled:opacity-40"
          >
            <Upload className="h-4 w-4" />
            {uploadingImage ? 'Uploading…' : 'Upload image'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) uploadImage(file)
              e.target.value = ''
            }}
          />
        </div>

        {!savedProductId && (
          <p className="font-body text-xs text-charcoal/40 mb-3">
            Save the product first to upload images.
          </p>
        )}

        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative group aspect-square bg-warm-gray">
                <Image
                  src={img.url}
                  alt={img.alt_text ?? ''}
                  fill
                  className="object-cover"
                />
                {img.is_primary && (
                  <span className="absolute top-1 left-1 text-[10px] bg-gold text-white font-body font-medium px-1.5 py-0.5 rounded">
                    Primary
                  </span>
                )}
                <button
                  onClick={() => deleteImage(img)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {images.length === 0 && savedProductId && (
          <p className="font-body text-xs text-charcoal/40">No images yet.</p>
        )}
      </div>

      <button
        onClick={onSaved}
        className="w-full border border-charcoal/20 font-body text-sm text-charcoal py-2.5 hover:bg-charcoal/5 transition-colors"
      >
        Done
      </button>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<ProductWithRelations[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCollection, setFilterCollection] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductWithRelations | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [{ data: prods }, { data: cols }] = await Promise.all([
      supabase
        .from('products')
        .select('*, collection:collections(*), images:product_images(*), variants:product_variants(*)')
        .order('created_at', { ascending: false }),
      supabase.from('collections').select('*').order('name'),
    ])
    setProducts(prods ?? [])
    setCollections(cols ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const toggleActive = async (product: ProductWithRelations) => {
    const { error } = await supabase
      .from('products')
      .update({ active: !product.active })
      .eq('id', product.id)
    if (error) return toast.error('Failed to update')
    toast.success(`${product.active ? 'Deactivated' : 'Activated'} ${product.title}`)
    fetchData()
  }

  const toggleFeatured = async (product: ProductWithRelations) => {
    const { error } = await supabase
      .from('products')
      .update({ featured: !product.featured })
      .eq('id', product.id)
    if (error) return toast.error('Failed to update')
    fetchData()
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    setDeletingId(id)
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) toast.error('Failed to delete product')
    else {
      toast.success('Product deleted')
      fetchData()
    }
    setDeletingId(null)
  }

  const openCreate = () => {
    setEditingProduct(null)
    setDrawerOpen(true)
  }

  const openEdit = (product: ProductWithRelations) => {
    setEditingProduct(product)
    setDrawerOpen(true)
  }

  // Filtered data
  const filtered = products.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    if (filterCollection && p.collection_id !== filterCollection) return false
    if (filterStatus === 'active' && !p.active) return false
    if (filterStatus === 'inactive' && p.active) return false
    return true
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-charcoal mb-1">Products</h1>
          <p className="font-body text-sm text-charcoal/50">{products.length} products</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-charcoal text-ivory font-body text-sm font-medium px-4 py-2.5 hover:bg-charcoal/80 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="px-3 py-2 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold w-56"
        />
        <select
          value={filterCollection}
          onChange={(e) => setFilterCollection(e.target.value)}
          className="px-3 py-2 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
        >
          <option value="">All Collections</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
          className="px-3 py-2 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-white border border-warm-gray">
        <AdminTable
          loading={loading}
          data={filtered}
          emptyMessage="No products found."
          columns={[
            {
              key: 'image',
              label: '',
              className: 'w-14',
              render: (row) => {
                const primary = row.images?.find((i) => i.is_primary) ?? row.images?.[0]
                return primary ? (
                  <div className="h-10 w-10 relative bg-warm-gray shrink-0">
                    <Image src={primary.url} alt={row.title} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="h-10 w-10 bg-warm-gray" />
                )
              },
            },
            {
              key: 'title',
              label: 'Product',
              render: (row) => (
                <div>
                  <p className="font-body text-sm font-medium text-charcoal">{row.title}</p>
                  <p className="font-mono text-xs text-charcoal/40">{row.slug}</p>
                </div>
              ),
            },
            {
              key: 'collection',
              label: 'Collection',
              render: (row) => (
                <span className="font-body text-sm text-charcoal/70">
                  {(row.collection as Collection | undefined)?.name ?? '—'}
                </span>
              ),
            },
            {
              key: 'price',
              label: 'Price',
              render: (row) => <span>{formatPrice(row.price)}</span>,
            },
            {
              key: 'active',
              label: 'Status',
              render: (row) => (
                <button onClick={() => toggleActive(row)}>
                  <StatusBadge status={row.active ? 'active' : 'inactive'} />
                </button>
              ),
            },
            {
              key: 'featured',
              label: 'Featured',
              render: (row) => (
                <button
                  onClick={() => toggleFeatured(row)}
                  className={`transition-colors ${row.featured ? 'text-gold' : 'text-charcoal/20 hover:text-charcoal/50'}`}
                  title={row.featured ? 'Unfeature' : 'Feature'}
                >
                  <Star className="h-4 w-4" fill={row.featured ? 'currentColor' : 'none'} />
                </button>
              ),
            },
            {
              key: 'created_at',
              label: 'Created',
              render: (row) => (
                <span className="text-xs text-charcoal/50">{formatDate(row.created_at)}</span>
              ),
            },
            {
              key: 'actions',
              label: '',
              render: (row) => (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(row)}
                    className="p-1.5 text-charcoal/40 hover:text-charcoal transition-colors"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteProduct(row.id)}
                    disabled={deletingId === row.id}
                    className="p-1.5 text-charcoal/40 hover:text-red-500 transition-colors disabled:opacity-30"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      </div>

      <AdminDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingProduct ? 'Edit Product' : 'New Product'}
        width="max-w-2xl"
      >
        <ProductFormContent
          key={editingProduct?.id ?? 'new'}
          product={editingProduct}
          collections={collections}
          onSaved={() => {
            setDrawerOpen(false)
            fetchData()
          }}
        />
      </AdminDrawer>
    </div>
  )
}
