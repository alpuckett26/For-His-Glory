'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { AdminTable } from '@/components/admin/AdminTable'
import { AdminDrawer } from '@/components/admin/AdminDrawer'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { formatDate, slugify } from '@/lib/utils'
import type { Collection } from '@/types'

// ─── Schema ────────────────────────────────────────────────────────────────────

const collectionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  featured: z.boolean(),
  active: z.boolean(),
  sort_order: z.coerce.number().int().min(0),
})

type CollectionFormValues = z.infer<typeof collectionSchema>

// ─── Form ──────────────────────────────────────────────────────────────────────

interface CollectionFormProps {
  collection: Collection | null
  onSaved: () => void
}

function CollectionFormContent({ collection, onSaved }: CollectionFormProps) {
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(collection?.id ?? null)
  const [imageUrl, setImageUrl] = useState<string | null>(collection?.image_url ?? null)
  const [imageUrlInput, setImageUrlInput] = useState<string>(collection?.image_url ?? '')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: collection?.name ?? '',
      slug: collection?.slug ?? '',
      description: collection?.description ?? '',
      featured: collection?.featured ?? false,
      active: collection?.active ?? true,
      sort_order: collection?.sort_order ?? 0,
    },
  })

  const name = watch('name')
  useEffect(() => {
    if (!collection) {
      setValue('slug', slugify(name))
    }
  }, [name, collection, setValue])

  const onSubmit = async (data: CollectionFormValues) => {
    setSaving(true)
    try {
      const payload = {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        featured: data.featured,
        active: data.active,
        sort_order: data.sort_order,
        image_url: imageUrl,
      }

      const updatedPayload = { ...payload, image_url: imageUrl }
      if (collection) {
        const res = await fetch('/api/admin/collections', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: collection.id, ...updatedPayload }),
        })
        if (!res.ok) throw new Error('Failed to update')
        setSavedId(collection.id)
        toast.success('Collection updated')
      } else {
        const res = await fetch('/api/admin/collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPayload),
        })
        if (!res.ok) throw new Error('Failed to create')
        const newCol = await res.json()
        setSavedId(newCol.id)
        toast.success('Collection created')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const applyImageUrl = async () => {
    if (!savedId || !imageUrlInput) return
    const res = await fetch('/api/admin/collections', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: savedId, image_url: imageUrlInput }),
    })
    if (!res.ok) return toast.error('Failed to save image URL')
    setImageUrl(imageUrlInput)
    toast.success('Image URL saved')
  }

  const inputClass = (err?: boolean) =>
    `w-full px-3 py-2.5 border font-body text-sm focus:outline-none focus:border-gold transition-colors ${
      err ? 'border-red-400' : 'border-charcoal/20'
    }`

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
              Name *
            </label>
            <input {...register('name')} className={inputClass(!!errors.name)} />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
              Slug *
            </label>
            <input {...register('slug')} className={inputClass(!!errors.slug)} />
            {errors.slug && (
              <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
            Description
          </label>
          <textarea {...register('description')} rows={3} className={inputClass()} />
        </div>

        <div>
          <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
            Sort Order
          </label>
          <input type="number" {...register('sort_order')} className={inputClass()} />
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
          {saving ? 'Saving…' : collection ? 'Update Collection' : 'Create Collection'}
        </button>
      </form>

      {/* Image */}
      <div>
        <h3 className="font-display text-lg text-charcoal mb-3">Image URL</h3>
        {!savedId && (
          <p className="font-body text-xs text-charcoal/40 mb-2">
            Save the collection first to set an image.
          </p>
        )}
        <div className="flex gap-2">
          <input
            type="url"
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            placeholder="https://..."
            disabled={!savedId}
            className="flex-1 px-3 py-2.5 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold disabled:opacity-50"
          />
          <button
            type="button"
            onClick={applyImageUrl}
            disabled={!savedId || !imageUrlInput}
            className="px-4 py-2.5 bg-charcoal text-ivory font-body text-sm hover:bg-charcoal/80 transition-colors disabled:opacity-40"
          >
            Set
          </button>
        </div>
        {imageUrl && (
          <div className="relative aspect-video bg-warm-gray w-full max-w-xs mt-3">
            <Image src={imageUrl} alt="Collection" fill className="object-cover" />
          </div>
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

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<Collection | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/collections')
    const data = await res.json()
    setCollections(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const toggleActive = async (col: Collection) => {
    const res = await fetch('/api/admin/collections', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: col.id, ...col, active: !col.active }),
    })
    if (!res.ok) return toast.error('Failed to update')
    fetchData()
  }

  const toggleFeatured = async (col: Collection) => {
    const res = await fetch('/api/admin/collections', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: col.id, ...col, featured: !col.featured }),
    })
    if (!res.ok) return toast.error('Failed to update')
    fetchData()
  }

  const deleteCollection = async (id: string) => {
    if (!confirm('Delete this collection?')) return
    const res = await fetch('/api/admin/collections', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (!res.ok) toast.error('Failed to delete')
    else {
      toast.success('Collection deleted')
      fetchData()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-charcoal mb-1">Collections</h1>
          <p className="font-body text-sm text-charcoal/50">{collections.length} collections</p>
        </div>
        <button
          onClick={() => { setEditing(null); setDrawerOpen(true) }}
          className="flex items-center gap-2 bg-charcoal text-ivory font-body text-sm font-medium px-4 py-2.5 hover:bg-charcoal/80 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Collection
        </button>
      </div>

      <div className="bg-white border border-warm-gray">
        <AdminTable
          loading={loading}
          data={collections}
          emptyMessage="No collections yet."
          columns={[
            {
              key: 'image',
              label: '',
              className: 'w-14',
              render: (row) =>
                row.image_url ? (
                  <div className="h-10 w-10 relative bg-warm-gray">
                    <Image src={row.image_url} alt={row.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="h-10 w-10 bg-warm-gray" />
                ),
            },
            {
              key: 'name',
              label: 'Name',
              render: (row) => (
                <div>
                  <p className="font-body text-sm font-medium text-charcoal">{row.name}</p>
                  <p className="font-mono text-xs text-charcoal/40">{row.slug}</p>
                </div>
              ),
            },
            {
              key: 'sort_order',
              label: 'Order',
              render: (row) => <span className="text-charcoal/60">{row.sort_order}</span>,
            },
            {
              key: 'featured',
              label: 'Featured',
              render: (row) => (
                <button
                  onClick={() => toggleFeatured(row)}
                  className="font-body text-xs text-charcoal/50 hover:text-gold transition-colors"
                >
                  {row.featured ? '★ Yes' : '☆ No'}
                </button>
              ),
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
                    onClick={() => { setEditing(row); setDrawerOpen(true) }}
                    className="p-1.5 text-charcoal/40 hover:text-charcoal transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteCollection(row.id)}
                    className="p-1.5 text-charcoal/40 hover:text-red-500 transition-colors"
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
        title={editing ? 'Edit Collection' : 'New Collection'}
      >
        <CollectionFormContent
          key={editing?.id ?? 'new'}
          collection={editing}
          onSaved={() => {
            setDrawerOpen(false)
            fetchData()
          }}
        />
      </AdminDrawer>
    </div>
  )
}
