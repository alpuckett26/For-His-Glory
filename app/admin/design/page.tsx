'use client'

import { useState, useEffect } from 'react'
import { Loader2, Sparkles, RefreshCw, Save } from 'lucide-react'
import { ShirtMockup } from '@/components/design/ShirtMockup'
import { toast } from 'sonner'
import { slugify } from '@/lib/utils'
import type { Collection } from '@/types'

const SHIRT_COLORS = [
  { label: 'Black', value: 'black', hex: '#1C1C1E' },
  { label: 'White', value: 'white', hex: '#FAF8F4' },
  { label: 'Charcoal', value: 'charcoal', hex: '#3D3D3D' },
  { label: 'Olive', value: 'olive', hex: '#6B7A5E' },
  { label: 'Navy', value: 'navy', hex: '#1B2A4A' },
]

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']

export default function AdminDesignPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [refinedPrompt, setRefinedPrompt] = useState<string | null>(null)
  const [shirtColor, setShirtColor] = useState(SHIRT_COLORS[0])
  const [saving, setSaving] = useState(false)

  // Product fields
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('34.99')
  const [collectionId, setCollectionId] = useState('')
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL'])

  useEffect(() => {
    fetch('/api/admin/collections').then((r) => r.json()).then(setCollections)
  }, [])

  const generate = async () => {
    if (!prompt.trim()) return toast.error('Describe your design first')
    setGenerating(true)
    setImageUrl(null)
    setRefinedPrompt(null)

    try {
      const res = await fetch('/api/design/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Generation failed')
      }
      const data = await res.json()
      setImageUrl(data.imageUrl)
      setRefinedPrompt(data.refinedPrompt)
      if (!title) setTitle(prompt.split(' ').slice(0, 4).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setGenerating(false)
    }
  }

  const saveAsProduct = async () => {
    if (!imageUrl) return toast.error('Generate a design first')
    if (!title.trim()) return toast.error('Product title is required')
    if (!price || isNaN(parseFloat(price))) return toast.error('Valid price is required')
    if (selectedSizes.length === 0) return toast.error('Select at least one size')

    setSaving(true)
    try {
      // Create the product
      const prodRes = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug: slugify(title),
          description: refinedPrompt ?? prompt,
          price: parseFloat(price),
          collection_id: collectionId || null,
          featured: false,
          active: true,
          tags: ['ai-design', 'custom'],
        }),
      })
      if (!prodRes.ok) throw new Error('Failed to create product')
      const product = await prodRes.json()

      // Add the generated image
      await fetch('/api/admin/products/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          url: imageUrl,
          alt_text: title,
          is_primary: true,
          sort_order: 0,
        }),
      })

      // Add variants for each color + size combo
      for (const size of selectedSizes) {
        await fetch('/api/admin/products/variants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: product.id,
            size,
            color: shirtColor.label,
            price: parseFloat(price),
            inventory_count: 999,
            active: true,
          }),
        })
      }

      toast.success(`"${title}" saved as a product!`)
      // Reset form
      setPrompt('')
      setImageUrl(null)
      setRefinedPrompt(null)
      setTitle('')
      setPrice('34.99')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl text-charcoal mb-1">AI Design Studio</h1>
        <p className="font-body text-sm text-charcoal/50">
          Generate shirt designs with AI and publish directly to your store.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left — generate */}
        <div className="space-y-5">
          <div>
            <label className="block font-body text-sm font-medium text-charcoal mb-2">
              Describe the design
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="e.g. A bold cross with Isaiah 40:31 — eagle wings, dark shirt, gold and white..."
              className="w-full px-4 py-3 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold resize-none"
            />
          </div>

          <button
            onClick={generate}
            disabled={generating || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 bg-charcoal text-ivory font-body text-sm font-medium py-3 hover:bg-charcoal/80 transition-colors disabled:opacity-50"
          >
            {generating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Generate Design</>
            )}
          </button>

          {refinedPrompt && (
            <div className="p-3 bg-warm-gray border-l-2 border-gold">
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-charcoal/40 mb-1">
                Claude's prompt
              </p>
              <p className="font-body text-xs text-charcoal/60 leading-relaxed">{refinedPrompt}</p>
            </div>
          )}

          {/* Product details — shown after generation */}
          {imageUrl && (
            <div className="space-y-4 pt-2 border-t border-warm-gray">
              <p className="font-body text-sm font-semibold text-charcoal">Product Details</p>

              <div>
                <label className="block font-body text-xs font-medium text-charcoal/60 mb-1">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
                  placeholder="Product title"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-body text-xs font-medium text-charcoal/60 mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block font-body text-xs font-medium text-charcoal/60 mb-1">Collection</label>
                  <select
                    value={collectionId}
                    onChange={(e) => setCollectionId(e.target.value)}
                    className="w-full px-3 py-2 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
                  >
                    <option value="">None</option>
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-body text-xs font-medium text-charcoal/60 mb-2">Sizes</label>
                <div className="flex gap-2 flex-wrap">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-1.5 font-body text-xs font-medium border transition-colors ${
                        selectedSizes.includes(size)
                          ? 'bg-charcoal text-ivory border-charcoal'
                          : 'border-charcoal/20 text-charcoal hover:border-charcoal'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={generate}
                  disabled={generating}
                  className="flex items-center gap-2 px-4 py-2.5 border border-charcoal/20 font-body text-sm text-charcoal hover:border-charcoal transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </button>
                <button
                  onClick={saveAsProduct}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-gold text-white font-body text-sm font-medium py-2.5 hover:bg-gold/90 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                  ) : (
                    <><Save className="h-4 w-4" /> Save as Product</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right — preview */}
        <div className="space-y-4">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-charcoal/40 mb-2">
              Shirt Color
            </p>
            <div className="flex gap-2">
              {SHIRT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setShirtColor(color)}
                  title={color.label}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${shirtColor.value === color.value ? 'border-gold scale-110' : 'border-charcoal/20'}`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center bg-warm-gray p-4 border border-warm-gray">
            {generating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-warm-gray z-10">
                <Loader2 className="h-8 w-8 animate-spin mb-3 text-charcoal/40" />
                <p className="font-body text-xs text-charcoal/40">Generating…</p>
              </div>
            )}
            <ShirtMockup
              color={shirtColor.hex}
              designUrl={imageUrl}
              size={360}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
