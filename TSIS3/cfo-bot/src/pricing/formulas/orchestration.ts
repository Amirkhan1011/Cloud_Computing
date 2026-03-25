import { SERVERLESS } from '../constants'

export function computeOrchestrationComputeCost(
  N_monthly_requests: number,
): {
  invocationCostUSD: number
  runtimeCostUSD: number
  orchestrationComputeCostUSD: number
} {
  const invocationCostUSD = N_monthly_requests * SERVERLESS.P_serverless_invocation

  // runtime GB-hours per request = M * (S_seconds_per_request / 3600)
  const runtimeCostPerRequestUSD =
    SERVERLESS.M_memory_GB * (SERVERLESS.S_seconds_per_request / 3600) * SERVERLESS.P_serverless_gb_hour
  const runtimeCostUSD = N_monthly_requests * runtimeCostPerRequestUSD

  return {
    invocationCostUSD,
    runtimeCostUSD,
    orchestrationComputeCostUSD: invocationCostUSD + runtimeCostUSD,
  }
}

