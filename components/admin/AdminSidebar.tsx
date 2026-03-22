'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingBag,
  Users,
  MessageSquare,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'

interface BadgeCounts {
  messages: number
  bulkInquiries: number
}

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

interface AdminSidebarProps {
  badgeCounts?: BadgeCounts
}

export function AdminSidebar({ badgeCounts }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const navItems: NavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/collections', label: 'Collections', icon: FolderOpen },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    {
      href: '/admin/bulk-inquiries',
      label: 'Bulk Inquiries',
      icon: Users,
      badge: badgeCounts?.bulkInquiries,
    },
    {
      href: '/admin/contact-messages',
      label: 'Messages',
      icon: MessageSquare,
      badge: badgeCounts?.messages,
    },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <aside className="w-60 bg-charcoal flex flex-col min-h-screen shrink-0 sticky top-0">
      {/* Brand */}
      <div className="p-6 border-b border-ivory/10">
        <Link href="/" className="block">
          <span className="font-display text-lg text-ivory">For His Glory</span>
        </Link>
        <p className="font-body text-xs text-ivory/40 mt-0.5">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-0.5">
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
                  <span className="flex-1">{item.label}</span>
                  {!!item.badge && item.badge > 0 && (
                    <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-gold text-white text-[10px] font-bold font-body px-1">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
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
          className="flex items-center gap-3 px-3 py-2.5 w-full font-body text-sm text-ivory/60 hover:text-ivory transition-colors rounded-sm hover:bg-ivory/5"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
