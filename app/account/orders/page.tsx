import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatPrice } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/constants'
import type { Metadata } from 'next'
import type { OrderItem, SupplierOrder } from '@/types'

export const metadata: Metadata = {
  title: 'My Orders',
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/sign-in?redirect=/account/orders')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, items:order_items(*), supplier_orders(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const getStatusStyle = (status: string) => {
    return ORDER_STATUSES.find((s) => s.value === status)?.color ?? 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-charcoal mb-10">Order History</h1>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-16 border border-warm-gray">
          <p className="font-body text-base text-charcoal/50 mb-4">No orders found</p>
          <a
            href="/shop"
            className="inline-flex items-center justify-center px-8 py-3 bg-gold text-white font-body font-semibold text-sm hover:bg-gold-light transition-colors"
          >
            Start Shopping
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-warm-gray">
              {/* Order header */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-warm-gray bg-ivory">
                <div>
                  <p className="font-body text-xs text-charcoal/50 mb-0.5">
                    Order #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="font-body text-xs text-charcoal/40">
                    Placed {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-body ${getStatusStyle(order.status)}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span className="font-body text-sm font-bold text-charcoal">
                    {formatPrice(order.total ?? 0)}
                  </span>
                </div>
              </div>

              {/* Order items */}
              <div className="p-5">
                <div className="space-y-2">
                  {order.items?.map((item: OrderItem) => (
                    <div key={item.id} className="flex justify-between text-sm font-body">
                      <span className="text-charcoal">
                        {item.title} — {item.size} / {item.color} × {item.quantity}
                      </span>
                      <span className="text-charcoal/60">
                        {formatPrice(item.unit_price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tracking info */}
                {order.supplier_orders?.map((so: SupplierOrder) => (
                  so.tracking_url && (
                    <div key={so.id} className="mt-4 pt-4 border-t border-warm-gray">
                      <a
                        href={so.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body text-sm text-gold hover:text-gold-light transition-colors underline underline-offset-2"
                      >
                        Track Package →{so.tracking_number ? ` (${so.tracking_number})` : ''}
                      </a>
                    </div>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
