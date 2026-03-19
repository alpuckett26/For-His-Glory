export interface SupplierProduct {
  supplierProductId: string
  title: string
  variants: SupplierVariant[]
  printAreas?: PrintArea[]
}

export interface SupplierVariant {
  supplierVariantId: string
  size: string
  color: string
  colorHex?: string
  price: number
  sku?: string
}

export interface PrintArea {
  key: string
  width: number
  height: number
}

export interface SupplierOrderItem {
  supplierVariantId: string
  quantity: number
  printFiles?: PrintFile[]
}

export interface PrintFile {
  placement: string
  imageUrl: string
}

export interface SupplierOrderPayload {
  externalOrderId: string
  recipient: {
    name: string
    email: string
    address1: string
    address2?: string
    city: string
    state: string
    zip: string
    country: string
  }
  items: SupplierOrderItem[]
}

export interface SupplierOrderResult {
  supplierOrderId: string
  status: string
  estimatedFulfillmentDate?: string
}

export interface SupplierAdapter {
  name: string
  createProduct(data: Partial<SupplierProduct>): Promise<SupplierProduct>
  syncProduct(supplierProductId: string): Promise<SupplierProduct>
  submitOrder(payload: SupplierOrderPayload): Promise<SupplierOrderResult>
  getOrderStatus(supplierOrderId: string): Promise<{
    status: string
    trackingNumber?: string
    trackingUrl?: string
  }>
  cancelOrder(supplierOrderId: string): Promise<boolean>
  handleWebhook(payload: unknown): Promise<void>
}

export class NotImplementedError extends Error {
  constructor(supplierName: string, method: string) {
    super(`${supplierName}: ${method} is not yet implemented`)
    this.name = 'NotImplementedError'
  }
}
