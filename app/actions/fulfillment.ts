'use server'

import { auth } from '@/auth'
import { sql } from '@/lib/db'
import { PrintfulAdapter } from '@/lib/suppliers/printful'
import type { SupplierOrderPayload } from '@/lib/suppliers/types'

interface FulfillmentResult {
  success: boolean
  error?: string
}

export async function retryFulfillment(orderId: string): Promise<FulfillmentResult> {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'Unauthorized' }
  if (!['admin', 'super_admin'].includes(session.user.role ?? '')) {
    return { success: false, error: 'Unauthorized' }
  }

  // Fetch the order with items and variants
  const orderRows = await sql`
    SELECT o.*,
      json_agg(jsonb_build_object(
        'id', oi.id, 'quantity', oi.quantity, 'unit_price', oi.unit_price, 'title', oi.title,
        'variant', jsonb_build_object('id', pv.id, 'sku', pv.sku)
      )) FILTER (WHERE oi.id IS NOT NULL) AS items
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN product_variants pv ON pv.id = oi.variant_id
    WHERE o.id = ${orderId}
    GROUP BY o.id
    LIMIT 1
  `
  const order = orderRows[0]

  if (!order) {
    return { success: false, error: 'Order not found' }
  }

  // Fetch existing supplier order record
  const supplierOrderRows = await sql`
    SELECT * FROM supplier_orders WHERE order_id = ${orderId} LIMIT 1
  `
  const supplierOrder = supplierOrderRows[0] ?? null

  // Build payload
  const shippingAddress = order.shipping_address as {
    name: string
    email: string
    address1: string
    address2?: string
    city: string
    state: string
    zip: string
    country: string
  } | null

  if (!shippingAddress) {
    return { success: false, error: 'Order has no shipping address' }
  }

  const payload: SupplierOrderPayload = {
    externalOrderId: order.id,
    recipient: {
      name: shippingAddress.name,
      email: shippingAddress.email ?? order.email ?? '',
      address1: shippingAddress.address1,
      address2: shippingAddress.address2,
      city: shippingAddress.city,
      state: shippingAddress.state,
      zip: shippingAddress.zip,
      country: shippingAddress.country,
    },
    items: (order.items ?? []).map(
      (item: {
        variant?: { sku?: string; id?: string }
        quantity: number
        unit_price: number
        title?: string
      }) => ({
        supplierVariantId: item.variant?.sku ?? item.variant?.id ?? '',
        quantity: item.quantity,
        retailPrice: item.unit_price,
      })
    ),
  }

  const now = new Date().toISOString()

  try {
    const printful = new PrintfulAdapter()
    const result = await printful.submitOrder(payload)

    if (supplierOrder) {
      await sql`
        UPDATE supplier_orders SET
          supplier_order_id = ${result.supplierOrderId},
          status = ${result.status},
          error_message = NULL,
          retry_count = ${(supplierOrder.retry_count ?? 0) + 1},
          last_attempted_at = ${now},
          submitted_at = ${now},
          updated_at = ${now}
        WHERE id = ${supplierOrder.id}
      `
    } else {
      await sql`
        INSERT INTO supplier_orders (order_id, supplier, supplier_order_id, status, retry_count, last_attempted_at, submitted_at)
        VALUES (${orderId}, 'printful', ${result.supplierOrderId}, ${result.status}, 1, ${now}, ${now})
      `
    }

    await sql`UPDATE orders SET status = 'processing' WHERE id = ${orderId}`

    sql`
      INSERT INTO webhook_logs (source, event_type, payload, processed)
      VALUES ('admin', 'retry_fulfillment', ${JSON.stringify({ order_id: orderId, supplier_order_id: result.supplierOrderId })}, true)
    `.catch(() => {})

    return { success: true }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'

    if (supplierOrder) {
      await sql`
        UPDATE supplier_orders SET
          status = 'failed',
          error_message = ${errorMessage},
          retry_count = ${(supplierOrder.retry_count ?? 0) + 1},
          last_attempted_at = ${now},
          updated_at = ${now}
        WHERE id = ${supplierOrder.id}
      `
    } else {
      await sql`
        INSERT INTO supplier_orders (order_id, supplier, status, error_message, retry_count, last_attempted_at)
        VALUES (${orderId}, 'printful', 'failed', ${errorMessage}, 1, ${now})
      `
    }

    return { success: false, error: errorMessage }
  }
}
