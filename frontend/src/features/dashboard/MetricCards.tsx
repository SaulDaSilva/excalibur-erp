import { Card } from "../../components/ui/Card";
import { formatCurrencyUSD } from "./formatters";
import type { Metrics } from "./types";
import styles from "./MetricCards.module.css";

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
  ];

  return (
    <>
      {cards.map((card) => (
        <Card key={card.label} className={styles.card}>
          <p className={styles.label}>{card.label}</p>
          <p className={styles.value}>{card.value}</p>
        </Card>
      ))}

      <Card className={styles.card}>
        <p className={styles.label}>Pares vendidos ultimos 7 dias</p>
        {loading ? (
          <p className={styles.value}>Cargando...</p>
        ) : (
          <div className={styles.badges}>
            <span className={`${styles.badge} ${styles.saleBadge}`}>
              Venta: {metrics?.sold_pairs_last_7_days ?? 0}
            </span>
            <span className={`${styles.badge} ${styles.promoBadge}`}>
              Promocion: {metrics?.promo_pairs_last_7_days ?? 0}
            </span>
          </div>
        )}
      </Card>
    </>
  );
}
