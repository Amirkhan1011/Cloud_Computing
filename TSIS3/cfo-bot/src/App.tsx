import './App.css'
import { useMemo, useReducer } from 'react'
import AssumptionsForm from './components/AssumptionsForm'
import CostBreakdown from './components/CostBreakdown'
import RecommendationPanel from './components/RecommendationPanel'
import { DEFAULT_INPUTS } from './pricing/constants'
import { calculateCosts } from './pricing/calculateCosts'
import { recommendCheapestModel } from './pricing/recommendCheapestModel'
import { validateInputs } from './validation/validateInputs'
import type { Inputs } from './pricing/types'

type Action = { type: 'patch'; patch: Partial<Inputs> } | { type: 'reset'; next: Inputs }

function reducer(state: Inputs, action: Action): Inputs {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.patch }
    case 'reset':
      return action.next
    default:
      return state
  }
}

function App() {
  const [inputs, dispatch] = useReducer(reducer, DEFAULT_INPUTS)

  const validation = useMemo(() => validateInputs(inputs), [inputs])
  const result = useMemo(() => (validation.valid ? calculateCosts(inputs) : null), [inputs, validation.valid])
  const recommendation = useMemo(
    () => (validation.valid && result ? recommendCheapestModel(inputs) : null),
    [inputs, validation.valid, result],
  )

  return (
    <div className="page">
      <header id="header">
        <h1>CFO Bot (Cloud Economics) &</h1>
        <h1>Agentic Architecture</h1>
        <p>
          Deterministic monthly cloud cost estimation for a Chat Bot application using SSOT pricing formulas.
        </p>
      </header>

      <AssumptionsForm
        inputs={inputs}
        errors={validation.errors}
        onChange={(patch) => dispatch({ type: 'patch', patch })}
        onReset={() => dispatch({ type: 'reset', next: DEFAULT_INPUTS })}
      />

      {!validation.valid ? (
        <section className="card" aria-label="Validation errors">
          <h2>Fix inputs to calculate costs</h2>
          <ul>
            {Object.entries(validation.errors).map(([k, msg]) => (
              <li key={k}>
                <span className="mono">{k}</span>: {msg}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {result ? (
        <>
          {result.derived.N_monthly_requests === 0 ? (
            <section className="card" aria-label="Zero requests explanation">
              <p className="small">
                No requests (N=0): inference/compute/database reads and writes are computed as 0 by SSOT.
                Storage and database storage still apply.
              </p>
            </section>
          ) : null}

          <CostBreakdown result={result} />

          {recommendation ? (
            <RecommendationPanel recommendation={recommendation} selectedModelId={inputs.modelId} />
          ) : null}
        </>
      ) : null}
    </div>
  )
}

export default App
