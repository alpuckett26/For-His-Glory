'use client'

import { useState } from 'react'
import { Loader2, Sparkles, RefreshCw, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/hooks/useCart'

const SHIRT_COLORS = [
  { label: 'Black', value: 'black', hex: '#1C1C1E' },
  { label: 'White', value: 'white', hex: '#FAF8F4' },
  { label: 'Charcoal', value: 'charcoal', hex: '#3D3D3D' },
  { label: 'Olive', value: 'olive', hex: '#6B7A5E' },
  { label: 'Navy', value: 'navy', hex: '#1B2A4A' },
]

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL']

const EXAMPLE_PROMPTS = [
  'A lion with Philippians 4:13 — bold, minimalist, white on black',
  'Cross with sunrise and "He is Risen" — vintage worn look',
  'Mountain silhouette with Psalm 121:1-2 — clean modern typography',
  'Armor of God illustration — detailed, dark shirt',
]

export default function DesignPage() {
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [refinedPrompt, setRefinedPrompt] = useState<string | null>(null)
  const [shirtColor, setShirtColor] = useState(SHIRT_COLORS[0])
  const [selectedSize, setSelectedSize] = useState('M')
  const { addToCart: addItem } = useCart()

  const generate = async (usePrompt?: string) => {
    const text = usePrompt ?? prompt
    if (!text.trim()) return toast.error('Describe your design first')

    setGenerating(true)
    setImageUrl(null)
    setRefinedPrompt(null)

    try {
      const res = await fetch('/api/design/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Generation failed')
      }

      const data = await res.json()
      setImageUrl(data.imageUrl)
      setRefinedPrompt(data.refinedPrompt)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setGenerating(false)
    }
  }

  const addToCart = () => {
    if (!imageUrl) return
    addItem({
      productId: 'custom-design',
      variantId: `custom-${shirtColor.value}-${selectedSize}-${Date.now()}`,
      title: 'Custom AI Design',
      price: 34.99,
      size: selectedSize,
      color: shirtColor.label,
      quantity: 1,
      imageUrl,
      slug: 'custom-design',
    })
    toast.success('Added to cart!')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-gold mb-3">
          AI Design Studio
        </p>
        <h1 className="font-display text-4xl sm:text-5xl text-charcoal mb-3">
          Design Your Own Shirt
        </h1>
        <p className="font-body text-sm text-charcoal/60 max-w-xl mx-auto">
          Describe your vision — a verse, a symbol, a message. Our AI will bring it to life.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left — input */}
        <div className="space-y-6">
          {/* Prompt input */}
          <div>
            <label className="block font-body text-sm font-medium text-charcoal mb-2">
              Describe your design
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="e.g. A bold lion with Philippians 4:13, dark shirt, gold and white..."
              className="w-full px-4 py-3 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold resize-none"
            />
          </div>

          {/* Example prompts */}
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-charcoal/40 mb-2">
              Try an example
            </p>
            <div className="space-y-2">
              {EXAMPLE_PROMPTS.map((example) => (
                <button
                  key={example}
                  onClick={() => { setPrompt(example); generate(example) }}
                  className="w-full text-left px-3 py-2 border border-charcoal/10 font-body text-xs text-charcoal/60 hover:border-gold hover:text-charcoal transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={() => generate()}
            disabled={generating || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 bg-charcoal text-ivory font-body text-sm font-medium py-3.5 hover:bg-charcoal/80 transition-colors disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating your design…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Design
              </>
            )}
          </button>

          {/* Refined prompt */}
          {refinedPrompt && (
            <div className="p-3 bg-warm-gray border-l-2 border-gold">
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-charcoal/40 mb-1">
                AI refined your prompt
              </p>
              <p className="font-body text-xs text-charcoal/60 leading-relaxed">
                {refinedPrompt}
              </p>
            </div>
          )}
        </div>

        {/* Right — preview */}
        <div className="space-y-6">
          {/* Shirt mockup */}
          <div
            className="relative aspect-square flex items-center justify-center"
            style={{ backgroundColor: shirtColor.hex }}
          >
            {generating ? (
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" style={{ color: shirtColor.value === 'white' ? '#1C1C1E' : '#FAF8F4' }} />
                <p className="font-body text-xs" style={{ color: shirtColor.value === 'white' ? '#1C1C1E80' : '#FAF8F480' }}>
                  Creating your design…
                </p>
              </div>
            ) : imageUrl ? (
              <div className="relative w-3/4 h-3/4 flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt="Generated shirt design"
                  className="w-full h-full object-contain mix-blend-multiply"
                /></div>
            ) : (
              <div className="text-center px-8">
                <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-20" style={{ color: shirtColor.value === 'white' ? '#1C1C1E' : '#FAF8F4' }} />
                <p className="font-body text-xs opacity-30" style={{ color: shirtColor.value === 'white' ? '#1C1C1E' : '#FAF8F4' }}>
                  Your design will appear here
                </p>
              </div>
            )}
          </div>

          {/* Shirt color picker */}
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

          {/* Size picker */}
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-charcoal/40 mb-2">
              Size
            </p>
            <div className="flex gap-2 flex-wrap">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1.5 font-body text-xs font-medium border transition-colors ${
                    selectedSize === size
                      ? 'bg-charcoal text-ivory border-charcoal'
                      : 'border-charcoal/20 text-charcoal hover:border-charcoal'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          {imageUrl && (
            <div className="flex gap-3">
              <button
                onClick={() => generate()}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-3 border border-charcoal/20 font-body text-sm text-charcoal hover:border-charcoal transition-colors disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </button>
              <button
                onClick={addToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-gold text-white font-body text-sm font-medium py-3 hover:bg-gold/90 transition-colors"
              >
                <ShoppingBag className="h-4 w-4" />
                Add to Cart — $34.99
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
