import type { Inputs } from '../types'

export function deriveMonthlyRequests(inputs: Inputs): number {
  if (inputs.requestsMode === 'derivedFromUsers') {
    return inputs.U_users * inputs.R_day_per_user * inputs.D_days_per_month
  }
  return inputs.N_monthly_requests
}

