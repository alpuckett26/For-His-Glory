import Link from 'next/link'

export function MissionSection() {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — Quote */}
          <div className="relative">
            {/* Gold accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gold hidden lg:block" />

            <div className="lg:pl-10">
              <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-gold mb-6">
                Our Mission
              </p>
              <blockquote className="font-display text-3xl sm:text-4xl xl:text-5xl text-charcoal leading-tight mb-6">
                "Apparel rooted in grace, worn with purpose."
              </blockquote>
              <div className="w-16 h-[1px] bg-gold mb-6" />
              <p className="font-body text-sm text-charcoal/60 uppercase tracking-widest">
                — Deo Gloria
              </p>
            </div>
          </div>

          {/* Right — Story */}
          <div>
            <p className="font-body text-base sm:text-lg text-charcoal/70 leading-relaxed mb-6">
              We started For His Glory because we believed fashion and faith didn't have to be strangers. Too often, Christian apparel looked like a church bulletin — clipart, Comic Sans, and all the wrong messages about what it means to live for something greater.
            </p>
            <p className="font-body text-base sm:text-lg text-charcoal/70 leading-relaxed mb-8">
              We're building something different. Premium pieces. Editorial design. Messages that matter. Clothing you'll actually wear — not because it's "Christian," but because it's excellent, and it happens to carry the weight of something eternal.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-6 py-3 border border-charcoal text-charcoal font-body font-medium text-sm tracking-wide hover:bg-charcoal hover:text-ivory transition-colors"
              >
                Read Our Story
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-6 py-3 bg-gold text-white font-body font-medium text-sm tracking-wide hover:bg-gold-light transition-colors"
              >
                Shop the Collection
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
