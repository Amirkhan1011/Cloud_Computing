import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUTS } from '../../src/pricing/constants'
import { computeMonthlyTokens } from '../../src/pricing/formulas/tokens'
import { deriveMonthlyRequests } from '../../src/pricing/formulas/requests'
import { computeInferenceCost } from '../../src/pricing/formulas/inference'
import { computeOrchestrationComputeCost } from '../../src/pricing/formulas/orchestration'
import { computeStorageCost } from '../../src/pricing/formulas/storage'
import { computeDatabaseCost } from '../../src/pricing/formulas/database'
import { computeBandwidthCost } from '../../src/pricing/formulas/egress'
import { calculateCosts } from '../../src/pricing/calculateCosts'
import { recommendCheapestModel } from '../../src/pricing/recommendCheapestModel'

describe('SSOT pricing engine', () => {
  it('derives monthly requests from users/day defaults', () => {
    const N = deriveMonthlyRequests(DEFAULT_INPUTS)
    expect(N).toBe(600000)
  })

  it('computes monthly tokens from N and tokens/request', () => {
    const N = deriveMonthlyRequests(DEFAULT_INPUTS)
    const { T_in_month, T_out_month } = computeMonthlyTokens(DEFAULT_INPUTS, N)
    expect(T_in_month).toBe(240000000)
    expect(T_out_month).toBe(480000000)
  })

  it('computes inference cost for all default models', () => {
    const N = deriveMonthlyRequests(DEFAULT_INPUTS)
    const { T_in_month, T_out_month } = computeMonthlyTokens(DEFAULT_INPUTS, N)

    const a = computeInferenceCost({ modelId: 'modelA', T_in_month, T_out_month })
    const b = computeInferenceCost({ modelId: 'modelB', T_in_month, T_out_month })
    const c = computeInferenceCost({ modelId: 'modelC', T_in_month, T_out_month })

    expect(a.inferenceCostUSD).toBe(324)
    expect(b.inferenceCostUSD).toBe(108)
    expect(c.inferenceCostUSD).toBe(144)
  })

  it('computes orchestration compute cost for default N', () => {
    const N = deriveMonthlyRequests(DEFAULT_INPUTS)
    const orch = computeOrchestrationComputeCost(N)
    expect(orch.invocationCostUSD).toBe(0.12)
    expect(orch.orchestrationComputeCostUSD).toBeCloseTo(0.122666666666667, 12)
  })

  it('computes storage cost for default storage inputs', () => {
    const storage = computeStorageCost(DEFAULT_INPUTS)
    expect(storage.storageCostUSD).toBe(1)
  })

  it('computes database cost for default DB inputs', () => {
    const N = deriveMonthlyRequests(DEFAULT_INPUTS)
    const db = computeDatabaseCost({
      N_monthly_requests: N,
      r_reads_per_request: DEFAULT_INPUTS.r_reads_per_request,
      w_writes_per_request: DEFAULT_INPUTS.w_writes_per_request,
      G_db_storage_GB_month: DEFAULT_INPUTS.G_db_storage_GB_month,
    })

    expect(db.readCostUSD).toBe(0.72)
    expect(db.writeCostUSD).toBe(1.08)
    expect(db.storageCostUSD).toBe(1)
    expect(db.totalUSD).toBeCloseTo(2.8, 12)
  })

  it('computes bandwidth cost for manual egress defaults', () => {
    const N = deriveMonthlyRequests(DEFAULT_INPUTS)
    const bw = computeBandwidthCost({ inputs: DEFAULT_INPUTS, N_monthly_requests: N })
    expect(bw.derived.E_egress_GB_month).toBe(2000)
    expect(bw.bandwidthCostUSD).toBe(180)
  })

  it('computes bandwidth cost for derived-from-tokens egress defaults', () => {
    const N = deriveMonthlyRequests(DEFAULT_INPUTS)
    const inputs = { ...DEFAULT_INPUTS, egressMode: 'derivedFromTokens' as const }
    const bw = computeBandwidthCost({ inputs, N_monthly_requests: N })

    expect(bw.derived.E_egress_GB_month).toBeCloseTo(2.82, 10)
    expect(bw.bandwidthCostUSD).toBeCloseTo(0.2538, 10)
  })

  it('calculates full monthly totals for all default models (manual egress)', () => {
    const a = calculateCosts({ ...DEFAULT_INPUTS, modelId: 'modelA' })
    const b = calculateCosts({ ...DEFAULT_INPUTS, modelId: 'modelB' })
    const c = calculateCosts({ ...DEFAULT_INPUTS, modelId: 'modelC' })

    expect(a.totalMonthlyCostUSD).toBeCloseTo(507.922666666667, 10)
    expect(b.totalMonthlyCostUSD).toBeCloseTo(291.922666666667, 10)
    expect(c.totalMonthlyCostUSD).toBeCloseTo(327.922666666667, 10)
  })

  it('calculates derived egress total for modelA', () => {
    const res = calculateCosts({ ...DEFAULT_INPUTS, modelId: 'modelA', egressMode: 'derivedFromTokens' as const })
    expect(res.totalMonthlyCostUSD).toBeCloseTo(328.176466666667, 10)
  })

  it('handles zero requests correctly (storage + db storage only)', () => {
    const inputs = {
      ...DEFAULT_INPUTS,
      U_users: 0,
      requestsMode: 'derivedFromUsers' as const,
      egressMode: 'manualGB' as const,
      E_egress_GB_month: 0,
    }
    const res = calculateCosts(inputs)
    expect(res.derived.N_monthly_requests).toBe(0)
    expect(res.compute.inferenceCostUSD).toBe(0)
    expect(res.database.readCostUSD).toBe(0)
    expect(res.totalMonthlyCostUSD).toBeCloseTo(2, 10)
  })

  it('recommends cheapest model deterministically', () => {
    const rec = recommendCheapestModel(DEFAULT_INPUTS)
    expect(rec.recommendedModelId).toBe('modelB')
    expect(rec.recommendedTotalMonthlyCostUSD).toBeCloseTo(291.922666666667, 10)
  })
})

