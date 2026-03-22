'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, User, Menu, LayoutDashboard } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { NAV_LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { MobileMenu } from './MobileMenu'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { itemCount } = useCart()
  const { user, isAdmin } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-ivory/95 backdrop-blur-sm shadow-soft'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <span className="font-display text-xl md:text-2xl text-charcoal tracking-wide">
                For His Glory
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-body text-sm font-medium text-charcoal hover:text-gold transition-colors tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 font-body text-xs font-semibold uppercase tracking-wider text-gold border border-gold/40 hover:bg-gold hover:text-white transition-colors"
                  aria-label="Admin"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Admin
                </Link>
              )}
              <Link
                href={user ? '/account' : '/sign-in'}
                className="p-2 text-charcoal hover:text-gold transition-colors"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </Link>

              <Link
                href="/cart"
                className="relative p-2 text-charcoal hover:text-gold transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-gold text-white text-[10px] font-bold flex items-center justify-center font-body">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>

              <button
                className="md:hidden p-2 text-charcoal hover:text-gold transition-colors"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
        isAdmin={isAdmin}
      />
    </>
  )
}
