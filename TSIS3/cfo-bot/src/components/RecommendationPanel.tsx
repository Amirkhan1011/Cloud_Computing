import type { ModelRecommendation } from '../pricing/types'
import { formatUSD } from '../utils/formatCurrency'

export type RecommendationPanelProps = {
  recommendation: ModelRecommendation
  selectedModelId: string
}

export default function RecommendationPanel({
  recommendation,
  selectedModelId,
}: RecommendationPanelProps) {
  const cheaper = recommendation.recommendedModelId !== selectedModelId

  return (
    <section className="card" aria-label="Cheaper architecture insight">
      <h2>Recommended Cheaper Option</h2>
      <p className="small">
        Based on the same usage assumptions, the lowest deterministic total across supported models is shown below.
      </p>

      <div className="recommend">
        <div className="recommend-item">
          <div className="recommend-label">Recommended model</div>
          <div className="recommend-value">{recommendation.recommendedModelId}</div>
        </div>
        <div className="recommend-item">
          <div className="recommend-label">Estimated total</div>
          <div className="recommend-value">{formatUSD(recommendation.recommendedTotalMonthlyCostUSD)}</div>
        </div>
      </div>

      {cheaper ? (
        <p className="small">
          Note: your selected model is higher cost under the current assumptions.
        </p>
      ) : (
        <p className="small">
          Note: your selected model is already the cheapest (or tied and selected by SSOT table order).
        </p>
      )}
    </section>
  )
}

