import type {
  SupplierAdapter,
  SupplierProduct,
  SupplierOrderPayload,
  SupplierOrderResult,
} from './types'
import { NotImplementedError } from './types'

export class GelatoAdapter implements SupplierAdapter {
  readonly name = 'gelato'

  async createProduct(_data: Partial<SupplierProduct>): Promise<SupplierProduct> {
    throw new NotImplementedError('Gelato', 'createProduct')
  }

  async syncProduct(_supplierProductId: string): Promise<SupplierProduct> {
    throw new NotImplementedError('Gelato', 'syncProduct')
  }

  async submitOrder(_payload: SupplierOrderPayload): Promise<SupplierOrderResult> {
    throw new NotImplementedError('Gelato', 'submitOrder')
  }

  async getOrderStatus(_supplierOrderId: string): Promise<{
    status: string
    trackingNumber?: string
    trackingUrl?: string
  }> {
    throw new NotImplementedError('Gelato', 'getOrderStatus')
  }

  async cancelOrder(_supplierOrderId: string): Promise<boolean> {
    throw new NotImplementedError('Gelato', 'cancelOrder')
  }

  async handleWebhook(_payload: unknown): Promise<void> {
    throw new NotImplementedError('Gelato', 'handleWebhook')
  }
}
