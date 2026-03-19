'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  FolderOpen,
  Package,
  Users,
  MessageSquare,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: ShoppingBag },
  { href: '/admin/collections', label: 'Collections', icon: FolderOpen },
  { href: '/admin/orders', label: 'Orders', icon: Package },
  { href: '/admin/bulk-inquiries', label: 'Bulk Inquiries', icon: Users },
  { href: '/admin/contact-messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside className="w-60 bg-charcoal flex flex-col min-h-screen shrink-0">
      {/* Brand */}
      <div className="p-6 border-b border-ivory/10">
        <Link href="/" className="block">
          <span className="font-display text-lg text-ivory">For His Glory</span>
        </Link>
        <p className="font-body text-xs text-ivory/40 mt-0.5">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 font-body text-sm transition-colors rounded-sm',
                    isActive
                      ? 'bg-gold/15 text-gold border-l-2 border-gold pl-[10px]'
                      : 'text-ivory/60 hover:text-ivory hover:bg-ivory/5'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-ivory/10">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full font-body text-sm text-ivory/60 hover:text-ivory transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
