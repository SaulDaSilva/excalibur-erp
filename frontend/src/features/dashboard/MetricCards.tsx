import { Card } from "../../components/ui/Card";
import { formatCurrencyUSD } from "./formatters";
import type { Metrics } from "./types";

type MetricCardsProps = {
  metrics?: Metrics;
  loading?: boolean;
};

export function MetricCards({ metrics, loading = false }: MetricCardsProps) {
  const cards = [
    {
      label: "Pedidos pendientes",
      value: loading ? "Cargando..." : String(metrics?.pending_orders_count ?? 0),
    },
    {
      label: "Ventas ultimos 7 dias (USD)",
      value: loading ? "Cargando..." : formatCurrencyUSD(metrics?.sales_last_7_days_usd ?? "0.00"),
    },
    {
      label: "Stock total (pares)",
      value: loading ? "Cargando..." : String(metrics?.current_stock_pairs ?? 0),
    },
    {
      label: `Variantes con stock bajo (<${metrics?.low_stock_threshold ?? 10})`,
      value: loading ? "Cargando..." : String(metrics?.low_stock_variants_count ?? 0),
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <p className="text-sm text-slate-600">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
        </Card>
      ))}
    </div>
  );
}
