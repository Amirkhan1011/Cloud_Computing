import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_INPUTS } from '../../src/pricing/constants'

describe('recommendCheapestModel tie-breaking', () => {
  it('chooses the first model in SSOT table order when totals tie', async () => {
    vi.resetModules()

    vi.doMock('../../src/pricing/calculateCosts', () => ({
      calculateCosts: () => ({
        totalMonthlyCostUSD: 42,
      }),
    }))

    const { recommendCheapestModel } = await import('../../src/pricing/recommendCheapestModel')
    const rec = recommendCheapestModel(DEFAULT_INPUTS)

    expect(rec.recommendedModelId).toBe('modelA')
  })
})

