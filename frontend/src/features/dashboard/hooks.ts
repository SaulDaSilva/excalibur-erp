import { useQuery } from "@tanstack/react-query";

import { getDashboardSummary } from "./api";

export function useDashboardSummary(lowStockThreshold?: number) {
  return useQuery({
    queryKey: ["dashboardSummary", { lowStockThreshold }],
    queryFn: () => getDashboardSummary({ lowStockThreshold }),
  });
}
