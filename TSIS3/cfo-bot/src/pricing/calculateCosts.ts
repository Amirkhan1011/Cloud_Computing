import { MODEL_TOKEN_PRICING } from './constants'
import type { Inputs, MonthlyCostsOutput, ModelId } from './types'
import { deriveMonthlyRequests } from './formulas/requests'
import { computeMonthlyTokens } from './formulas/tokens'
import { computeInferenceCost } from './formulas/inference'
import { computeOrchestrationComputeCost } from './formulas/orchestration'
import { computeStorageCost } from './formulas/storage'
import { computeDatabaseCost } from './formulas/database'
import { computeBandwidthCost } from './formulas/egress'

function assertModelId(modelId: ModelId) {
  if (!MODEL_TOKEN_PRICING[modelId]) {
    throw new Error(`Unknown modelId: ${modelId}`)
  }
}

export function calculateCosts(inputs: Inputs): MonthlyCostsOutput {
  assertModelId(inputs.modelId)

  const N_monthly_requests = deriveMonthlyRequests(inputs)
  const { T_in_month, T_out_month } = computeMonthlyTokens(inputs, N_monthly_requests)

  const inference = computeInferenceCost({
    modelId: inputs.modelId,
    T_in_month,
    T_out_month,
  })

  const orchestration = computeOrchestrationComputeCost(N_monthly_requests)
  const computeTotalUSD = inference.inferenceCostUSD + orchestration.orchestrationComputeCostUSD

  const storage = computeStorageCost(inputs)
  const database = computeDatabaseCost({
    N_monthly_requests,
    r_reads_per_request: inputs.r_reads_per_request,
    w_writes_per_request: inputs.w_writes_per_request,
    G_db_storage_GB_month: inputs.G_db_storage_GB_month,
  })

  const bandwidth = computeBandwidthCost({
    inputs,
    N_monthly_requests,
  })

  const totalUSD = computeTotalUSD + storage.storageCostUSD + database.totalUSD + bandwidth.bandwidthCostUSD

  return {
    derived: {
      N_monthly_requests,
      T_in_month,
      T_out_month,
      E_egress_GB_month: bandwidth.derived.E_egress_GB_month,
    },
    compute: {
      inferenceCostUSD: inference.inferenceCostUSD,
      orchestrationComputeCostUSD: orchestration.orchestrationComputeCostUSD,
      totalUSD: computeTotalUSD,
    },
    storageCostUSD: storage.storageCostUSD,
    bandwidthCostUSD: bandwidth.bandwidthCostUSD,
    database: {
      readCostUSD: database.readCostUSD,
      writeCostUSD: database.writeCostUSD,
      storageCostUSD: database.storageCostUSD,
      totalUSD: database.totalUSD,
    },
    totalMonthlyCostUSD: totalUSD,
  }
}

