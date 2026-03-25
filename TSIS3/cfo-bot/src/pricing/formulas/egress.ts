import { EGRESS } from '../constants'
import type { EgressMode, Inputs } from '../types'

export function computeBandwidthCost(params: {
  inputs: Inputs
  N_monthly_requests: number
}): {
  derived: { E_egress_GB_month: number; egressMode: EgressMode }
  bandwidthCostUSD: number
} {
  const { inputs, N_monthly_requests } = params

  let E_egress_GB_month: number

  if (inputs.egressMode === 'manualGB') {
    E_egress_GB_month = inputs.E_egress_GB_month
  } else {
    const EgressBytes_month =
      N_monthly_requests * (inputs.T_out_tokens * inputs.B_out_bytes_per_token + inputs.B_overhead_bytes_per_request)
    E_egress_GB_month = EgressBytes_month / 1_000_000_000
  }

  const BillableEgress_GB = Math.max(0, E_egress_GB_month - EGRESS.FreeEgress_GB)
  const bandwidthCostUSD = BillableEgress_GB * EGRESS.P_egress_per_GB

  return {
    derived: { E_egress_GB_month, egressMode: inputs.egressMode },
    bandwidthCostUSD,
  }
}

