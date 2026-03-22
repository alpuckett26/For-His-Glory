import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { sql } from '@/lib/db'
import { formatDate, formatPrice } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/constants'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Account',
}

export default async function AccountPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/sign-in?redirect=/account')
  }

  const userId = session.user.id

  const [profileRows, orders] = await Promise.all([
    sql`SELECT * FROM users WHERE id = ${userId} LIMIT 1`,
    sql`
      SELECT o.*, json_agg(oi.* ORDER BY oi.created_at) FILTER (WHERE oi.id IS NOT NULL) AS items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.user_id = ${userId}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `,
  ])

  const profile = profileRows[0] ?? null

  const getStatusStyle = (status: string) => {
    return ORDER_STATUSES.find((s) => s.value === status)?.color ?? 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="font-display text-4xl text-charcoal mb-1">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="font-body text-sm text-charcoal/50">{session.user.email}</p>
        </div>
        <Link
          href="/account/orders"
          className="font-body text-sm text-gold hover:text-gold-light transition-colors underline underline-offset-2"
        >
          View All Orders →
        </Link>
      </div>

      {/* Profile card */}
      <div className="bg-warm-gray p-6 mb-8">
        <h2 className="font-body text-xs font-semibold uppercase tracking-widest text-charcoal/50 mb-4">
          Account Details
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-body text-xs text-charcoal/50 mb-0.5">Name</p>
            <p className="font-body text-sm text-charcoal">{profile?.full_name ?? '—'}</p>
          </div>
          <div>
            <p className="font-body text-xs text-charcoal/50 mb-0.5">Email</p>
            <p className="font-body text-sm text-charcoal">{session.user.email}</p>
          </div>
          <div>
            <p className="font-body text-xs text-charcoal/50 mb-0.5">Phone</p>
            <p className="font-body text-sm text-charcoal">{profile?.phone ?? '—'}</p>
          </div>
          <div>
            <p className="font-body text-xs text-charcoal/50 mb-0.5">Member Since</p>
            <p className="font-body text-sm text-charcoal">
              {profile?.created_at ? formatDate(profile.created_at) : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="font-display text-2xl text-charcoal mb-6">Recent Orders</h2>

        {!orders || orders.length === 0 ? (
          <div className="text-center py-12 border border-warm-gray">
            <p className="font-body text-sm text-charcoal/50 mb-4">No orders yet</p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-6 py-3 bg-gold text-white font-body font-medium text-sm hover:bg-gold-light transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-warm-gray p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-body text-xs text-charcoal/50 mb-0.5">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="font-body text-xs text-charcoal/40">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-body ${getStatusStyle(order.status)}`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className="font-body text-sm font-semibold text-charcoal">
                      {formatPrice(order.total ?? 0)}
                    </span>
                  </div>
                </div>
                <p className="font-body text-xs text-charcoal/50">
                  {order.items?.length ?? 0} {(order.items?.length ?? 0) === 1 ? 'item' : 'items'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
