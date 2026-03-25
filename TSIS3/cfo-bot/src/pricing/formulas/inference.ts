import { MODEL_TOKEN_PRICING } from '../constants'
import type { ModelId } from '../types'

export function computeInferenceCost(params: {
  modelId: ModelId
  T_in_month: number
  T_out_month: number
}): {
  inferenceInputCostUSD: number
  inferenceOutputCostUSD: number
  inferenceCostUSD: number
} {
  const { modelId, T_in_month, T_out_month } = params
  const pricing = MODEL_TOKEN_PRICING[modelId]

  const inferenceInputCostUSD = (T_in_month / 1_000_000) * pricing.P_in_per_1M
  const inferenceOutputCostUSD = (T_out_month / 1_000_000) * pricing.P_out_per_1M

  return {
    inferenceInputCostUSD,
    inferenceOutputCostUSD,
    inferenceCostUSD: inferenceInputCostUSD + inferenceOutputCostUSD,
  }
}

