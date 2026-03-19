import Link from 'next/link'

export function BulkOrdersCTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-charcoal">
      <div className="max-w-4xl mx-auto text-center">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-gold mb-4">
          Churches · Ministries · Events
        </p>
        <h2 className="font-display text-3xl sm:text-5xl text-ivory mb-4 leading-tight">
          Outfitting Your Ministry?
        </h2>
        <p className="font-body text-base text-ivory/60 mb-8 max-w-lg mx-auto leading-relaxed">
          Custom bulk orders for churches, youth groups, conferences, and faith-based events. Volume pricing, custom artwork, fast turnaround.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/bulk-orders"
            className="inline-flex items-center justify-center px-8 py-4 bg-gold text-white font-body font-semibold text-sm tracking-wide hover:bg-gold-light transition-colors"
          >
            Get a Quote
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 border border-ivory/30 text-ivory font-body font-semibold text-sm tracking-wide hover:border-gold hover:text-gold transition-colors"
          >
            Contact Us
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 pt-12 border-t border-ivory/10">
          {[
            { value: '500+', label: 'Ministries Served' },
            { value: '10K+', label: 'Garments Delivered' },
            { value: '48hr', label: 'Quote Response Time' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-3xl sm:text-4xl text-gold mb-1">{stat.value}</p>
              <p className="font-body text-xs text-ivory/50 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
