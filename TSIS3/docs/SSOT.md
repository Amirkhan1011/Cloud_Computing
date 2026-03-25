## CFO Bot (Cloud Economics) & Agentic Architecture — System Specification (SSOT)

### Overview
The **CFO Bot** is a deterministic calculator for estimating **monthly cloud costs** for a **Chat Bot** application. The calculator uses user-provided usage assumptions (users, requests, token sizes, storage, database usage, and outbound traffic) and a **model/provider selection** to compute a per-component and grand-total estimate.

This document is the **Single Source of Truth (SSOT)** for the entire project. The implementation must follow it exactly (same inputs, same formulas, same outputs, same edge-case behavior).

### Functional Requirements
1. **Supported cost components (scope)**
   1. Compute cost
      1. Model inference cost (LLM/token-based)
      2. Server-side orchestration cost (minimal serverless compute per request)
   2. Storage cost (object/document storage for transcripts or conversation history)
   3. Bandwidth / Network egress cost (outbound traffic from the app to end users)
   4. Database tier cost (document reads/writes and database storage)
   5. No other components are included unless explicitly justified and added by updating this SSOT.

2. **User input parameters**
   The UI must allow entering the following inputs (with defaults). All numeric fields must support validation and error messaging.
   - User count: `U_users` (integer, >= 0)
   - Requests/day per user: `R_day_per_user` (float, >= 0)
   - Days/month: `D_days_per_month` (float, > 0, default 30)
   - Requests mode: `requestsMode` (enum)
     - `derivedFromUsers`: derive monthly requests from users/day
     - `manualMonthlyRequests`: use provided monthly requests directly
   - Manual monthly requests: `N_monthly_requests` (float, >= 0; only required when `requestsMode=manualMonthlyRequests`)
   - Average input tokens per request: `T_in_tokens` (float, >= 0)
   - Average output tokens per request: `T_out_tokens` (float, >= 0)
   - Model/provider selection: `modelId` (enum)
     - At minimum, include the predefined models listed in the pricing constants section below.
   - Storage usage:
     - `G_storage_GB_month` (float, >= 0) measured as GB stored per month
   - Database usage:
     - Document reads per request: `r_reads_per_request` (float, >= 0)
     - Document writes per request: `w_writes_per_request` (float, >= 0)
     - Database storage: `G_db_storage_GB_month` (float, >= 0)
   - Outbound traffic / bandwidth:
     - Egress mode: `egressMode` (enum)
       - `manualGB`: user provides `E_egress_GB_month` directly
       - `derivedFromTokens`: compute egress from tokens using deterministic approximations and user-overridable coefficients
     - Manual egress: `E_egress_GB_month` (float, >= 0)
     - Derived egress coefficients:
       - Bytes per output token: `B_out_bytes_per_token` (float, >= 0)
       - Per-request protocol overhead bytes (headers + metadata): `B_overhead_bytes_per_request` (float, >= 0)

3. **Model/provider pricing**
   - The app must include a pricing table mapping `modelId` to:
     - `P_in_per_1M` (USD per 1 million input tokens)
     - `P_out_per_1M` (USD per 1 million output tokens)
   - The calculator must use the selected model's unit prices in all inference-related formulas.

4. **Exact mathematical pricing logic**
   - Every cost component must be computed from explicit formulas.
   - Monthly total cost must be computed as:
     - `TotalMonthlyCost = ComputeCost + StorageCost + BandwidthCost + DatabaseCost`
   - The UI must display:
     - Cost by category: Compute, Storage, Bandwidth, Database
     - Grand total: TotalMonthlyCost
     - All currency values in `USD` (single currency for this academic project).

5. **Validation and graceful handling of edge cases**
   - Negative values in any numeric input must trigger validation errors and must not produce numeric outputs.
   - If `N_monthly_requests = 0`, inference/compute/database read-write components must be `0` (storage and database storage still follow their storage inputs).
   - If `T_in_tokens = 0` and/or `T_out_tokens = 0`, corresponding inference sub-cost must be `0`.
   - If `egressMode=derivedFromTokens`, derived egress must remain `>= 0` and use only deterministic arithmetic.

6. **Optional recommendation section**
   - Provide a "recommended cheaper option" section that compares `TotalMonthlyCost` across all supported `modelId` options.
   - Recommendation must be deterministic:
     - Choose the model with the minimum `TotalMonthlyCost`.
     - If multiple models tie exactly (to the floating-point comparison the implementation uses), select the first in the predefined table order and show a note that costs are equal.

### Non-Functional Requirements
1. **Deterministic business logic**
   - All pricing computations must be implemented as pure functions (no I/O, no randomness).
   - Given the same inputs, outputs must match exactly.

2. **Modular code structure**
   - Pricing logic must be separated into reusable, testable modules:
     - LLM/token pricing
     - Requests derivation
     - Inference compute cost
     - Serverless/orchestration compute cost
     - Storage cost
     - Database cost
     - Egress/bandwidth cost

3. **Testability**
   - Each formula must have an associated unit test.
   - Unit tests must validate both:
     - correctness on representative values
     - boundary/edge cases and invalid inputs (as defined below)

4. **Production-style folder structure**
   - The frontend must be structured for classroom defense:
     - clear separation between UI components and pricing engine
     - a dedicated directory for pricing constants and types

5. **Firebase-ready**
   - The UI must be straightforward to deploy via Firebase Hosting.
   - Backend is optional; if present, it must be minimal and used only for non-pricing features (this SSOT assumes pricing is calculated client-side using pure functions).

### Inputs
All inputs are numeric except enums. Defaults are provided for demo purposes.

#### Core usage inputs
- `U_users` (default 1000)
- `requestsMode` (default `derivedFromUsers`)
- `R_day_per_user` (default 20)
- `D_days_per_month` (default 30)
- `N_monthly_requests` (default 600000; used when `requestsMode=manualMonthlyRequests`)
- `T_in_tokens` (default 400)
- `T_out_tokens` (default 800)

#### Model selection
- `modelId` (default `modelA`)

#### Storage inputs
- `G_storage_GB_month` (default 50)

#### Database inputs
- `r_reads_per_request` (default 2)
- `w_writes_per_request` (default 1)
- `G_db_storage_GB_month` (default 10)

#### Egress inputs
- `egressMode` (default `manualGB`)
- `E_egress_GB_month` (default 2000)
- `B_out_bytes_per_token` (default 4)
- `B_overhead_bytes_per_request` (default 1500)

#### Units
- Tokens are unitless token counts.
- Bandwidth is measured in `GB` using decimal GB: `1 GB = 1e9 bytes`.
- Currency is `USD`.

### Outputs
The app must output:
- `ComputeCost_USD_month`
  - `InferenceCost_USD_month`
  - `OrchestrationComputeCost_USD_month`
- `StorageCost_USD_month`
- `BandwidthCost_USD_month`
- `DatabaseCost_USD_month`
- `TotalMonthlyCost_USD_month`
- Optional:
  - `RecommendedModel` (modelId)
  - `RecommendedTotalMonthlyCost_USD_month`

### Pricing Constants (Default Unit Economics)
These constants define unit prices used by the calculator. They must be treated as configuration constants in code.

#### LLM unit token prices (USD per 1 million tokens)
- `modelA`
  - `P_in_per_1M = 0.15`
  - `P_out_per_1M = 0.60`
- `modelB`
  - `P_in_per_1M = 0.05`
  - `P_out_per_1M = 0.20`
- `modelC`
  - `P_in_per_1M = 0.10`
  - `P_out_per_1M = 0.25`

#### Serverless/orchestration compute unit prices (USD)
The app assumes a minimal serverless layer that performs request orchestration and calls the selected model.

Inputs controlling this are the average runtime and memory (entered by the user if we expose them). For this SSOT, they are fixed defaults to keep UI simple and classroom-friendly:
- `P_serverless_invocation = 0.0000002` USD per invocation
- `P_serverless_gb_hour = 0.000016` USD per GB-hour
- `S_seconds_per_request = 2` seconds average serverless runtime per request
- `M_memory_GB = 0.5` GB allocated average runtime memory

Compute formula uses these constants.

#### Storage unit price
- `P_storage_per_GB_month = 0.02` USD per GB-month

#### Database unit prices
- Firestore-like tier modeled as:
  - `P_db_read_per_100k = 0.06` USD per 100,000 reads
  - `P_db_write_per_100k = 0.18` USD per 100,000 writes
  - `P_db_storage_per_GB_month = 0.10` USD per GB-month

#### Bandwidth / egress unit price
This SSOT uses a simple linear model with optional free allowance:
- `FreeEgress_GB = 0` (default 0, no free tier)
- `P_egress_per_GB = 0.09` USD per GB

If you later choose a non-zero free tier, it must be set in constants and described here.

### Pricing Formulas
All formulas must be implemented exactly as written below.

#### Step 1: Monthly request count
Let:
- `D = D_days_per_month`
- `U = U_users`
- `R = R_day_per_user`
- `N_manual = N_monthly_requests`

Then:
1. If `requestsMode = derivedFromUsers`:
   - `N_monthly_requests = U * R * D`
2. If `requestsMode = manualMonthlyRequests`:
   - `N_monthly_requests = N_manual`

Constraints:
- `N_monthly_requests >= 0`
- If input validation fails, calculation is not performed and outputs are not displayed.

#### Step 2: Monthly tokens
- Monthly input tokens:
  - `T_in_month = N_monthly_requests * T_in_tokens`
- Monthly output tokens:
  - `T_out_month = N_monthly_requests * T_out_tokens`

#### Step 3: Inference cost (selected model)
Let selected model's unit prices be:
- `P_in_per_1M`
- `P_out_per_1M`

Inference cost:
1. Input token cost:
   - `InferenceInputCost_USD_month = (T_in_month / 1,000,000) * P_in_per_1M`
2. Output token cost:
   - `InferenceOutputCost_USD_month = (T_out_month / 1,000,000) * P_out_per_1M`
3. Total inference cost:
   - `InferenceCost_USD_month = InferenceInputCost_USD_month + InferenceOutputCost_USD_month`

#### Step 4: Orchestration serverless compute cost
Let:
- `N = N_monthly_requests`
- `P_serverless_invocation`
- `P_serverless_gb_hour`
- `S = S_seconds_per_request`
- `M = M_memory_GB`
- seconds per hour `H = 3600`

1. Invocation cost:
   - `InvocationCost_USD_month = N * P_serverless_invocation`
2. Runtime cost:
   - runtime GB-hours per request = `(M * (S / H))`
   - `RuntimeCost_USD_month = N * (M * (S / 3600)) * P_serverless_gb_hour`
3. Total orchestration compute:
   - `OrchestrationComputeCost_USD_month = InvocationCost_USD_month + RuntimeCost_USD_month`

#### Step 5: Compute total
- `ComputeCost_USD_month = InferenceCost_USD_month + OrchestrationComputeCost_USD_month`

#### Step 6: Storage cost
- `StorageCost_USD_month = G_storage_GB_month * P_storage_per_GB_month`

#### Step 7: Database cost (reads/writes + storage)
Let:
- `r = r_reads_per_request`
- `w = w_writes_per_request`
- `G_db = G_db_storage_GB_month`
- `N = N_monthly_requests`

1. Reads:
   - `DB_reads_month = N * r`
   - `DBReadCost_USD_month = (DB_reads_month / 100,000) * P_db_read_per_100k`
2. Writes:
   - `DB_writes_month = N * w`
   - `DBWriteCost_USD_month = (DB_writes_month / 100,000) * P_db_write_per_100k`
3. Storage:
   - `DBStorageCost_USD_month = G_db * P_db_storage_per_GB_month`
4. Total:
   - `DatabaseCost_USD_month = DBReadCost_USD_month + DBWriteCost_USD_month + DBStorageCost_USD_month`

#### Step 8: Bandwidth / egress cost
Let:
- `P_egress_per_GB`
- `FreeEgress_GB`

If `egressMode = manualGB`:
- `E_egress_GB_month = user-provided E_egress_GB_month`

If `egressMode = derivedFromTokens`:
Let:
- `B_token = B_out_bytes_per_token`
- `B_over = B_overhead_bytes_per_request`
- output tokens per request `T_out_tokens`
- requests `N`

Assume outbound bytes are dominated by response payload:
- `EgressBytes_month = N * (T_out_tokens * B_token + B_over)`
- `E_egress_GB_month = EgressBytes_month / 1,000,000,000`

Then cost:
- `BillableEgress_GB = max(0, E_egress_GB_month - FreeEgress_GB)`
- `BandwidthCost_USD_month = BillableEgress_GB * P_egress_per_GB`

#### Step 9: Grand total
- `TotalMonthlyCost_USD_month = ComputeCost_USD_month + StorageCost_USD_month + DatabaseCost_USD_month + BandwidthCost_USD_month`

### Edge Cases (Must be Implemented)
1. **Invalid numeric inputs**
   - Any numeric input < 0 must show an error and prevent calculation.
   - `D_days_per_month <= 0` must show error.
   - If `requestsMode` is `manualMonthlyRequests`, `N_monthly_requests` must be >= 0.
2. **Zero requests**
   - If `N_monthly_requests = 0`:
     - `T_in_month = 0`, `T_out_month = 0`
     - `InferenceCost_USD_month = 0`
     - `OrchestrationComputeCost_USD_month = 0`
     - `DatabaseCost_USD_month` includes only storage cost (`DBReadCost` and `DBWriteCost` become 0)
3. **Zero tokens**
   - If `T_out_tokens = 0`:
     - inference output token cost becomes 0
     - derived egress becomes only overhead bytes (or 0 if overhead also 0)
4. **Derived egress with zero coefficients**
   - If `B_out_bytes_per_token = 0` and `B_overhead_bytes_per_request = 0`, then derived egress becomes 0.
5. **Currency display and rounding**
   - Implementation must display currency with 2 decimal places.
   - Internally, computations should use full precision; final display rounds.
6. **Model selection missing/unknown**
   - If `modelId` is not in the pricing table, show an error and do not compute inference cost.

### Architecture Constraints
1. **Frontend**
   - A clean modern web UI with:
     - an input form for assumptions
     - a model/provider selection dropdown
     - category breakdown cards/tables
     - total monthly cost prominently displayed
     - optional recommendation section
   - All calculations must call the deterministic pricing engine.

2. **Backend**
   - Backend is optional and must be minimal.
   - This SSOT assumes the CFO Bot performs pricing calculations client-side using pure functions.

3. **Modular code structure**
   - Pricing engine must be organized so each formula is unit-testable.

4. **Firebase deployment readiness**
   - Must support static hosting via Firebase Hosting.
   - If a serverless backend is added, it must not be required for the core cost calculation.

### UI/UX Requirements
1. **Input form**
   - Fields for every input defined in `Inputs`.
   - Default values pre-filled.
   - Field labels must be clear and include units (e.g., `GB/month`, `tokens/request`).

2. **Model/provider dropdown**
   - Dropdown selection based on the `modelId` pricing table.

3. **Cost breakdown**
   - Display costs in separate sections:
     - Compute (with inference and orchestration sub-breakdown)
     - Storage
     - Bandwidth
     - Database
   - Show `TotalMonthlyCost_USD_month` as the final total.

4. **Validation**
   - Inline validation errors next to fields.
   - Do not compute outputs when inputs are invalid.

5. **Graceful edge-case handling**
   - If outputs are zero due to input zeros, show zeros with explanations (e.g., "No requests => inference cost = 0").

6. **Optional recommendation**
   - Show which `modelId` yields the lowest total, given current assumptions.

### Acceptance Criteria
The project is considered complete only if all criteria below are met:
1. **SSOT completeness**
   - The pricing logic in code matches the formulas in this SSOT exactly.
2. **Determinism**
   - For a given set of inputs, the calculated outputs are deterministic and match expected values from unit tests.
3. **Per-component output**
   - The UI displays Compute, Storage, Bandwidth, Database, and Total costs.
4. **Edge-case correctness**
   - Negative inputs are rejected.
   - Zero requests results in zero inference/compute/database reads/writes while storage/database storage remains.
5. **Test coverage**
   - Unit tests exist for every formula component:
     - requests derivation
     - monthly tokens
     - inference cost
     - orchestration cost
     - storage cost
     - database reads/writes/storage cost
     - egress (manual and derived modes)
     - total aggregation
6. **Firebase readiness**
   - The frontend can be built and deployed to a public Firebase URL (even if pricing runs client-side).

