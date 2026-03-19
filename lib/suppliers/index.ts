import type { SupplierAdapter } from './types'
import { PrintfulAdapter } from './printful'
import { PrintifyAdapter } from './printify'
import { ApliiqAdapter } from './apliiq'
import { GelatoAdapter } from './gelato'

type SupplierName = 'printful' | 'printify' | 'apliiq' | 'gelato'

const adapterRegistry: Record<SupplierName, () => SupplierAdapter> = {
  printful: () => new PrintfulAdapter(),
  printify: () => new PrintifyAdapter(),
  apliiq: () => new ApliiqAdapter(),
  gelato: () => new GelatoAdapter(),
}

export function getSupplierAdapter(name: SupplierName): SupplierAdapter {
  const factory = adapterRegistry[name]

  if (!factory) {
    throw new Error(`Unknown supplier: ${name}`)
  }

  return factory()
}

export function getAvailableSuppliers(): SupplierName[] {
  return Object.keys(adapterRegistry) as SupplierName[]
}

export type { SupplierAdapter, SupplierName }
export { PrintfulAdapter, PrintifyAdapter, ApliiqAdapter, GelatoAdapter }
