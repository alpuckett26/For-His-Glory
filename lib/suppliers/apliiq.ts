import type {
  SupplierAdapter,
  SupplierProduct,
  SupplierOrderPayload,
  SupplierOrderResult,
} from './types'
import { NotImplementedError } from './types'

export class ApliiqAdapter implements SupplierAdapter {
  readonly name = 'apliiq'

  async createProduct(_data: Partial<SupplierProduct>): Promise<SupplierProduct> {
    throw new NotImplementedError('Apliiq', 'createProduct')
  }

  async syncProduct(_supplierProductId: string): Promise<SupplierProduct> {
    throw new NotImplementedError('Apliiq', 'syncProduct')
  }

  async submitOrder(_payload: SupplierOrderPayload): Promise<SupplierOrderResult> {
    throw new NotImplementedError('Apliiq', 'submitOrder')
  }

  async getOrderStatus(_supplierOrderId: string): Promise<{
    status: string
    trackingNumber?: string
    trackingUrl?: string
  }> {
    throw new NotImplementedError('Apliiq', 'getOrderStatus')
  }

  async cancelOrder(_supplierOrderId: string): Promise<boolean> {
    throw new NotImplementedError('Apliiq', 'cancelOrder')
  }

  async handleWebhook(_payload: unknown): Promise<void> {
    throw new NotImplementedError('Apliiq', 'handleWebhook')
  }
}
