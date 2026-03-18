import styles from "../../components/ui/DataTable.module.css";
import { Notice } from "../../components/ui/Notice";
import { PaginationControls } from "../../components/ui/PaginationControls";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableCard } from "../../components/ui/TableCard";
import type { PaginatedResponse } from "../clientes/types";
import type { InventoryMovementRow } from "./types";

function getMovementTypeLabel(movementType: InventoryMovementRow["movement_type"]): string {
  const labels: Record<string, string> = {
    PRODUCTION: "Produccion",
    ADJUSTMENT: "Ajuste",
    SALE: "Venta",
    PROMO: "Promocion",
    REVERSAL_SALE: "Reversion venta",
    REVERSAL_PROMO: "Reversion promocion",
  };
  return labels[movementType] ?? movementType;
}

function getMovementVariant(movementType: InventoryMovementRow["movement_type"]): "success" | "warning" | "error" | "info" | "neutral" {
  const variants: Record<string, "success" | "warning" | "error" | "info" | "neutral"> = {
    PRODUCTION: "success",
    ADJUSTMENT: "warning",
    SALE: "info",
    PROMO: "neutral",
    REVERSAL_SALE: "success",
    REVERSAL_PROMO: "success",
  };
  return variants[movementType] ?? "neutral";
}

function formatMovementDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

type MovimientosTableProps = {
  data: PaginatedResponse<InventoryMovementRow> | undefined;
  page: number;
  pageSize: number;
  onPageChange: (nextPage: number) => void;
  loading: boolean;
};

export function MovimientosTable({ data, page, pageSize, onPageChange, loading }: MovimientosTableProps) {
  const rows = data?.results ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / pageSize));

  return (
    <section className="space-y-3">
      {loading && <Notice variant="info" message="Cargando..." />}
      {!loading && rows.length === 0 && <Notice variant="empty" message="No se encontraron movimientos." />}

      {rows.length > 0 && (
        <TableCard>
          <table className={styles.table}>
            <thead className={styles.head}>
              <tr>
                <th className={styles.th}>Fecha</th>
                <th className={styles.th}>Tipo</th>
                <th className={styles.th}>Cantidad</th>
                <th className={styles.th}>Variante</th>
                <th className={styles.th}>Pedido</th>
                <th className={styles.th}>Nota</th>
              </tr>
            </thead>
            <tbody className={styles.body}>
              {rows.map((row) => (
                <tr key={row.id} className={styles.row}>
                  <td className={styles.td}>{formatMovementDate(row.created_at)}</td>
                  <td className={styles.td}>
                    <StatusBadge label={getMovementTypeLabel(row.movement_type)} variant={getMovementVariant(row.movement_type)} />
                  </td>
                  <td className={styles.td}>
                    <span className={row.quantity_pairs >= 0 ? "font-medium text-emerald-700" : "font-medium text-rose-700"}>
                      {row.quantity_pairs}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.cellStack}>
                      <p className={styles.primaryText}>{row.product_variant.product}</p>
                      <p className={styles.secondaryText}>{row.product_variant.measure_mm}mm</p>
                    </div>
                  </td>
                  <td className={styles.td}>{row.order ?? "-"}</td>
                  <td className={styles.td}>{row.note || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      )}

      <PaginationControls page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </section>
  );
}
