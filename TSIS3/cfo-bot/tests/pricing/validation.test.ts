import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUTS } from '../../src/pricing/constants'
import { validateInputs } from '../../src/validation/validateInputs'

describe('Input validation (SSOT)', () => {
  it('rejects negative numeric inputs', () => {
    const bad = { ...DEFAULT_INPUTS, U_users: -1 }
    const res = validateInputs(bad)
    expect(res.valid).toBe(false)
    expect(res.errors.U_users).toBeDefined()
  })

  it('rejects D_days_per_month <= 0', () => {
    const bad = { ...DEFAULT_INPUTS, D_days_per_month: 0 }
    const res = validateInputs(bad)
    expect(res.valid).toBe(false)
    expect(res.errors.D_days_per_month).toBeDefined()
  })

  it('rejects unknown modelId', () => {
    const bad = { ...DEFAULT_INPUTS, modelId: 'modelZ' as any }
    const res = validateInputs(bad)
    expect(res.valid).toBe(false)
    expect(res.errors.modelId).toBeDefined()
  })

  it('rejects unknown egress mode', () => {
    const bad = { ...DEFAULT_INPUTS, egressMode: 'not-a-mode' as any }
    const res = validateInputs(bad)
    expect(res.valid).toBe(false)
    expect(res.errors.egressMode).toBeDefined()
  })
})

