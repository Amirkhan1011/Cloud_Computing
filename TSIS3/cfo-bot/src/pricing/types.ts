export type RequestsMode = 'derivedFromUsers' | 'manualMonthlyRequests'
export type EgressMode = 'manualGB' | 'derivedFromTokens'

export type ModelId = 'modelA' | 'modelB' | 'modelC'

export interface Inputs {
  U_users: number
  requestsMode: RequestsMode
  R_day_per_user: number
  D_days_per_month: number
  N_monthly_requests: number

  T_in_tokens: number
  T_out_tokens: number

  modelId: ModelId

  G_storage_GB_month: number

  r_reads_per_request: number
  w_writes_per_request: number
  G_db_storage_GB_month: number

  egressMode: EgressMode
  E_egress_GB_month: number
  B_out_bytes_per_token: number
  B_overhead_bytes_per_request: number
}

export interface MonthlyCostsOutput {
  derived: {
    N_monthly_requests: number
    T_in_month: number
    T_out_month: number
    E_egress_GB_month: number
  }
  compute: {
    inferenceCostUSD: number
    orchestrationComputeCostUSD: number
    totalUSD: number
  }
  storageCostUSD: number
  bandwidthCostUSD: number
  database: {
    readCostUSD: number
    writeCostUSD: number
    storageCostUSD: number
    totalUSD: number
  }
  totalMonthlyCostUSD: number
}

export interface ModelRecommendation {
  recommendedModelId: ModelId
  recommendedTotalMonthlyCostUSD: number
}

