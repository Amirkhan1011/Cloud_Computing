import { STORAGE } from '../constants'
import type { Inputs } from '../types'

export function computeStorageCost(inputs: Inputs): { storageCostUSD: number } {
  return {
    storageCostUSD: inputs.G_storage_GB_month * STORAGE.P_storage_per_GB_month,
  }
}

