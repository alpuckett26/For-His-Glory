import type {
  SupplierAdapter,
  SupplierProduct,
  SupplierOrderPayload,
  SupplierOrderResult,
} from './types'
import { NotImplementedError } from './types'

export class PrintifyAdapter implements SupplierAdapter {
  readonly name = 'printify'

  async createProduct(_data: Partial<SupplierProduct>): Promise<SupplierProduct> {
    throw new NotImplementedError('Printify', 'createProduct')
  }

  async syncProduct(_supplierProductId: string): Promise<SupplierProduct> {
    throw new NotImplementedError('Printify', 'syncProduct')
  }

  async submitOrder(_payload: SupplierOrderPayload): Promise<SupplierOrderResult> {
    throw new NotImplementedError('Printify', 'submitOrder')
  }

  async getOrderStatus(_supplierOrderId: string): Promise<{
    status: string
    trackingNumber?: string
    trackingUrl?: string
  }> {
    throw new NotImplementedError('Printify', 'getOrderStatus')
  }

  async cancelOrder(_supplierOrderId: string): Promise<boolean> {
    throw new NotImplementedError('Printify', 'cancelOrder')
  }

  async handleWebhook(_payload: unknown): Promise<void> {
    throw new NotImplementedError('Printify', 'handleWebhook')
  }
}
