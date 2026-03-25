import type { EgressMode, Inputs, ModelId, RequestsMode } from './types'

export const SUPPORTED_REQUESTS_MODES: RequestsMode[] = ['derivedFromUsers', 'manualMonthlyRequests']
export const SUPPORTED_EGRESS_MODES: EgressMode[] = ['manualGB', 'derivedFromTokens']

export const SUPPORTED_MODELS_IN_TABLE_ORDER: ModelId[] = ['modelA', 'modelB', 'modelC']

export interface ModelTokenPricing {
  P_in_per_1M: number
  P_out_per_1M: number
}

export const MODEL_TOKEN_PRICING: Record<ModelId, ModelTokenPricing> = {
  modelA: { P_in_per_1M: 0.15, P_out_per_1M: 0.6 },
  modelB: { P_in_per_1M: 0.05, P_out_per_1M: 0.2 },
  modelC: { P_in_per_1M: 0.1, P_out_per_1M: 0.25 },
}

// Serverless/orchestration compute constants (USD), per SSOT.
export const SERVERLESS = {
  P_serverless_invocation: 0.0000002,
  P_serverless_gb_hour: 0.000016,
  S_seconds_per_request: 2,
  M_memory_GB: 0.5,
} as const

// Storage unit price (USD per GB-month), per SSOT.
export const STORAGE = {
  P_storage_per_GB_month: 0.02,
} as const

// Database unit prices (USD), per SSOT.
export const DATABASE = {
  P_db_read_per_100k: 0.06,
  P_db_write_per_100k: 0.18,
  P_db_storage_per_GB_month: 0.1,
} as const

// Bandwidth / egress unit prices (USD), per SSOT.
export const EGRESS = {
  FreeEgress_GB: 0,
  P_egress_per_GB: 0.09,
} as const

export const DEFAULT_INPUTS: Inputs = {
  U_users: 1000,
  requestsMode: 'derivedFromUsers',
  R_day_per_user: 20,
  D_days_per_month: 30,
  N_monthly_requests: 600000,

  T_in_tokens: 400,
  T_out_tokens: 800,

  modelId: 'modelA',

  G_storage_GB_month: 50,

  r_reads_per_request: 2,
  w_writes_per_request: 1,
  G_db_storage_GB_month: 10,

  egressMode: 'manualGB',
  E_egress_GB_month: 2000,
  B_out_bytes_per_token: 4,
  B_overhead_bytes_per_request: 1500,
}

