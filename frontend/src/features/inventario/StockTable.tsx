import { Card } from "../../components/ui/Card";
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
      <h3 className="text-base font-semibold text-slate-900">Stock</h3>
      {loading && <p>Cargando...</p>}
      {!loading && rows.length === 0 && (
        <Card>
          <p className="text-sm text-slate-600">No hay registros de stock.</p>
        </Card>
      )}

      {rows.length > 0 && (
        <TableCard>
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Variante</th>
                <th className="px-4 py-3 text-left font-medium">Producto</th>
                <th className="px-4 py-3 text-left font-medium">Medida</th>
                <th className="px-4 py-3 text-left font-medium">Stock</th>
                <th className="px-4 py-3 text-left font-medium">Activo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
              {rows.map((row) => (
                <tr key={row.product_variant_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{row.product_variant_id}</td>
                  <td className="px-4 py-3">{row.product_name}</td>
                  <td className="px-4 py-3">{row.measure_mm}mm</td>
                  <td className="px-4 py-3">{row.stock_pairs}</td>
                  <td className="px-4 py-3">{row.is_active ? "Si" : "No"}</td>
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
