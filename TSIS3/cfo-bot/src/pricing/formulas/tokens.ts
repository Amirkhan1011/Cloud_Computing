import type { Inputs } from '../types'

export function computeMonthlyTokens(inputs: Inputs, N_monthly_requests: number): {
  T_in_month: number
  T_out_month: number
} {
  return {
    T_in_month: N_monthly_requests * inputs.T_in_tokens,
    T_out_month: N_monthly_requests * inputs.T_out_tokens,
  }
}

