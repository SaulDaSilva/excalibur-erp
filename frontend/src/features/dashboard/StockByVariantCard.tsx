import { Card } from "../../components/ui/Card";
import type { DashboardStockVariant } from "./types";
import styles from "./StockByVariantCard.module.css";

type StockByVariantCardProps = {
  rows?: DashboardStockVariant[];
  loading?: boolean;
};

export function StockByVariantCard({ rows = [], loading = false }: StockByVariantCardProps) {
  return (
    <Card className={styles.root}>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>Stock por variante</p>
          <p className={styles.subtitle}>Vista rapida del stock actual por producto y medida.</p>
        </div>
      </div>

      {loading && <p className={styles.feedback}>Cargando...</p>}

      {!loading && rows.length === 0 && (
        <p className={styles.feedback}>No hay variantes para mostrar.</p>
      )}

      {!loading && rows.length > 0 && (
        <div className={styles.list}>
          {rows.map((row) => (
            <div key={row.product_variant_id} className={styles.row}>
              <div className={styles.info}>
                <p className={styles.name}>
                  {row.product_name} {row.measure_mm}mm
                </p>
              </div>
              <div className={styles.stock}>
                <p className={styles.stockValue}>{row.stock_pairs}</p>
                <p className={styles.stockLabel}>pares</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
