import type { MonthlyCostsOutput } from '../pricing/types'
import { formatUSD } from '../utils/formatCurrency'

export type CostBreakdownProps = {
  result: MonthlyCostsOutput
}

export default function CostBreakdown({ result }: CostBreakdownProps) {
  const { compute, storageCostUSD, bandwidthCostUSD, database, totalMonthlyCostUSD } = result

  return (
    <section className="card" aria-label="Cost breakdown">
      <h2>Estimated Monthly Cloud Cost</h2>

      <div className="kpi" data-testid="total-monthly-cost">
        <div className="kpi-label">Total (USD/month)</div>
        <div className="kpi-value">{formatUSD(totalMonthlyCostUSD)}</div>
      </div>

      <div className="breakdown">
        <div className="breakdown-col">
          <h3>Compute</h3>
          <div className="row">
            <span>Inference (tokens)</span>
            <span>{formatUSD(compute.inferenceCostUSD)}</span>
          </div>
          <div className="row">
            <span>Orchestration (serverless)</span>
            <span>{formatUSD(compute.orchestrationComputeCostUSD)}</span>
          </div>
          <div className="row total">
            <span>Compute subtotal</span>
            <span>{formatUSD(compute.totalUSD)}</span>
          </div>
        </div>

        <div className="breakdown-col">
          <h3>Storage</h3>
          <div className="row total">
            <span>Object storage</span>
            <span>{formatUSD(storageCostUSD)}</span>
          </div>
        </div>

        <div className="breakdown-col">
          <h3>Bandwidth</h3>
          <div className="row total">
            <span>Network egress</span>
            <span>{formatUSD(bandwidthCostUSD)}</span>
          </div>
          <div className="small">
            Derived egress: {result.derived.E_egress_GB_month.toFixed(2)} GB/month
          </div>
        </div>

        <div className="breakdown-col">
          <h3>Database</h3>
          <div className="row">
            <span>Reads</span>
            <span>{formatUSD(database.readCostUSD)}</span>
          </div>
          <div className="row">
            <span>Writes</span>
            <span>{formatUSD(database.writeCostUSD)}</span>
          </div>
          <div className="row">
            <span>Storage</span>
            <span>{formatUSD(database.storageCostUSD)}</span>
          </div>
          <div className="row total">
            <span>Database subtotal</span>
            <span>{formatUSD(database.totalUSD)}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

