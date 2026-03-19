import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate } from '@/lib/utils'
import { AdminTable } from '@/components/admin/AdminTable'
import { ORDER_STATUSES } from '@/lib/constants'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard | For His Glory',
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: orderCount },
    { data: revenueData },
    { count: pendingBulkCount },
    { count: unreadMessagesCount },
    { data: recentOrders },
    { data: recentBulkInquiries },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'paid'),
    supabase.from('orders').select('total').in('status', ['paid', 'processing', 'fulfilled', 'shipped', 'delivered']),
    supabase.from('bulk_inquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'unread'),
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('bulk_inquiries').select('*').order('created_at', { ascending: false }).limit(5),
  ])

  const totalRevenue = revenueData?.reduce((sum, o) => sum + (o.total ?? 0), 0) ?? 0

  const getStatusStyle = (status: string) => {
    return ORDER_STATUSES.find((s) => s.value === status)?.color ?? 'bg-gray-100 text-gray-600'
  }

  const stats = [
    { label: 'Total Orders', value: orderCount ?? 0, sub: 'Paid orders' },
    { label: 'Revenue', value: formatPrice(totalRevenue), sub: 'All time' },
    { label: 'Bulk Inquiries', value: pendingBulkCount ?? 0, sub: 'Awaiting response' },
    { label: 'Unread Messages', value: unreadMessagesCount ?? 0, sub: 'Contact messages' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-charcoal mb-1">Dashboard</h1>
        <p className="font-body text-sm text-charcoal/50">Welcome back. Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border border-warm-gray p-5">
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-charcoal/40 mb-2">
              {stat.label}
            </p>
            <p className="font-display text-3xl text-charcoal mb-0.5">{stat.value}</p>
            <p className="font-body text-xs text-charcoal/50">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-warm-gray p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl text-charcoal">Recent Orders</h2>
          <a href="/admin/orders" className="font-body text-xs text-gold hover:text-gold-light transition-colors">
            View all →
          </a>
        </div>
        <AdminTable
          columns={[
            {
              key: 'id',
              label: 'Order',
              render: (row) => (
                <span className="font-mono text-xs">#{row.id.slice(-8).toUpperCase()}</span>
              ),
            },
            { key: 'email', label: 'Customer' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body font-medium ${getStatusStyle(row.status)}`}>
                  {row.status}
                </span>
              ),
            },
            {
              key: 'total',
              label: 'Total',
              render: (row) => <span>{formatPrice(row.total ?? 0)}</span>,
            },
            {
              key: 'created_at',
              label: 'Date',
              render: (row) => <span>{formatDate(row.created_at)}</span>,
            },
          ]}
          data={recentOrders ?? []}
          emptyMessage="No orders yet."
        />
      </div>

      {/* Recent Bulk Inquiries */}
      <div className="bg-white border border-warm-gray p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl text-charcoal">Recent Bulk Inquiries</h2>
          <a href="/admin/bulk-inquiries" className="font-body text-xs text-gold hover:text-gold-light transition-colors">
            View all →
          </a>
        </div>
        <AdminTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'organization', label: 'Organization' },
            { key: 'inquiry_type', label: 'Type' },
            {
              key: 'quantity_estimate',
              label: 'Qty',
              render: (row) => <span>{row.quantity_estimate ?? '—'}</span>,
            },
            {
              key: 'status',
              label: 'Status',
              render: (row) => (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body font-medium bg-blue-100 text-blue-800">
                  {row.status}
                </span>
              ),
            },
          ]}
          data={recentBulkInquiries ?? []}
          emptyMessage="No bulk inquiries yet."
        />
      </div>
    </div>
  )
}
