import styles from "../../components/ui/DataTable.module.css";
import { Notice } from "../../components/ui/Notice";
import { PaginationControls } from "../../components/ui/PaginationControls";
import { TableCard } from "../../components/ui/TableCard";
import type { PaginatedResponse } from "../clientes/types";
import type { StockByVariantRow } from "./types";

type StockTableProps = {
  data: PaginatedResponse<StockByVariantRow> | undefined;
  page: number;
  pageSize: number;
  onPageChange: (nextPage: number) => void;
  loading: boolean;
};

export function StockTable({ data, page, pageSize, onPageChange, loading }: StockTableProps) {
  const rows = data?.results ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / pageSize));

  return (
    <section className="space-y-3">
      {loading && <Notice variant="info" message="Cargando..." />}
      {!loading && rows.length === 0 && <Notice variant="empty" message="No hay registros de stock." />}

      {rows.length > 0 && (
        <TableCard>
          <table className={styles.table}>
            <thead className={styles.head}>
              <tr>
                <th className={styles.th}>Variante</th>
                <th className={styles.th}>Producto</th>
                <th className={styles.th}>Medida</th>
                <th className={styles.th}>Stock</th>
                <th className={styles.th}>Activo</th>
              </tr>
            </thead>
            <tbody className={styles.body}>
              {rows.map((row) => (
                <tr key={row.product_variant_id} className={styles.row}>
                  <td className={styles.td}>{row.product_variant_id}</td>
                  <td className={styles.td}>
                    <div className={styles.cellStack}>
                      <p className={styles.primaryText}>{row.product_name}</p>
                    </div>
                  </td>
                  <td className={styles.td}>{row.measure_mm}mm</td>
                  <td className={styles.td}>{row.stock_pairs}</td>
                  <td className={styles.td}>{row.is_active ? "Si" : "No"}</td>
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
