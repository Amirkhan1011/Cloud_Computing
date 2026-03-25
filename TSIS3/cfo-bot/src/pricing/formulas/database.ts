import { DATABASE } from '../constants'

export function computeDatabaseCost(params: {
  N_monthly_requests: number
  r_reads_per_request: number
  w_writes_per_request: number
  G_db_storage_GB_month: number
}): {
  readCostUSD: number
  writeCostUSD: number
  storageCostUSD: number
  totalUSD: number
} {
  const { N_monthly_requests, r_reads_per_request, w_writes_per_request, G_db_storage_GB_month } = params

  const DB_reads_month = N_monthly_requests * r_reads_per_request
  const DB_writes_month = N_monthly_requests * w_writes_per_request

  const readCostUSD = (DB_reads_month / 100_000) * DATABASE.P_db_read_per_100k
  const writeCostUSD = (DB_writes_month / 100_000) * DATABASE.P_db_write_per_100k
  const storageCostUSD = G_db_storage_GB_month * DATABASE.P_db_storage_per_GB_month

  return {
    readCostUSD,
    writeCostUSD,
    storageCostUSD,
    totalUSD: readCostUSD + writeCostUSD + storageCostUSD,
  }
}

