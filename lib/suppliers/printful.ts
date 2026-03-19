import type {
  SupplierAdapter,
  SupplierProduct,
  SupplierVariant,
  SupplierOrderPayload,
  SupplierOrderResult,
  PrintArea,
} from './types'

const PRINTFUL_API_BASE = 'https://api.printful.com'

interface PrintfulApiResponse<T> {
  code: number
  result: T
  extra?: unknown
  error?: string
}

interface PrintfulVariant {
  id: number
  name: string
  size: string
  color: string
  color_code: string
  price: string
  availability_status: string
}

interface PrintfulSyncVariant {
  id: number
  external_id: string
  variant_id: number
  sync_product_id: number
  name: string
  sku: string
  retail_price: string
  currency: string
  is_ignored: boolean
  product: {
    variant_id: number
    product_id: number
    name: string
    main_category_id: number
  }
}

interface PrintfulSyncProduct {
  id: number
  external_id: string
  name: string
  variants: number
  synced: number
  thumbnail_url: string
  is_ignored: boolean
}

export class PrintfulAdapter implements SupplierAdapter {
  readonly name = 'printful'
  private apiKey: string
  private storeId: string

  constructor() {
    this.apiKey = process.env.PRINTFUL_API_KEY!
    this.storeId = process.env.PRINTFUL_STORE_ID!

    if (!this.apiKey) {
      throw new Error('PRINTFUL_API_KEY is not defined')
    }
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${PRINTFUL_API_BASE}${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-PF-Store-Id': this.storeId,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(`Printful API error ${response.status}: ${JSON.stringify(error)}`)
    }

    const data: PrintfulApiResponse<T> = await response.json()

    if (data.code >= 400) {
      throw new Error(`Printful API error: ${data.error}`)
    }

    return data.result
  }

  async createProduct(data: Partial<SupplierProduct>): Promise<SupplierProduct> {
    const payload = {
      sync_product: {
        name: data.title,
        external_id: data.supplierProductId,
      },
      sync_variants: data.variants?.map((variant) => ({
        retail_price: variant.price.toFixed(2),
        variant_id: variant.supplierVariantId,
        files: [],
      })) ?? [],
    }

    const result = await this.request<{
      sync_product: PrintfulSyncProduct
      sync_variants: PrintfulSyncVariant[]
    }>('/store/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    return this.mapSyncProductToSupplierProduct(
      result.sync_product,
      result.sync_variants
    )
  }

  async syncProduct(supplierProductId: string): Promise<SupplierProduct> {
    const result = await this.request<{
      sync_product: PrintfulSyncProduct
      sync_variants: PrintfulSyncVariant[]
    }>(`/store/products/@${supplierProductId}`)

    return this.mapSyncProductToSupplierProduct(
      result.sync_product,
      result.sync_variants
    )
  }

  async submitOrder(payload: SupplierOrderPayload): Promise<SupplierOrderResult> {
    const orderPayload = {
      external_id: payload.externalOrderId,
      shipping: 'STANDARD',
      recipient: {
        name: payload.recipient.name,
        email: payload.recipient.email,
        address1: payload.recipient.address1,
        address2: payload.recipient.address2,
        city: payload.recipient.city,
        state_code: payload.recipient.state,
        country_code: payload.recipient.country,
        zip: payload.recipient.zip,
      },
      items: payload.items.map((item) => ({
        sync_variant_id: item.supplierVariantId,
        quantity: item.quantity,
        files: item.printFiles?.map((file) => ({
          placement: file.placement,
          url: file.imageUrl,
        })) ?? [],
      })),
    }

    const result = await this.request<{
      id: number
      external_id: string
      status: string
      shipping: string
      created: number
      updated: number
    }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    })

    // Confirm the order (move from draft to pending)
    await this.request(`/orders/${result.id}/confirm`, {
      method: 'POST',
    })

    return {
      supplierOrderId: String(result.id),
      status: result.status,
    }
  }

  async getOrderStatus(supplierOrderId: string): Promise<{
    status: string
    trackingNumber?: string
    trackingUrl?: string
  }> {
    const result = await this.request<{
      id: number
      status: string
      shipping_service_name: string
      shipments: Array<{
        id: number
        carrier: string
        service: string
        tracking_number: string
        tracking_url: string
        shipped_at: string
        estimated_delivery_time: string
      }>
    }>(`/orders/${supplierOrderId}`)

    const latestShipment = result.shipments?.[0]

    return {
      status: result.status,
      trackingNumber: latestShipment?.tracking_number,
      trackingUrl: latestShipment?.tracking_url,
    }
  }

  async cancelOrder(supplierOrderId: string): Promise<boolean> {
    try {
      await this.request(`/orders/${supplierOrderId}`, {
        method: 'DELETE',
      })
      return true
    } catch {
      return false
    }
  }

  async handleWebhook(payload: unknown): Promise<void> {
    const event = payload as {
      type: string
      data: Record<string, unknown>
    }

    console.log(`Printful webhook received: ${event.type}`, event.data)

    switch (event.type) {
      case 'package_shipped':
        // Handled in the webhook route handler
        break
      case 'order_failed':
        // Handled in the webhook route handler
        break
      default:
        console.log(`Unhandled Printful webhook event: ${event.type}`)
    }
  }

  private mapSyncProductToSupplierProduct(
    product: PrintfulSyncProduct,
    variants: PrintfulSyncVariant[]
  ): SupplierProduct {
    const mappedVariants: SupplierVariant[] = variants.map((v) => ({
      supplierVariantId: String(v.id),
      size: this.extractSize(v.name),
      color: this.extractColor(v.name),
      price: parseFloat(v.retail_price),
      sku: v.sku,
    }))

    const printAreas: PrintArea[] = [
      { key: 'front', width: 14, height: 16 },
      { key: 'back', width: 14, height: 16 },
    ]

    return {
      supplierProductId: String(product.id),
      title: product.name,
      variants: mappedVariants,
      printAreas,
    }
  }

  private extractSize(variantName: string): string {
    const sizes = ['2XL', 'XL', 'L', 'M', 'S', 'XS', '3XL', '4XL', '5XL']
    for (const size of sizes) {
      if (variantName.includes(size)) return size
    }
    return ''
  }

  private extractColor(variantName: string): string {
    const parts = variantName.split(' / ')
    return parts[0] ?? variantName
  }
}
