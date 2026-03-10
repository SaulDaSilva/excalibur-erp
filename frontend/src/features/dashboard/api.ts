import { apiGet } from "../../lib/api";
import type { DashboardSummaryResponse } from "./types";

type DashboardSummaryParams = {
  lowStockThreshold?: number;
};

export function getDashboardSummary(params?: DashboardSummaryParams): Promise<DashboardSummaryResponse> {
  const query = new URLSearchParams();
  if (params?.lowStockThreshold !== undefined) {
    query.set("low_stock_threshold", String(params.lowStockThreshold));
  }

  const queryString = query.toString();
  const path = queryString ? `/api/dashboard/summary/?${queryString}` : "/api/dashboard/summary/";
  return apiGet<DashboardSummaryResponse>(path);
}
