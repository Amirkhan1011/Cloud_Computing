import { SUPPORTED_MODELS_IN_TABLE_ORDER } from './constants'
import { calculateCosts } from './calculateCosts'
import type { Inputs, ModelRecommendation } from './types'

export function recommendCheapestModel(inputs: Inputs): ModelRecommendation {
  // Deterministic tie-breaking: choose the first model in SSOT table order
  // when totals are exactly equal (within a tiny epsilon to handle FP).
  const EPS = 1e-12

  let bestModelId: typeof inputs.modelId = SUPPORTED_MODELS_IN_TABLE_ORDER[0]
  let bestTotal = Infinity
  let bestIndex = Infinity

  for (let i = 0; i < SUPPORTED_MODELS_IN_TABLE_ORDER.length; i++) {
    const modelId = SUPPORTED_MODELS_IN_TABLE_ORDER[i]
    const total = calculateCosts({ ...inputs, modelId }).totalMonthlyCostUSD

    if (total < bestTotal - EPS) {
      bestTotal = total
      bestModelId = modelId
      bestIndex = i
    } else if (Math.abs(total - bestTotal) <= EPS && i < bestIndex) {
      bestTotal = total
      bestModelId = modelId
      bestIndex = i
    }
  }

  return {
    recommendedModelId: bestModelId,
    recommendedTotalMonthlyCostUSD: bestTotal,
  }
}

