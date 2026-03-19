import Link from 'next/link'
import { Instagram, Music2 } from 'lucide-react'
import { BRAND_NAME, BRAND_TAGLINE, SOCIAL_LINKS } from '@/lib/constants'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-charcoal text-ivory/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="block mb-3">
              <span className="font-display text-2xl text-ivory">{BRAND_NAME}</span>
            </Link>
            <p className="font-body text-sm text-ivory/60 mb-4 leading-relaxed max-w-xs">
              {BRAND_TAGLINE}. Premium Christian apparel designed to inspire faith, purpose, and peace in everyday life.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ivory/50 hover:text-gold transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={SOCIAL_LINKS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ivory/50 hover:text-gold transition-colors"
                aria-label="TikTok"
              >
                <Music2 className="h-5 w-5" />
              </a>
              <a
                href={SOCIAL_LINKS.pinterest}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ivory/50 hover:text-gold transition-colors"
                aria-label="Pinterest"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-body text-xs font-semibold uppercase tracking-widest text-ivory/40 mb-4">Shop</h3>
            <ul className="space-y-2">
              {[
                { href: '/shop', label: 'All Products' },
                { href: '/collections/faith-over-fear', label: 'Faith Over Fear' },
                { href: '/collections/grace-and-truth', label: 'Grace & Truth' },
                { href: '/collections/prayer-changes-things', label: 'Prayer Changes Things' },
                { href: '/collections/kingdom-mindset', label: 'Kingdom Mindset' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-ivory/60 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h3 className="font-body text-xs font-semibold uppercase tracking-widest text-ivory/40 mb-4">Company</h3>
            <ul className="space-y-2 mb-6">
              {[
                { href: '/about', label: 'About Us' },
                { href: '/bulk-orders', label: 'Bulk Orders' },
                { href: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-ivory/60 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="font-body text-xs font-semibold uppercase tracking-widest text-ivory/40 mb-4">Support</h3>
            <ul className="space-y-2">
              {[
                { href: '/account/orders', label: 'Track Order' },
                { href: '/contact', label: 'Returns & Exchanges' },
                { href: '/contact', label: 'Sizing Guide' },
                { href: '/contact', label: 'FAQ' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-ivory/60 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-ivory/10 pt-10 mb-10">
          <div className="max-w-md mx-auto text-center">
            <h3 className="font-display text-xl text-ivory mb-2">Join the Community</h3>
            <p className="font-body text-sm text-ivory/60 mb-4">
              Devotionals, new drops, and faith encouragement — delivered to your inbox.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-2.5 bg-ivory/10 border border-ivory/20 text-ivory placeholder:text-ivory/40 font-body text-sm focus:outline-none focus:border-gold"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-gold text-white font-body font-medium text-sm hover:bg-gold-light transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-ivory/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-xs text-ivory/40">
            © {currentYear} {BRAND_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {[
              { href: '/privacy', label: 'Privacy Policy' },
              { href: '/terms', label: 'Terms of Service' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body text-xs text-ivory/40 hover:text-ivory/70 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
