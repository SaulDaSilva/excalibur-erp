import { Card } from "../../components/ui/Card";
import { PaginationControls } from "../../components/ui/PaginationControls";
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
      <h3 className="text-base font-semibold text-slate-900">Movimientos</h3>
      {loading && <p>Cargando...</p>}
      {!loading && rows.length === 0 && (
        <Card>
          <p className="text-sm text-slate-600">No se encontraron movimientos.</p>
        </Card>
      )}

      {rows.length > 0 && (
        <TableCard>
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Fecha</th>
                <th className="px-4 py-3 text-left font-medium">Tipo</th>
                <th className="px-4 py-3 text-left font-medium">Cantidad</th>
                <th className="px-4 py-3 text-left font-medium">Variante</th>
                <th className="px-4 py-3 text-left font-medium">Pedido</th>
                <th className="px-4 py-3 text-left font-medium">Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{new Date(row.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">{getMovementTypeLabel(row.movement_type)}</td>
                  <td className="px-4 py-3">{row.quantity_pairs}</td>
                  <td className="px-4 py-3">
                    {row.product_variant.product} - {row.product_variant.measure_mm}mm
                  </td>
                  <td className="px-4 py-3">{row.order ?? "-"}</td>
                  <td className="px-4 py-3">{row.note || "-"}</td>
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
