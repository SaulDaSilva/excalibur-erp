import { apiGet } from "../../lib/api";
import { listStock } from "../inventario/api";
import type { DashboardSummaryResponse } from "./types";
import type { DashboardStockVariant } from "./types";

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

export async function getDashboardStockByVariant(limit = 10): Promise<DashboardStockVariant[]> {
  const response = await listStock({
    page: 1,
    pageSize: limit,
    q: "",
    onlyActive: true,
    productId: null,
    variantId: null,
  });
  return response.results;
}
