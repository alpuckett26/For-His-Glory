import { createClient } from '@/lib/supabase/server'
import { AdminTable } from '@/components/admin/AdminTable'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/constants'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Orders | Admin',
}

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, items:order_items(*), supplier_orders(*)')
    .order('created_at', { ascending: false })

  const getStatusStyle = (status: string) => {
    return ORDER_STATUSES.find((s) => s.value === status)?.color ?? 'bg-gray-100 text-gray-600'
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-charcoal mb-1">Orders</h1>
        <p className="font-body text-sm text-charcoal/50">{orders?.length ?? 0} total orders</p>
      </div>

      <div className="bg-white border border-warm-gray">
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
              key: 'items',
              label: 'Items',
              render: (row) => <span>{row.items?.length ?? 0} items</span>,
            },
            {
              key: 'total',
              label: 'Total',
              render: (row) => <span>{formatPrice(row.total ?? 0)}</span>,
            },
            {
              key: 'status',
              label: 'Status',
              render: (row) => (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body font-medium ${getStatusStyle(row.status)}`}
                >
                  {row.status}
                </span>
              ),
            },
            {
              key: 'supplier_orders',
              label: 'Fulfillment',
              render: (row) => {
                const so = row.supplier_orders?.[0]
                if (!so) return <span className="text-charcoal/40 text-xs">Not submitted</span>
                return (
                  <div>
                    <span className="text-xs font-body text-charcoal">{so.supplier}: {so.status}</span>
                    {so.tracking_number && (
                      <p className="text-xs text-charcoal/50 mt-0.5">
                        {so.tracking_number}
                      </p>
                    )}
                  </div>
                )
              },
            },
            {
              key: 'created_at',
              label: 'Date',
              render: (row) => <span>{formatDate(row.created_at)}</span>,
            },
          ]}
          data={orders ?? []}
          emptyMessage="No orders yet."
        />
      </div>
    </div>
  )
}
