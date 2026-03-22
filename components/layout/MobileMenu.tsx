'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { X, User, ShoppingBag, LayoutDashboard } from 'lucide-react'
import { NAV_LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  user: { id?: string; email?: string | null } | null
  isAdmin?: boolean
}

export function MobileMenu({ isOpen, onClose, user, isAdmin }: MobileMenuProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-charcoal/50 transition-opacity md:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 bottom-0 z-50 w-[300px] bg-ivory flex flex-col transition-transform duration-300 md:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-warm-gray">
          <span className="font-display text-xl text-charcoal">For His Glory</span>
          <button
            onClick={onClose}
            className="p-1 text-charcoal hover:text-gold transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-6">
          <div className="space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="block py-3 font-body text-base font-medium text-charcoal hover:text-gold transition-colors border-b border-warm-gray/50"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-8 space-y-3">
            <Link
              href="/cart"
              onClick={onClose}
              className="flex items-center gap-2 py-3 font-body text-sm text-charcoal hover:text-gold transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              Cart
            </Link>
            <Link
              href={user ? '/account' : '/sign-in'}
              onClick={onClose}
              className="flex items-center gap-2 py-3 font-body text-sm text-charcoal hover:text-gold transition-colors"
            >
              <User className="h-4 w-4" />
              {user ? 'My Account' : 'Sign In'}
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={onClose}
                className="flex items-center gap-2 py-3 font-body text-sm font-semibold text-gold hover:text-gold/80 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin Dashboard
              </Link>
            )}
          </div>
        </nav>

        <div className="p-6 border-t border-warm-gray">
          <p className="font-body text-xs text-center" style={{ color: '#9B9B9B' }}>
            Deo Gloria — For His Glory, Worn Daily
          </p>
        </div>
      </div>
    </>
  )
}
