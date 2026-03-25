## CFO Bot (Cloud Economics) & Agentic Architecture — Test Specification (Phase 2)

### Basis
This test specification is based strictly on `docs/SSOT.md` and must ensure that the CFO Bot calculator’s math is **accurate, deterministic, and verifiable**.

### Test Philosophy
1. **Pure function testing first**
   - All pricing formulas are implemented as pure functions; tests validate each formula and the final aggregation.
2. **Input validation is tested**
   - Invalid numeric inputs must be rejected consistently.
3. **UI consistency**
   - Given valid inputs, UI outputs must match pricing engine outputs (within the same rounding rules).
4. **No magic-number tests**
   - Expected values in tests derive from SSOT formulas and constants.

### Test Scope
The following must have unit tests:
1. Monthly requests derivation
2. Monthly tokens computations
3. Inference cost (input, output, total)
4. Orchestration serverless compute cost (invocation and runtime)
5. Compute total aggregation
6. Storage cost formula
7. Database cost (reads, writes, storage; plus total)
8. Bandwidth cost
   - manual egress
   - derived-from-tokens egress
9. Grand total aggregation
10. Cheapest-model recommendation selection
11. Input validation rules from SSOT Edge Cases

### Unit Tests — Pricing Formulas
All numeric tests should use deterministic arithmetic. If floating-point comparison is needed, use a small tolerance (for example `abs(actual - expected) < 1e-9`), and keep expected values based on SSOT arithmetic.

#### A) Requests derivation
Test cases:
1. `derivedFromUsers` default scenario
   - Input: `U_users=1000`, `R_day_per_user=20`, `D_days_per_month=30`
   - Expected: `N_monthly_requests = 600000`
2. `manualMonthlyRequests`
   - Input: `requestsMode=manualMonthlyRequests`, `N_monthly_requests=12345`
   - Expected: `N_monthly_requests = 12345`

Boundary tests:
- `U_users=0` => `N_monthly_requests=0` (when derived)
- `R_day_per_user=0` => `N_monthly_requests=0`

#### B) Monthly token computations
Test cases (using defaults from SSOT):
1. With `N_monthly_requests=600000`, `T_in_tokens=400`, `T_out_tokens=800`
   - Expected:
     - `T_in_month = 240000000`
     - `T_out_month = 480000000`

Edge tests:
- `T_in_tokens=0` => `T_in_month=0`
- `T_out_tokens=0` => `T_out_month=0`

#### C) Inference cost
Test cases using defaults:
1. For `modelA`:
   - Expected `InferenceCost_USD_month = 324` exactly (from SSOT arithmetic)
2. For `modelB`:
   - Expected `InferenceCost_USD_month = 108`
3. For `modelC`:
   - Expected `InferenceCost_USD_month = 144`

Formula component tests (if implemented separately):
- Input token cost and output token cost must sum to the total.

Edge tests:
- If `T_in_month=0`, inference input cost must be 0.
- If `T_out_month=0`, inference output cost must be 0.

#### D) Orchestration serverless compute cost
Using SSOT constants and default `N=600000`:
Expected component values:
1. Invocation cost:
   - `InvocationCost_USD_month = 0.12`
2. Runtime GB-hours cost:
   - Runtime cost (unrounded) approximately `0.002666666666666?`
3. Total orchestration compute:
   - `OrchestrationComputeCost_USD_month = 0.122666666666667` (unrounded)

Edge tests:
- If `N=0`, orchestration compute cost must be 0.

#### E) Compute total
Expected totals using defaults:
1. For `modelA`:
   - `ComputeCost_USD_month = 324.122666666666667`
2. For `modelB`:
   - `ComputeCost_USD_month = 108.122666666666667`
3. For `modelC`:
   - `ComputeCost_USD_month = 144.122666666666667`

#### F) Storage cost
Test case using defaults:
- `G_storage_GB_month=50`, `P_storage_per_GB_month=0.02`
- Expected `StorageCost_USD_month = 1`

Edge tests:
- `G_storage_GB_month=0` => storage cost = 0

#### G) Database cost
Test cases using defaults:
Inputs:
- `N=600000`, `r=2`, `w=1`, `G_db=10`
- Reads month = 1,200,000
- Writes month = 600,000
Expected:
1. `DBReadCost_USD_month = 0.72`
2. `DBWriteCost_USD_month = 1.08`
3. `DBStorageCost_USD_month = 1.00`
4. `DatabaseCost_USD_month = 2.8`

Edge tests:
- `r_reads_per_request=0` => read cost = 0
- `w_writes_per_request=0` => write cost = 0
- `G_db_storage_GB_month=0` => db storage cost = 0

#### H) Bandwidth / egress cost
Test cases using defaults:
1. Manual egress mode:
   - `E_egress_GB_month=2000`, `FreeEgress_GB=0`, `P_egress_per_GB=0.09`
   - Expected `BandwidthCost_USD_month = 180`
2. Derived-from-tokens mode (same N, T_out_tokens as defaults):
   - `B_out_bytes_per_token=4`
   - `B_overhead_bytes_per_request=1500`
   - Expected derived egress:
     - `E_egress_GB_month = 2.82`
     - `BandwidthCost_USD_month = 0.2538`

Edge tests:
- With derived egress coefficients all zero:
  - `B_out_bytes_per_token=0` and `B_overhead_bytes_per_request=0`
  - Expected `BandwidthCost_USD_month = 0`
- If `E_egress_GB_month <= FreeEgress_GB`, expected cost is 0.

#### I) Grand total aggregation
Expected totals using defaults (unrounded):
1. `modelA`, manual egress:
   - `TotalMonthlyCost_USD_month = 507.922666666667`
2. `modelB`, manual egress:
   - `TotalMonthlyCost_USD_month = 291.922666666667`
3. `modelC`, manual egress:
   - `TotalMonthlyCost_USD_month = 327.922666666667`

Derived egress total:
4. `modelA`, derived egress:
   - `TotalMonthlyCost_USD_month = 328.176466666667`

Zero request scenario:
5. `N_monthly_requests=0`, `G_storage_GB_month=50`, `G_db_storage_GB_month=10`, `E_egress_GB_month=0`
   - Expected:
     - `ComputeCost_USD_month = 0`
     - `StorageCost_USD_month = 1`
     - `DatabaseCost_USD_month = 1`
     - `BandwidthCost_USD_month = 0`
     - `TotalMonthlyCost_USD_month = 2`

### Unit Tests — Recommendation Logic
Test cases:
1. Default assumptions:
   - Expected recommendation with default constants:
   - Cheapest model = `modelB` (expected total approx `291.922666666667`)
2. Tie-breaking:
   - Construct a test where two models have equal unit prices in code (or mock constants)
   - Expected: choose first model in predefined order.

### Unit Tests — Input Validation
Validation tests must cover every rule in SSOT `Edge Cases`.

1. Negative numeric inputs
   - Any input < 0 must be rejected
   - Examples:
     - `U_users=-1`
     - `T_out_tokens=-10`
     - `E_egress_GB_month=-5`
     - `G_db_storage_GB_month=-0.1`
2. Invalid days/month
   - `D_days_per_month <= 0` must be rejected
3. Missing/unknown `modelId`
   - If `modelId` not in pricing table => validation error
4. Enum validation
   - `requestsMode` must be one of allowed values
   - `egressMode` must be one of allowed values

UI should not compute outputs when validation fails.

### UI Calculation Consistency Tests
These tests verify that the UI’s rendered values match the pricing engine for valid inputs.

Test cases:
1. Default inputs with `modelA` and manual egress
   - UI Total should display `507.92` (rounded to 2 decimals)
2. Switch to `modelB`
   - UI Total should display `291.92`
3. Enable derived egress mode
   - UI Total should display `328.18` (rounded to 2 decimals)
4. Zero requests scenario
   - UI Total should display `2.00`

Rounding rule:
- UI displays currency with 2 decimals.
- Engine tests validate raw arithmetic; UI tests validate rounded display.

### Boundary Tests (Robustness)
Use representative large values to ensure calculations remain finite:
1. Very large `U_users` and `R_day_per_user`
   - Expected: output is finite (not `Infinity` or `NaN`)
2. Large token counts
   - Expected: output remains finite and deterministic
3. Large egress
   - Expected: output remains finite and deterministic

### Invalid Input Tests (No Computation)
For each invalid case, assert:
- The pricing engine is not called (or its results are not rendered)
- UI shows the correct validation errors

