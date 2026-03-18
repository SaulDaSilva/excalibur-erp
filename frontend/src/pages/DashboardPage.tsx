import { Card } from "../components/ui/Card";
import { Notice } from "../components/ui/Notice";
import { PageHeader } from "../components/ui/PageHeader";
import { MetricCards } from "../features/dashboard/MetricCards";
import { PendingOrdersTable } from "../features/dashboard/PendingOrdersTable";
import { StockByVariantCard } from "../features/dashboard/StockByVariantCard";
import { formatDateTime } from "../features/dashboard/formatters";
import { useDashboardStockByVariant, useDashboardSummary } from "../features/dashboard/hooks";
import { toApiError } from "../lib/api";

export function DashboardPage() {
  const summaryQuery = useDashboardSummary();
  const stockByVariantQuery = useDashboardStockByVariant(10);

  return (
    <section className="space-y-6">
      <PageHeader
        subtitle={
          summaryQuery.data?.generated_at
            ? `Actualizado: ${formatDateTime(summaryQuery.data.generated_at)}`
            : undefined
        }
      />

      {summaryQuery.isError && (
        <Card>
          <Notice variant="error" message={toApiError(summaryQuery.error).detail} className="text-sm text-rose-700" />
        </Card>
      )}

      {stockByVariantQuery.isError && (
        <Card>
          <Notice variant="error" message={toApiError(stockByVariantQuery.error).detail} className="text-sm text-rose-700" />
        </Card>
      )}

      {!summaryQuery.isError && (
        <>
          <div className="grid items-stretch gap-6 xl:grid-cols-5">
            <MetricCards loading={summaryQuery.isLoading} metrics={summaryQuery.data?.metrics} />
            <StockByVariantCard loading={stockByVariantQuery.isLoading} rows={stockByVariantQuery.data} />
          </div>
          <PendingOrdersTable loading={summaryQuery.isLoading} orders={summaryQuery.data?.pending_orders ?? []} />
        </>
      )}
    </section>
  );
}
