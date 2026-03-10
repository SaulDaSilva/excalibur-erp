import { useState } from "react";

import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { MetricCards } from "../features/dashboard/MetricCards";
import { PendingOrdersTable } from "../features/dashboard/PendingOrdersTable";
import { formatDateTime } from "../features/dashboard/formatters";
import { useDashboardSummary } from "../features/dashboard/hooks";
import { toApiError } from "../lib/api";

export function DashboardPage() {
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const summaryQuery = useDashboardSummary(lowStockThreshold);

  return (
    <section className="space-y-4">
      <PageHeader
        subtitle={
          summaryQuery.data?.generated_at
            ? `Actualizado: ${formatDateTime(summaryQuery.data.generated_at)}`
            : undefined
        }
        actions={
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Umbral de stock bajo
            <input
              className="w-20"
              min={0}
              step={1}
              type="number"
              value={lowStockThreshold}
              onChange={(event) => {
                const value = Number(event.target.value);
                setLowStockThreshold(Number.isNaN(value) ? 10 : value);
              }}
            />
          </label>
        }
      />

      {summaryQuery.isError && (
        <Card>
          <p className="text-sm text-rose-700">{toApiError(summaryQuery.error).detail}</p>
        </Card>
      )}

      {!summaryQuery.isError && (
        <>
          <MetricCards loading={summaryQuery.isLoading} metrics={summaryQuery.data?.metrics} />
          <PendingOrdersTable loading={summaryQuery.isLoading} orders={summaryQuery.data?.pending_orders ?? []} />
        </>
      )}
    </section>
  );
}
