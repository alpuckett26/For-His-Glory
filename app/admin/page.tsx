import { sql } from '@/lib/db'
import { StatCard } from '@/components/admin/StatCard'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { formatPrice, formatDate } from '@/lib/utils'
import { ShoppingBag, DollarSign, Users, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Admin',
}

export default async function AdminDashboardPage() {
  const [
    orderCountRows,
    revenueRows,
    bulkCountRows,
    messageCountRows,
    recentOrders,
    recentBulkInquiries,
  ] = await Promise.all([
    sql`SELECT COUNT(*)::int AS count FROM orders WHERE status != 'cancelled'`,
    sql`SELECT COALESCE(SUM(total), 0) AS total FROM orders WHERE status IN ('paid','processing','fulfilled','shipped','delivered')`,
    sql`SELECT COUNT(*)::int AS count FROM bulk_inquiries WHERE status = 'new'`,
    sql`SELECT COUNT(*)::int AS count FROM contact_messages WHERE status = 'unread'`,
    sql`SELECT id, email, total, status, created_at FROM orders ORDER BY created_at DESC LIMIT 6`,
    sql`SELECT id, name, organization, inquiry_type, quantity_estimate, status, created_at FROM bulk_inquiries ORDER BY created_at DESC LIMIT 6`,
  ])

  const orderCount = orderCountRows[0]?.count ?? 0
  const totalRevenue = Number(revenueRows[0]?.total ?? 0)
  const pendingBulkCount = bulkCountRows[0]?.count ?? 0
  const unreadMessagesCount = messageCountRows[0]?.count ?? 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-charcoal mb-1">Dashboard</h1>
        <p className="font-body text-sm text-charcoal/50">
          Welcome back. Here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Total Orders"
          value={orderCount ?? 0}
          sub="All active orders"
          icon={ShoppingBag}
        />
        <StatCard
          label="Revenue"
          value={formatPrice(totalRevenue)}
          sub="All time"
          icon={DollarSign}
        />
        <StatCard
          label="Bulk Inquiries"
          value={pendingBulkCount ?? 0}
          sub="Awaiting response"
          icon={Users}
        />
        <StatCard
          label="Unread Messages"
          value={unreadMessagesCount ?? 0}
          sub="Contact messages"
          icon={MessageSquare}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white border border-warm-gray">
          <div className="flex items-center justify-between px-6 py-4 border-b border-warm-gray">
            <h2 className="font-display text-xl text-charcoal">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="font-body text-xs text-gold hover:text-gold-light transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-warm-gray">
                  {['Order', 'Customer', 'Total', 'Status', 'Date'].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-4 font-body text-xs font-semibold uppercase tracking-wider text-charcoal/50"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center font-body text-sm text-charcoal/40"
                    >
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-warm-gray last:border-0 hover:bg-ivory/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-xs text-charcoal">
                        #{order.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="py-3 px-4 font-body text-sm text-charcoal truncate max-w-[140px]">
                        {order.email ?? '—'}
                      </td>
                      <td className="py-3 px-4 font-body text-sm text-charcoal">
                        {formatPrice(order.total ?? 0)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-4 font-body text-xs text-charcoal/50">
                        {formatDate(order.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Bulk Inquiries */}
        <div className="bg-white border border-warm-gray">
          <div className="flex items-center justify-between px-6 py-4 border-b border-warm-gray">
            <h2 className="font-display text-xl text-charcoal">Bulk Inquiries</h2>
            <Link
              href="/admin/bulk-inquiries"
              className="font-body text-xs text-gold hover:text-gold-light transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-warm-gray">
                  {['Name', 'Organization', 'Type', 'Qty', 'Status'].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-4 font-body text-xs font-semibold uppercase tracking-wider text-charcoal/50"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentBulkInquiries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center font-body text-sm text-charcoal/40"
                    >
                      No bulk inquiries yet.
                    </td>
                  </tr>
                ) : (
                  recentBulkInquiries.map((inq) => (
                    <tr
                      key={inq.id}
                      className="border-b border-warm-gray last:border-0 hover:bg-ivory/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-body text-sm text-charcoal">{inq.name}</td>
                      <td className="py-3 px-4 font-body text-sm text-charcoal/70 truncate max-w-[120px]">
                        {inq.organization ?? '—'}
                      </td>
                      <td className="py-3 px-4 font-body text-sm text-charcoal/70 capitalize">
                        {inq.inquiry_type?.replace('_', ' ') ?? '—'}
                      </td>
                      <td className="py-3 px-4 font-body text-sm text-charcoal/70">
                        {inq.quantity_estimate ?? '—'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={inq.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
