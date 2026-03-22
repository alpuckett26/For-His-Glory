'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import {
  Loader2, Sparkles, Trash2, Type, Eye, Save, RefreshCw, X, ChevronDown
} from 'lucide-react'
import { toast } from 'sonner'
import { slugify } from '@/lib/utils'
import type { DesignCanvasRef } from '@/components/design/DesignCanvas'
import type { Collection } from '@/types'

// Canvas must be client-only — no SSR
const DesignCanvas = dynamic(
  () => import('@/components/design/DesignCanvas').then((m) => m.DesignCanvas),
  { ssr: false, loading: () => <div className="w-full aspect-square max-w-[512px] bg-warm-gray border border-charcoal/20 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-charcoal/30" /></div> }
)

// Collapsible section — always open on desktop, toggleable on mobile
function Section({
  title, open, onToggle, children,
}: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full lg:cursor-default lg:pointer-events-none mb-3"
      >
        <h2 className="font-body text-xs font-semibold uppercase tracking-wider text-charcoal/40">
          {title}
        </h2>
        <ChevronDown
          className={`h-4 w-4 text-charcoal/40 transition-transform lg:hidden ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`${open ? 'block' : 'hidden'} lg:block space-y-3`}>
        {children}
      </div>
    </div>
  )
}

const SHIRT_COLORS = [
  { label: 'Black',    value: 'black',    hex: '#1C1C1E' },
  { label: 'White',    value: 'white',    hex: '#FAF8F4' },
  { label: 'Charcoal', value: 'charcoal', hex: '#3D3D3D' },
  { label: 'Olive',    value: 'olive',    hex: '#6B7A5E' },
  { label: 'Navy',     value: 'navy',     hex: '#1B2A4A' },
]

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']

const FONTS = [
  { label: 'Georgia (Serif)',    value: 'Georgia' },
  { label: 'Arial (Clean)',      value: 'Arial' },
  { label: 'Impact (Bold)',      value: 'Impact' },
  { label: 'Palatino (Elegant)', value: 'Palatino Linotype' },
  { label: 'Courier (Type)',     value: 'Courier New' },
]

export default function AdminDesignPage() {
  const canvasRef = useRef<DesignCanvasRef>(null)

  // Responsive canvas size — computed once on mount
  const [canvasSize] = useState<number>(() =>
    typeof window !== 'undefined' ? Math.min(512, window.innerWidth - 32) : 512
  )

  // Mobile collapsible sections (always open on desktop via CSS)
  const [aiOpen, setAiOpen] = useState(true)
  const [textOpen, setTextOpen] = useState(false)
  const [productOpen, setProductOpen] = useState(false)

  // AI generation
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [refinedPrompt, setRefinedPrompt] = useState<string | null>(null)

  // Text tool
  const [textInput, setTextInput] = useState('')
  const [textFont, setTextFont] = useState('Georgia')
  const [textSize, setTextSize] = useState(36)
  const [textColor, setTextColor] = useState('#FFFFFF')

  // Shirt + mockup
  const [shirtColor, setShirtColor] = useState(SHIRT_COLORS[0])
  const [designUrl, setDesignUrl] = useState<string | null>(null)
  const [mockupUrl, setMockupUrl] = useState<string | null>(null)
  const [loadingMockup, setLoadingMockup] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [mockupCache, setMockupCache] = useState<Record<string, string>>({})

  // Product fields
  const [collections, setCollections] = useState<Collection[]>([])
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('34.99')
  const [collectionId, setCollectionId] = useState('')
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL'])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/collections').then((r) => r.json()).then(setCollections)
  }, [])

  const generate = async () => {
    if (!prompt.trim()) return toast.error('Describe your design first')
    setGenerating(true)
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
      await canvasRef.current?.addImage(data.imageUrl)
      setRefinedPrompt(data.refinedPrompt)
      if (data.scriptureText && !textInput) setTextInput(data.scriptureText)
      if (!title) setTitle(prompt.split(' ').slice(0, 5).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const addText = () => {
    if (!textInput.trim()) return toast.error('Enter text first')
    canvasRef.current?.addText(textInput, textFont, textSize, textColor)
  }

  const exportAndPreview = async () => {
    const dataUrl = canvasRef.current?.getDataUrl()
    if (!dataUrl) return toast.error('Canvas is empty — add a design first')
    setExporting(true)
    try {
      const res = await fetch('/api/design/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl }),
      })
      if (!res.ok) throw new Error('Export failed')
      const { imageUrl } = await res.json()
      setDesignUrl(imageUrl)
      setMockupUrl(null)
      setMockupCache({})
      await fetchMockup(imageUrl, shirtColor.value)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  const fetchMockup = async (dUrl: string, colorValue: string) => {
    const key = `${dUrl}::${colorValue}`
    if (mockupCache[key]) {
      setMockupUrl(mockupCache[key])
      return
    }
    setLoadingMockup(true)
    setMockupUrl(null)
    try {
      const res = await fetch('/api/design/mockup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designUrl: dUrl, color: colorValue }),
      })
      if (res.ok) {
        const { mockupUrl: url } = await res.json()
        setMockupUrl(url)
        setMockupCache((prev) => ({ ...prev, [key]: url }))
      }
    } finally {
      setLoadingMockup(false)
    }
  }

  const saveAsProduct = async () => {
    if (!designUrl) return toast.error('Preview your design on the shirt first')
    if (!title.trim()) return toast.error('Product title is required')
    if (!price || isNaN(parseFloat(price))) return toast.error('Valid price is required')
    if (selectedSizes.length === 0) return toast.error('Select at least one size')

    setSaving(true)
    try {
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

      await fetch('/api/admin/products/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          url: designUrl,
          alt_text: title,
          is_primary: true,
          sort_order: 0,
        }),
      })

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

      toast.success(`"${title}" published to store!`)
      canvasRef.current?.clear()
      setPrompt('')
      setRefinedPrompt(null)
      setTextInput('')
      setDesignUrl(null)
      setMockupUrl(null)
      setTitle('')
      setPrice('34.99')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish')
    } finally {
      setSaving(false)
    }
  }

  const toggleSize = (size: string) =>
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl text-charcoal mb-1">Design Studio</h1>
        <p className="font-body text-sm text-charcoal/50">
          Create shirt designs with AI, then publish directly to your store.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-8 lg:items-start gap-4">

        {/* ── Left sidebar ── */}
        <div className="lg:w-80 lg:shrink-0 space-y-5 bg-warm-gray lg:bg-transparent p-4 lg:p-0 rounded-sm lg:rounded-none">

          <Section title="AI Artwork" open={aiOpen} onToggle={() => setAiOpen((v) => !v)}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="e.g. A bold lion, dramatic lighting, gold and white…"
              className="w-full px-3 py-2.5 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold resize-none"
            />
            <button
              onClick={generate}
              disabled={generating || !prompt.trim()}
              className="w-full flex items-center justify-center gap-2 bg-charcoal text-ivory font-body text-sm font-medium py-2.5 hover:bg-charcoal/80 transition-colors disabled:opacity-50"
            >
              {generating
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
                : <><Sparkles className="h-4 w-4" /> Generate Artwork</>}
            </button>
            {refinedPrompt && (
              <div className="p-2.5 bg-white/60 border-l-2 border-gold">
                <p className="font-body text-xs text-charcoal/50 leading-relaxed line-clamp-3">{refinedPrompt}</p>
              </div>
            )}
          </Section>

          <Section title="Add Text" open={textOpen} onToggle={() => setTextOpen((v) => !v)}>
            <input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="e.g. Philippians 4:13"
              className="w-full px-3 py-2 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-body text-xs text-charcoal/50 mb-1">Font</label>
                <select
                  value={textFont}
                  onChange={(e) => setTextFont(e.target.value)}
                  className="w-full px-2 py-1.5 border border-charcoal/20 font-body text-xs focus:outline-none focus:border-gold"
                >
                  {FONTS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-body text-xs text-charcoal/50 mb-1">Size</label>
                <input
                  type="number"
                  value={textSize}
                  onChange={(e) => setTextSize(Number(e.target.value))}
                  min={12} max={120}
                  className="w-full px-2 py-1.5 border border-charcoal/20 font-body text-xs focus:outline-none focus:border-gold"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="font-body text-xs text-charcoal/50">Color</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="h-8 w-12 border border-charcoal/20 cursor-pointer p-0.5"
              />
              <span className="font-body text-xs text-charcoal/40">{textColor.toUpperCase()}</span>
            </div>
            <button
              onClick={addText}
              disabled={!textInput.trim()}
              className="w-full flex items-center justify-center gap-2 border border-charcoal text-charcoal font-body text-sm py-2 hover:bg-charcoal hover:text-ivory transition-colors disabled:opacity-40"
            >
              <Type className="h-4 w-4" /> Add to Canvas
            </button>
          </Section>

          <Section title="Canvas" open={true} onToggle={() => {}}>
            <div className="flex gap-2">
              <button
                onClick={() => canvasRef.current?.deleteSelected()}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-charcoal/20 font-body text-xs text-charcoal hover:border-red-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Selected
              </button>
              <button
                onClick={() => { canvasRef.current?.clear(); setDesignUrl(null); setMockupUrl(null) }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 border border-charcoal/20 font-body text-xs text-charcoal hover:border-charcoal transition-colors"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            </div>
            <p className="font-body text-xs text-charcoal/30">
              Tap to select, drag to move, Delete key removes selected.
            </p>
          </Section>

          <Section title="Shirt Color" open={true} onToggle={() => {}}>
            <div className="flex gap-2">
              {SHIRT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => { setShirtColor(color); if (designUrl) fetchMockup(designUrl, color.value) }}
                  title={color.label}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${shirtColor.value === color.value ? 'border-gold scale-110' : 'border-charcoal/20'}`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </Section>

          <button
            onClick={exportAndPreview}
            disabled={exporting || loadingMockup}
            className="w-full flex items-center justify-center gap-2 bg-gold text-white font-body text-sm font-medium py-2.5 hover:bg-gold/90 transition-colors disabled:opacity-50"
          >
            {exporting || loadingMockup
              ? <><Loader2 className="h-4 w-4 animate-spin" /> {exporting ? 'Exporting…' : 'Rendering shirt…'}</>
              : <><Eye className="h-4 w-4" /> Preview on Shirt</>}
          </button>
        </div>

        {/* ── Center: Canvas + Mockup ── */}
        <div className="flex flex-col gap-6 flex-1 min-w-0">
          <DesignCanvas ref={canvasRef} size={canvasSize} />

          {(loadingMockup || mockupUrl) && (
            <div className="space-y-3">
              <h2 className="font-body text-xs font-semibold uppercase tracking-wider text-charcoal/40">
                Shirt Preview
              </h2>
              <div className="relative flex items-center justify-center bg-warm-gray p-4 border border-warm-gray">
                {loadingMockup && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-warm-gray z-10">
                    <Loader2 className="h-8 w-8 animate-spin mb-2 text-charcoal/40" />
                    <p className="font-body text-xs text-charcoal/40">Rendering on shirt…</p>
                  </div>
                )}
                {mockupUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mockupUrl} alt="Shirt mockup" className="max-w-sm w-full" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Product Details ── */}
        <div className="lg:w-72 lg:shrink-0 space-y-5 bg-warm-gray lg:bg-transparent p-4 lg:p-0 rounded-sm lg:rounded-none">

          <Section title="Product Details" open={productOpen} onToggle={() => setProductOpen((v) => !v)}>
            <div>
              <label className="block font-body text-xs text-charcoal/60 mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Product title"
                className="w-full px-3 py-2 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-body text-xs text-charcoal/60 mb-1">Price ($)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block font-body text-xs text-charcoal/60 mb-1">Collection</label>
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
              <label className="block font-body text-xs text-charcoal/60 mb-2">Sizes</label>
              <div className="flex flex-wrap gap-1.5">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`px-2.5 py-1 font-body text-xs font-medium border transition-colors ${
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

            <div className="pt-2 space-y-2">
              <button
                onClick={saveAsProduct}
                disabled={saving || !designUrl}
                className="w-full flex items-center justify-center gap-2 bg-charcoal text-ivory font-body text-sm font-medium py-3 hover:bg-charcoal/80 transition-colors disabled:opacity-50"
              >
                {saving
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Publishing…</>
                  : <><Save className="h-4 w-4" /> Publish to Store</>}
              </button>
              <button
                onClick={() => {
                  canvasRef.current?.clear()
                  setDesignUrl(null)
                  setMockupUrl(null)
                  setPrompt('')
                  setRefinedPrompt(null)
                  setTitle('')
                }}
                className="w-full flex items-center justify-center gap-2 border border-charcoal/20 text-charcoal font-body text-xs py-2 hover:border-charcoal transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Start Over
              </button>
            </div>

            {!designUrl && (
              <p className="font-body text-xs text-charcoal/40 pt-1">
                Preview on Shirt before publishing.
              </p>
            )}
          </Section>
        </div>
      </div>
    </div>
  )
}
