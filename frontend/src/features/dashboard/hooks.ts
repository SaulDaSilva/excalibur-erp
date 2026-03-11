import { useQuery } from "@tanstack/react-query";

import { getDashboardStockByVariant, getDashboardSummary } from "./api";

export function useDashboardSummary(lowStockThreshold?: number) {
  return useQuery({
    queryKey: ["dashboardSummary", { lowStockThreshold }],
    queryFn: () => getDashboardSummary({ lowStockThreshold }),
  });
}

export function useDashboardStockByVariant(limit = 10) {
  return useQuery({
    queryKey: ["dashboardStockByVariant", { limit }],
    queryFn: () => getDashboardStockByVariant(limit),
  });
}
