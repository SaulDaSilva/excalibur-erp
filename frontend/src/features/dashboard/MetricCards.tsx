import { StatCard } from "../../components/ui/StatCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { formatCurrencyUSD } from "./formatters";
import type { Metrics } from "./types";
import styles from "./MetricCards.module.css";

type MetricCardsProps = {
  metrics?: Metrics;
  loading?: boolean;
};

export function MetricCards({ metrics, loading = false }: MetricCardsProps) {
  const totalPairs = (metrics?.sold_pairs_last_7_days ?? 0) + (metrics?.promo_pairs_last_7_days ?? 0);

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:col-span-3 xl:grid-cols-3">
      <StatCard
        title="Pedidos pendientes"
        value={loading ? "Cargando..." : String(metrics?.pending_orders_count ?? 0)}
        accent="PP"
      />
      <StatCard
        title="Ventas ultimos 7 dias (USD)"
        value={loading ? "Cargando..." : formatCurrencyUSD(metrics?.sales_last_7_days_usd ?? "0.00")}
        accent="USD"
      />
      <StatCard
        title="Pares vendidos ultimos 7 dias"
        value={loading ? "Cargando..." : totalPairs}
        accent="7D"
        helper={
          !loading && (
            <div className={styles.helper}>
              <StatusBadge label={`Venta ${metrics?.sold_pairs_last_7_days ?? 0}`} variant="info" />
              <StatusBadge label={`Promocion ${metrics?.promo_pairs_last_7_days ?? 0}`} variant="warning" />
            </div>
          )
        }
      />
    </div>
  );
}
