import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-ivory">
      {/* Decorative SVG — olive branch line art */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          className="absolute top-[10%] right-[5%] w-64 h-64 text-gold/10 opacity-60"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M100 180 C100 120, 60 80, 30 40"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M100 180 C100 120, 140 80, 170 40"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <ellipse cx="55" cy="95" rx="20" ry="12" stroke="currentColor" strokeWidth="1" fill="none" transform="rotate(-30 55 95)" />
          <ellipse cx="75" cy="65" rx="18" ry="10" stroke="currentColor" strokeWidth="1" fill="none" transform="rotate(-15 75 65)" />
          <ellipse cx="145" cy="95" rx="20" ry="12" stroke="currentColor" strokeWidth="1" fill="none" transform="rotate(30 145 95)" />
          <ellipse cx="125" cy="65" rx="18" ry="10" stroke="currentColor" strokeWidth="1" fill="none" transform="rotate(15 125 65)" />
          <ellipse cx="100" cy="50" rx="16" ry="9" stroke="currentColor" strokeWidth="1" fill="none" />
          <ellipse cx="35" cy="48" rx="14" ry="8" stroke="currentColor" strokeWidth="1" fill="none" transform="rotate(-45 35 48)" />
          <ellipse cx="165" cy="48" rx="14" ry="8" stroke="currentColor" strokeWidth="1" fill="none" transform="rotate(45 165 48)" />
        </svg>

        <svg
          className="absolute bottom-[15%] left-[5%] w-48 h-48 text-olive/10 opacity-40"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M100 20 L100 180"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M100 80 L140 50"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <path
            d="M100 80 L60 50"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-gold mb-6">
            Deo Gloria
          </p>

          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-charcoal leading-[1.05] mb-6">
            For His Glory
          </h1>

          <p className="font-body text-base sm:text-lg text-charcoal/70 mb-10 max-w-xl mx-auto leading-relaxed">
            Premium Christian apparel designed to inspire faith, purpose, and peace in everyday life. Worn daily — as a declaration, a reminder, a witness.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-4 bg-gold text-white font-body font-semibold text-sm tracking-wide hover:bg-gold-light transition-colors min-w-[160px]"
            >
              Shop Now
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-8 py-4 border border-charcoal text-charcoal font-body font-semibold text-sm tracking-wide hover:bg-charcoal hover:text-ivory transition-colors min-w-[160px]"
            >
              Our Mission
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-[1px] h-12 bg-charcoal/20 mx-auto" />
        </div>
      </div>
    </section>
  )
}
