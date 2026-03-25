## CFO Bot (Cloud Economics) & Agentic Architecture — Implementation Plan (Phase 2)

### Basis
This plan is based strictly on `docs/SSOT.md`. The implementation must mirror the same inputs, constants, units, and formulas.

### 1. Project Architecture
The application consists of a **React frontend** and a **deterministic pricing engine** implemented in TypeScript as pure functions.

Key architectural principles:
- Pricing calculations must be **pure** and testable.
- UI must be a thin layer that:
  - collects validated inputs
  - calls the pricing engine
  - renders breakdown cards and totals
- No pricing logic may live inside React components except calling the engine and formatting.

#### Pricing Engine Interfaces (conceptual)
The pricing engine must support:
- `deriveMonthlyRequests(inputs): number`
- `computeMonthlyTokens(inputs): { T_in_month, T_out_month }`
- `computeInferenceCost(model, T_in_month, T_out_month): number`
- `computeOrchestrationComputeCost(N_monthly_requests): number`
- `computeComputeCost(inputs, model): number`
- `computeStorageCost(inputs): number`
- `computeDatabaseCost(inputs): number`
- `computeBandwidthCost(inputs): number`
- `computeTotalMonthlyCost(inputs, model): { components..., total }`
- `recommendCheapestModel(inputs, allModels): { modelId, total }`

All functions must use only the SSOT constants and arithmetic defined in the formulas.

### 2. Frontend Structure
Recommended stack:
- React + TypeScript
- Vite for build
- Vitest (or Jest) for unit tests
- Firebase Hosting for deployment

Suggested component breakdown:
- `AssumptionsForm`
  - Renders all input fields from SSOT `Inputs`
  - Manages validation errors and input state
  - Offers `requestsMode` and `egressMode` toggles
  - Model dropdown uses the SSOT model pricing table
- `CostBreakdown`
  - Displays per-component costs:
    - Compute: inference + orchestration
    - Storage
    - Bandwidth
    - Database
  - Displays `TotalMonthlyCost_USD_month` prominently
- `RecommendationPanel` (optional section)
  - Computes totals for all models and shows cheapest option and its total
- `App`
  - Composes the above components
  - Calls pricing engine with validated inputs

### 3. State Management Approach
Use React state management via `useReducer` (preferred for classroom defense because it is explicit and predictable).

Reducer state must include:
- `inputs` (all SSOT inputs)
- `errors` (map of field -> error message)
- `calculated` (optional cached result, or always compute in render via `useMemo`)

Computation strategy:
- When inputs are valid, compute pricing using `useMemo`:
  - inputs -> `calculateCosts(inputs, selectedModel)`
- For recommendation, compute using pure function:
  - inputs -> `recommendCheapestModel(inputs)`

### 4. Pricing Engine Design
Implementation plan for SSOT formulas:
1. Create `src/pricing/constants.ts`
   - model pricing table and unit economics constants from SSOT
2. Create `src/pricing/types.ts`
   - TS types for Inputs and Output structures
3. Create `src/pricing/formulas/*`
   - One file per formula category (requests/tokens/inference/orchestration/storage/database/egress)
4. Create `src/pricing/calculateCosts.ts`
   - Orchestrates formula calls and returns the full output structure
5. Create `src/pricing/recommendCheapestModel.ts`
   - Iterates over all models and selects the lowest deterministic total

Validation design:
- Create `src/validation/validateInputs.ts`
  - Checks every numeric invariant from `SSOT.md Edge Cases`
  - Ensures selected `modelId` exists in pricing table
  - Ensures enum values are valid

Rounding/formatting:
- Pure pricing functions must return raw numeric values (not strings).
- UI formatting must use:
  - currency formatting to 2 decimal places for display
- This keeps tests aligned with arithmetic and UI tests focused on rendering/consistency.

### 5. Firebase Deployment Approach
Assumption:
- Pricing runs client-side, so Firebase Hosting can serve the static app.

Steps:
1. Build the Vite app (`npm run build`)
2. Deploy to Firebase Hosting
3. Ensure a `firebase.json` exists for hosting

Firebase files/config expected:
- `firebase.json`
- `.firebaserc`
- hosting configuration pointing to Vite build output directory

### 6. Suggested Folder Structure (production-style)
Proposed tree (names are illustrative but should be consistent):
```
src/
  components/
    AssumptionsForm.tsx
    CostBreakdown.tsx
    RecommendationPanel.tsx
  pricing/
    constants.ts
    types.ts
    calculateCosts.ts
    recommendCheapestModel.ts
    formulas/
      requests.ts
      tokens.ts
      inference.ts
      orchestration.ts
      storage.ts
      database.ts
      egress.ts
  validation/
    validateInputs.ts
  utils/
    formatCurrency.ts
docs/ (already created)
tests/
  pricing/
    pricingEngine.test.ts (or multiple files)
```

### 7. Step-by-Step Development Milestones
Milestone 1 — Repo & scaffolding
- Create Vite React + TypeScript project
- Add test runner (Vitest)
- Add base UI layout and wiring

Milestone 2 — Types and constants per SSOT
- Implement `pricing/constants.ts` with SSOT pricing tables
- Implement `types.ts` for inputs and outputs

Milestone 3 — Pure pricing engine (no UI yet)
- Implement formula functions and aggregator exactly per SSOT
- Ensure results for the SSOT sample cases match expected numerical outputs

Milestone 4 — Unit tests (math correctness guarantee)
- Implement unit tests for every formula function
- Add invalid input tests for validation module

Milestone 5 — UI form + validation
- Implement `AssumptionsForm` rendering all fields + validation feedback

Milestone 6 — UI cost breakdown
- Implement `CostBreakdown` to render per-component and total outputs

Milestone 7 — Recommendation feature
- Implement `RecommendationPanel` and ensure deterministic cheapest-model selection

Milestone 8 — Firebase hosting prep
- Add `firebase.json`, `.firebaserc`, and deployment scripts
- Run production build locally to verify it deploys successfully

Milestone 9 — Final verification
- Ensure:
  - all unit tests pass
  - app builds
  - UI calculation consistency tests (rendered outputs match engine)

