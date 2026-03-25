import type { EgressMode, Inputs, RequestsMode } from '../pricing/types'
import { DEFAULT_INPUTS, SUPPORTED_EGRESS_MODES, SUPPORTED_MODELS_IN_TABLE_ORDER, SUPPORTED_REQUESTS_MODES } from '../pricing/constants'

export type AssumptionsFormProps = {
  inputs: Inputs
  errors: Partial<Record<keyof Inputs, string>>
  onChange: (patch: Partial<Inputs>) => void
  onReset: () => void
}

function numberInputProps(key: keyof Inputs) {
  return {
    id: String(key),
    step: 'any',
  }
}

export default function AssumptionsForm({
  inputs,
  errors,
  onChange,
  onReset,
}: AssumptionsFormProps) {
  const setNumber = (key: keyof Inputs, value: number) => {
    onChange({ [key]: value } as Partial<Inputs>)
  }

  const setEnum = (key: 'requestsMode' | 'egressMode' | 'modelId', value: RequestsMode | EgressMode | Inputs['modelId']) => {
    onChange({ [key]: value } as Partial<Inputs>)
  }

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <h2>CFO Bot Inputs (Cloud Cost Assumptions)</h2>

      <div className="grid">
        <div className="field">
          <label htmlFor="U_users">Number of users (U)</label>
          <input
            {...numberInputProps('U_users')}
            type="number"
            value={inputs.U_users}
            onChange={(e) => setNumber('U_users', e.target.value === '' ? 0 : Number(e.target.value))}
          />
          {errors.U_users ? <div className="error">{errors.U_users}</div> : null}
        </div>

        <div className="field">
          <label htmlFor="requestsMode">Requests mode</label>
          <select
            id="requestsMode"
            value={inputs.requestsMode}
            onChange={(e) => setEnum('requestsMode', e.target.value as RequestsMode)}
          >
            {SUPPORTED_REQUESTS_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          {errors.requestsMode ? <div className="error">{errors.requestsMode}</div> : null}
        </div>

        <div className="field">
          <label htmlFor="R_day_per_user">Requests per user per day (R)</label>
          <input
            {...numberInputProps('R_day_per_user')}
            type="number"
            value={inputs.R_day_per_user}
            disabled={inputs.requestsMode !== 'derivedFromUsers'}
            onChange={(e) => setNumber('R_day_per_user', e.target.value === '' ? 0 : Number(e.target.value))}
          />
          {errors.R_day_per_user ? <div className="error">{errors.R_day_per_user}</div> : null}
        </div>

        <div className="field">
          <label htmlFor="D_days_per_month">Days per month (D)</label>
          <input
            {...numberInputProps('D_days_per_month')}
            type="number"
            value={inputs.D_days_per_month}
            disabled={inputs.requestsMode !== 'derivedFromUsers'}
            onChange={(e) => setNumber('D_days_per_month', e.target.value === '' ? 0 : Number(e.target.value))}
          />
          {errors.D_days_per_month ? <div className="error">{errors.D_days_per_month}</div> : null}
        </div>

        <div className="field">
          <label htmlFor="N_monthly_requests">Monthly requests (N)</label>
          <input
            {...numberInputProps('N_monthly_requests')}
            type="number"
            value={inputs.N_monthly_requests}
            disabled={inputs.requestsMode !== 'manualMonthlyRequests'}
            onChange={(e) => setNumber('N_monthly_requests', e.target.value === '' ? 0 : Number(e.target.value))}
          />
          {errors.N_monthly_requests ? <div className="error">{errors.N_monthly_requests}</div> : null}
        </div>

        <div className="field">
          <label htmlFor="T_in_tokens">Input tokens per request (T_in)</label>
          <input
            {...numberInputProps('T_in_tokens')}
            type="number"
            value={inputs.T_in_tokens}
            onChange={(e) => setNumber('T_in_tokens', e.target.value === '' ? 0 : Number(e.target.value))}
          />
          {errors.T_in_tokens ? <div className="error">{errors.T_in_tokens}</div> : null}
        </div>

        <div className="field">
          <label htmlFor="T_out_tokens">Output tokens per request (T_out)</label>
          <input
            {...numberInputProps('T_out_tokens')}
            type="number"
            value={inputs.T_out_tokens}
            onChange={(e) => setNumber('T_out_tokens', e.target.value === '' ? 0 : Number(e.target.value))}
          />
          {errors.T_out_tokens ? <div className="error">{errors.T_out_tokens}</div> : null}
        </div>

        <div className="field">
          <label htmlFor="modelId">Model / Provider selection</label>
          <select
            id="modelId"
            value={inputs.modelId}
            onChange={(e) => onChange({ modelId: e.target.value as Inputs['modelId'] })}
          >
            {SUPPORTED_MODELS_IN_TABLE_ORDER.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          {errors.modelId ? <div className="error">{errors.modelId}</div> : null}
        </div>

        <div className="field">
          <label htmlFor="G_storage_GB_month">Storage usage (GB/month)</label>
          <input
            {...numberInputProps('G_storage_GB_month')}
            type="number"
            value={inputs.G_storage_GB_month}
            onChange={(e) => setNumber('G_storage_GB_month', e.target.value === '' ? 0 : Number(e.target.value))}
          />
          {errors.G_storage_GB_month ? <div className="error">{errors.G_storage_GB_month}</div> : null}
        </div>

        <div className="field">
          <label htmlFor="r_reads_per_request">DB reads per request (r)</label>
          <input
            {...numberInputProps('r_reads_per_request')}
            type="number"
            value={inputs.r_reads_per_request}
            onChange={(e) => setNumber('r_reads_per_request', e.target.value === '' ? 0 : Number(e.target.value))}
          />
          {errors.r_reads_per_request ? <div className="error">{errors.r_reads_per_request}</div> : null}
        </div>

        <div className="field">
          <label htmlFor="w_writes_per_request">DB writes per request (w)</label>
          <input
            {...numberInputProps('w_writes_per_request')}
            type="number"
            value={inputs.w_writes_per_request}
            onChange={(e) => setNumber('w_writes_per_request', e.target.value === '' ? 0 : Number(e.target.value))}
          />
          {errors.w_writes_per_request ? <div className="error">{errors.w_writes_per_request}</div> : null}
        </div>

        <div className="field">
          <label htmlFor="G_db_storage_GB_month">Database storage (GB/month)</label>
          <input
            {...numberInputProps('G_db_storage_GB_month')}
            type="number"
            value={inputs.G_db_storage_GB_month}
            onChange={(e) => setNumber('G_db_storage_GB_month', e.target.value === '' ? 0 : Number(e.target.value))}
          />
          {errors.G_db_storage_GB_month ? <div className="error">{errors.G_db_storage_GB_month}</div> : null}
        </div>

        <div className="field">
          <label htmlFor="egressMode">Egress mode</label>
          <select
            id="egressMode"
            value={inputs.egressMode}
            onChange={(e) => setEnum('egressMode', e.target.value as EgressMode)}
          >
            {SUPPORTED_EGRESS_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          {errors.egressMode ? <div className="error">{errors.egressMode}</div> : null}
        </div>

        <div className="field">
          <label htmlFor="E_egress_GB_month">Outbound traffic (GB/month)</label>
          <input
            {...numberInputProps('E_egress_GB_month')}
            type="number"
            value={inputs.E_egress_GB_month}
            disabled={inputs.egressMode !== 'manualGB'}
            onChange={(e) => setNumber('E_egress_GB_month', e.target.value === '' ? 0 : Number(e.target.value))}
          />
          {errors.E_egress_GB_month ? <div className="error">{errors.E_egress_GB_month}</div> : null}
        </div>

        <div className="field">
          <label htmlFor="B_out_bytes_per_token">Bytes per output token (derived mode)</label>
          <input
            {...numberInputProps('B_out_bytes_per_token')}
            type="number"
            value={inputs.B_out_bytes_per_token}
            disabled={inputs.egressMode !== 'derivedFromTokens'}
            onChange={(e) =>
              setNumber('B_out_bytes_per_token', e.target.value === '' ? 0 : Number(e.target.value))
            }
          />
          {errors.B_out_bytes_per_token ? <div className="error">{errors.B_out_bytes_per_token}</div> : null}
        </div>

        <div className="field">
          <label htmlFor="B_overhead_bytes_per_request">Overhead bytes per request (derived mode)</label>
          <input
            {...numberInputProps('B_overhead_bytes_per_request')}
            type="number"
            value={inputs.B_overhead_bytes_per_request}
            disabled={inputs.egressMode !== 'derivedFromTokens'}
            onChange={(e) =>
              setNumber(
                'B_overhead_bytes_per_request',
                e.target.value === '' ? 0 : Number(e.target.value),
              )
            }
          />
          {errors.B_overhead_bytes_per_request ? <div className="error">{errors.B_overhead_bytes_per_request}</div> : null}
        </div>
      </div>

      <div className="actions">
        <button type="button" className="btn" onClick={onReset}>
          Reset to defaults
        </button>
        <div className="hint">
          Defaults are demo-friendly. Pricing constants are defined in the app from the SSOT.
        </div>
      </div>
    </form>
  )
}

export const _internalDefaultsForTests = DEFAULT_INPUTS

