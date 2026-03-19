'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    // Simulate newsletter signup
    await new Promise((resolve) => setTimeout(resolve, 800))
    toast.success('You\'re in! Welcome to the For His Glory community.')
    setEmail('')
    setLoading(false)
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-warm-gray">
      <div className="max-w-xl mx-auto text-center">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-gold mb-3">
          Stay Connected
        </p>
        <h2 className="font-display text-3xl sm:text-4xl text-charcoal mb-3">
          Faith in Your Inbox
        </h2>
        <p className="font-body text-sm text-charcoal/60 mb-8 leading-relaxed">
          New drops, devotional content, exclusive discounts, and community stories — delivered to you every week.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-0 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            className="flex-1 px-4 py-3.5 border border-charcoal/20 bg-white font-body text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-gold"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 bg-charcoal text-ivory font-body font-semibold text-sm hover:bg-gold transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? 'Joining...' : 'Join'}
          </button>
        </form>

        <p className="font-body text-xs text-charcoal/40 mt-4">
          We respect your privacy. No spam, ever.
        </p>
      </div>
    </section>
  )
}
