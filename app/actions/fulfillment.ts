'use server'

import { createClient } from '@/lib/supabase/server'
import { PrintfulAdapter } from '@/lib/suppliers/printful'
import type { SupplierOrderPayload } from '@/lib/suppliers/types'

interface FulfillmentResult {
  success: boolean
  error?: string
}

export async function retryFulfillment(orderId: string): Promise<FulfillmentResult> {
  const supabase = await createClient()

  // Verify the caller is an admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' }
  }

  // Fetch the order with items and variants
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        variant:product_variants(*)
      )
    `)
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return { success: false, error: 'Order not found' }
  }

  // Fetch existing supplier order record
  const { data: supplierOrder } = await supabase
    .from('supplier_orders')
    .select('*')
    .eq('order_id', orderId)
    .single()

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

    // Upsert supplier_orders record
    if (supplierOrder) {
      await supabase
        .from('supplier_orders')
        .update({
          supplier_order_id: result.supplierOrderId,
          status: result.status,
          error_message: null,
          retry_count: (supplierOrder.retry_count ?? 0) + 1,
          last_attempted_at: now,
          submitted_at: now,
          updated_at: now,
        })
        .eq('id', supplierOrder.id)
    } else {
      await supabase.from('supplier_orders').insert({
        order_id: orderId,
        supplier: 'printful',
        supplier_order_id: result.supplierOrderId,
        status: result.status,
        retry_count: 1,
        last_attempted_at: now,
        submitted_at: now,
      })
    }

    // Update order status to processing
    await supabase
      .from('orders')
      .update({ status: 'processing' })
      .eq('id', orderId)

    // Log to webhook_logs (best-effort, ignore errors)
    await supabase.from('webhook_logs').insert({
      source: 'admin',
      event_type: 'retry_fulfillment',
      payload: { order_id: orderId, supplier_order_id: result.supplierOrderId },
      processed: true,
    })

    return { success: true }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'

    // Record the failure
    if (supplierOrder) {
      await supabase
        .from('supplier_orders')
        .update({
          status: 'failed',
          error_message: errorMessage,
          retry_count: (supplierOrder.retry_count ?? 0) + 1,
          last_attempted_at: now,
          updated_at: now,
        })
        .eq('id', supplierOrder.id)
    } else {
      await supabase.from('supplier_orders').insert({
        order_id: orderId,
        supplier: 'printful',
        status: 'failed',
        error_message: errorMessage,
        retry_count: 1,
        last_attempted_at: now,
      })
    }

    return { success: false, error: errorMessage }
  }
}
