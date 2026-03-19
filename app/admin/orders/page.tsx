'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Eye, RefreshCw, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AdminTable } from '@/components/admin/AdminTable'
import { AdminDrawer } from '@/components/admin/AdminDrawer'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/constants'
import type { Order, OrderItem, SupplierOrder, ShippingAddress } from '@/types'

type OrderWithRelations = Order & {
  items?: OrderItem[]
  supplier_orders?: SupplierOrder[]
}

export default function AdminOrdersPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<OrderWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(null)
  const [retrying, setRetrying] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*, items:order_items(*), supplier_orders(*)')
      .order('created_at', { ascending: false })
    setOrders(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const viewOrder = (order: OrderWithRelations) => {
    setSelectedOrder(order)
    setDrawerOpen(true)
  }

  const retryFulfillment = async (orderId: string) => {
    setRetrying(orderId)
    try {
      const { retryFulfillment } = await import('@/app/actions/fulfillment')
      const result = await retryFulfillment(orderId)
      if (result.success) {
        toast.success('Fulfillment submitted successfully')
        fetchData()
      } else {
        toast.error(result.error ?? 'Retry failed')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Retry failed')
    } finally {
      setRetrying(null)
    }
  }

  // Client-side filtering
  const filtered = orders.filter((o) => {
    if (search && !o.email?.toLowerCase().includes(search.toLowerCase())) return false
    if (filterStatus && o.status !== filterStatus) return false
    if (dateFrom && o.created_at < dateFrom) return false
    if (dateTo && o.created_at > dateTo + 'T23:59:59') return false
    return true
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl text-charcoal mb-1">Orders</h1>
        <p className="font-body text-sm text-charcoal/50">{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email…"
          className="px-3 py-2 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold w-56"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="px-3 py-2 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="px-3 py-2 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
        />
      </div>

      <div className="bg-white border border-warm-gray">
        <AdminTable
          loading={loading}
          data={filtered}
          emptyMessage="No orders found."
          columns={[
            {
              key: 'id',
              label: 'Order',
              render: (row) => (
                <span className="font-mono text-xs text-charcoal">
                  #{row.id.slice(-8).toUpperCase()}
                </span>
              ),
            },
            {
              key: 'email',
              label: 'Customer',
              render: (row) => (
                <span className="truncate block max-w-[160px] text-sm">{row.email ?? '—'}</span>
              ),
            },
            {
              key: 'items',
              label: 'Items',
              render: (row) => <span>{row.items?.length ?? 0}</span>,
            },
            {
              key: 'total',
              label: 'Total',
              render: (row) => <span>{formatPrice(row.total ?? 0)}</span>,
            },
            {
              key: 'status',
              label: 'Payment',
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: 'fulfillment',
              label: 'Fulfillment',
              render: (row) => {
                const so = row.supplier_orders?.[0]
                if (!so) return <span className="text-xs text-charcoal/40">Not submitted</span>
                return (
                  <div className="space-y-0.5">
                    <StatusBadge status={so.status} />
                    {so.tracking_number && (
                      <p className="text-xs text-charcoal/50">{so.tracking_number}</p>
                    )}
                  </div>
                )
              },
            },
            {
              key: 'created_at',
              label: 'Date',
              render: (row) => (
                <span className="text-xs text-charcoal/50">{formatDate(row.created_at)}</span>
              ),
            },
            {
              key: 'actions',
              label: '',
              render: (row) => (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => viewOrder(row)}
                    className="p-1.5 text-charcoal/40 hover:text-charcoal transition-colors"
                    title="View"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  {row.supplier_orders?.[0]?.status === 'failed' && (
                    <button
                      onClick={() => retryFulfillment(row.id)}
                      disabled={retrying === row.id}
                      className="p-1.5 text-charcoal/40 hover:text-gold transition-colors disabled:opacity-40"
                      title="Retry fulfillment"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${retrying === row.id ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Order detail drawer */}
      <AdminDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={`Order #${selectedOrder?.id.slice(-8).toUpperCase() ?? ''}`}
        width="max-w-2xl"
      >
        {selectedOrder && <OrderDetail order={selectedOrder} onRetry={retryFulfillment} retrying={retrying} />}
      </AdminDrawer>
    </div>
  )
}

// ─── Order Detail ──────────────────────────────────────────────────────────────

function OrderDetail({
  order,
  onRetry,
  retrying,
}: {
  order: OrderWithRelations
  onRetry: (id: string) => void
  retrying: string | null
}) {
  const addr = order.shipping_address as ShippingAddress | null
  const so = order.supplier_orders?.[0]

  return (
    <div className="space-y-6 font-body text-sm text-charcoal">
      {/* Customer */}
      <section>
        <h3 className="font-display text-base text-charcoal mb-3 pb-2 border-b border-warm-gray">
          Customer
        </h3>
        <div className="space-y-1.5 text-charcoal/80">
          <p><span className="font-medium text-charcoal">Email:</span> {order.email ?? '—'}</p>
          {addr && (
            <>
              <p><span className="font-medium text-charcoal">Name:</span> {addr.name}</p>
              <p>
                <span className="font-medium text-charcoal">Address:</span>{' '}
                {addr.address1}
                {addr.address2 ? `, ${addr.address2}` : ''},{' '}
                {addr.city}, {addr.state} {addr.zip}, {addr.country}
              </p>
            </>
          )}
        </div>
      </section>

      {/* Line items */}
      <section>
        <h3 className="font-display text-base text-charcoal mb-3 pb-2 border-b border-warm-gray">
          Items
        </h3>
        {order.items && order.items.length > 0 ? (
          <div className="space-y-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 border-b border-warm-gray last:border-0"
              >
                <div>
                  <p className="font-medium text-charcoal">{item.title ?? '—'}</p>
                  <p className="text-xs text-charcoal/50">
                    {[item.color, item.size].filter(Boolean).join(' / ')} × {item.quantity}
                  </p>
                </div>
                <span>{formatPrice(item.unit_price * item.quantity)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-charcoal/40">No items.</p>
        )}

        <div className="mt-3 space-y-1 text-right text-sm">
          <p className="text-charcoal/60">Subtotal: {formatPrice(order.subtotal ?? 0)}</p>
          <p className="text-charcoal/60">Shipping: {formatPrice(order.shipping ?? 0)}</p>
          <p className="text-charcoal/60">Tax: {formatPrice(order.tax ?? 0)}</p>
          <p className="font-semibold text-charcoal">Total: {formatPrice(order.total ?? 0)}</p>
        </div>
      </section>

      {/* Payment */}
      <section>
        <h3 className="font-display text-base text-charcoal mb-3 pb-2 border-b border-warm-gray">
          Payment
        </h3>
        <div className="space-y-1.5 text-charcoal/80">
          <div className="flex items-center gap-2">
            <span className="font-medium text-charcoal">Status:</span>
            <StatusBadge status={order.status} />
          </div>
          {order.stripe_payment_intent_id && (
            <p className="flex items-center gap-2">
              <span className="font-medium text-charcoal">Stripe PI:</span>
              <a
                href={`https://dashboard.stripe.com/payments/${order.stripe_payment_intent_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-gold hover:text-gold-light flex items-center gap-1"
              >
                {order.stripe_payment_intent_id}
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          )}
        </div>
      </section>

      {/* Supplier */}
      <section>
        <h3 className="font-display text-base text-charcoal mb-3 pb-2 border-b border-warm-gray">
          Fulfillment
        </h3>
        {so ? (
          <div className="space-y-2 text-charcoal/80">
            <p><span className="font-medium text-charcoal">Supplier:</span> {so.supplier}</p>
            <p><span className="font-medium text-charcoal">Supplier Order ID:</span> {so.supplier_order_id ?? '—'}</p>
            <div className="flex items-center gap-2">
              <span className="font-medium text-charcoal">Status:</span>
              <StatusBadge status={so.status} />
            </div>
            {so.tracking_number && (
              <p>
                <span className="font-medium text-charcoal">Tracking:</span>{' '}
                {so.tracking_url ? (
                  <a
                    href={so.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold hover:text-gold-light flex items-center gap-1 inline-flex"
                  >
                    {so.tracking_number}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  so.tracking_number
                )}
              </p>
            )}
            {so.error_message && (
              <div className="bg-red-50 border border-red-200 p-3 rounded">
                <p className="text-xs text-red-700 font-mono">{so.error_message}</p>
              </div>
            )}
            {so.retry_count > 0 && (
              <p className="text-xs text-charcoal/50">Retried {so.retry_count} time(s)</p>
            )}
            {so.status === 'failed' && (
              <button
                onClick={() => onRetry(order.id)}
                disabled={retrying === order.id}
                className="flex items-center gap-2 mt-2 bg-gold text-white font-body text-sm font-medium px-4 py-2 hover:bg-gold-light transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${retrying === order.id ? 'animate-spin' : ''}`} />
                {retrying === order.id ? 'Retrying…' : 'Retry Fulfillment'}
              </button>
            )}
          </div>
        ) : (
          <p className="text-charcoal/40">No supplier order submitted yet.</p>
        )}
      </section>
    </div>
  )
}
