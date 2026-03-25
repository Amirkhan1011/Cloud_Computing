import {
  MODEL_TOKEN_PRICING,
  SUPPORTED_EGRESS_MODES,
  SUPPORTED_MODELS_IN_TABLE_ORDER,
  SUPPORTED_REQUESTS_MODES,
} from '../pricing/constants'
import type { Inputs } from '../pricing/types'

export type ValidationErrors = Partial<Record<keyof Inputs, string>>

export function validateInputs(inputs: Inputs): { valid: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {}

  const mustBeFiniteNonNegative = (value: number, key: keyof Inputs, label: string) => {
    if (!Number.isFinite(value)) {
      errors[key] = `${label} must be a finite number`
      return
    }
    if (value < 0) {
      errors[key] = `${label} must be >= 0`
    }
  }

  const mustBeFinitePositive = (value: number, key: keyof Inputs, label: string) => {
    if (!Number.isFinite(value)) {
      errors[key] = `${label} must be a finite number`
      return
    }
    if (value <= 0) {
      errors[key] = `${label} must be > 0`
    }
  }

  mustBeFiniteNonNegative(inputs.U_users, 'U_users', 'Number of users')
  mustBeFiniteNonNegative(inputs.R_day_per_user, 'R_day_per_user', 'Requests per user per day')
  mustBeFinitePositive(inputs.D_days_per_month, 'D_days_per_month', 'Days per month')
  mustBeFiniteNonNegative(inputs.N_monthly_requests, 'N_monthly_requests', 'Monthly requests')

  mustBeFiniteNonNegative(inputs.T_in_tokens, 'T_in_tokens', 'Input tokens per request')
  mustBeFiniteNonNegative(inputs.T_out_tokens, 'T_out_tokens', 'Output tokens per request')

  mustBeFiniteNonNegative(inputs.G_storage_GB_month, 'G_storage_GB_month', 'Storage (GB/month)')

  mustBeFiniteNonNegative(inputs.r_reads_per_request, 'r_reads_per_request', 'DB reads per request')
  mustBeFiniteNonNegative(inputs.w_writes_per_request, 'w_writes_per_request', 'DB writes per request')
  mustBeFiniteNonNegative(inputs.G_db_storage_GB_month, 'G_db_storage_GB_month', 'DB storage (GB/month)')

  mustBeFiniteNonNegative(inputs.E_egress_GB_month, 'E_egress_GB_month', 'Egress (GB/month)')
  mustBeFiniteNonNegative(inputs.B_out_bytes_per_token, 'B_out_bytes_per_token', 'Bytes per output token')
  mustBeFiniteNonNegative(inputs.B_overhead_bytes_per_request, 'B_overhead_bytes_per_request', 'Overhead bytes per request')

  if (!SUPPORTED_REQUESTS_MODES.includes(inputs.requestsMode)) {
    errors.requestsMode = 'Invalid requests mode'
  }

  if (!SUPPORTED_EGRESS_MODES.includes(inputs.egressMode)) {
    errors.egressMode = 'Invalid egress mode'
  }

  if (!SUPPORTED_MODELS_IN_TABLE_ORDER.includes(inputs.modelId) || !MODEL_TOKEN_PRICING[inputs.modelId]) {
    errors.modelId = 'Unknown model/provider selection'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

