import { StatCard } from "../../components/ui/StatCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { formatCurrencyUSD } from "./formatters";
import type { Metrics } from "./types";
import styles from "./MetricCards.module.css";

type MetricCardsProps = {
  metrics?: Metrics;
  loading?: boolean;
};

function MicroBars({ tone = "blue" }: { tone?: "blue" | "amber" | "slate" }) {
  const palette =
    tone === "amber"
      ? ["bg-amber-200", "bg-amber-300", "bg-amber-400", "bg-amber-300", "bg-amber-200"]
      : tone === "slate"
        ? ["bg-slate-200", "bg-slate-300", "bg-slate-400", "bg-slate-300", "bg-slate-200"]
        : ["bg-blue-200", "bg-blue-300", "bg-[var(--accent)]", "bg-blue-300", "bg-blue-200"];

  const heights = ["h-4", "h-6", "h-8", "h-5", "h-3"];
  return (
    <div className={styles.microBars} aria-hidden="true">
      {palette.map((color, index) => (
        <span key={`${color}-${index}`} className={`${styles.microBar} ${color} ${heights[index]}`} />
      ))}
    </div>
  );
}

export function MetricCards({ metrics, loading = false }: MetricCardsProps) {
  const totalPairs = (metrics?.sold_pairs_last_7_days ?? 0) + (metrics?.promo_pairs_last_7_days ?? 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:col-span-3 xl:grid-cols-3">
      <StatCard
        title="Pedidos pendientes"
        value={loading ? "Cargando..." : String(metrics?.pending_orders_count ?? 0)}
        accent="PP"
        helper={
          <div className={styles.cardHelper}>
            <MicroBars tone="slate" />
            <span className={styles.helperText}>Cola operativa actual</span>
          </div>
        }
      />
      <StatCard
        title="Ventas ultimos 7 dias"
        value={loading ? "Cargando..." : formatCurrencyUSD(metrics?.sales_last_7_days_usd ?? "0.00")}
        accent="USD"
        helper={
          <div className={styles.cardHelper}>
            <MicroBars tone="blue" />
            <span className={styles.helperText}>Facturacion reciente</span>
          </div>
        }
      />
      <StatCard
        title="Pares movidos ultimos 7 dias"
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
