import { useEffect, useState } from "react";

import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { StockTable } from "../features/inventario/StockTable";
import { useStock } from "../features/inventario/hooks";
import { toApiError } from "../lib/api";

const PAGE_SIZE = 10;

export function InventarioStockPage() {
  const [stockPage, setStockPage] = useState(1);
  const [stockSearch, setStockSearch] = useState("");
  const [onlyActive, setOnlyActive] = useState(true);

  const stockQuery = useStock({
    page: stockPage,
    pageSize: PAGE_SIZE,
    q: stockSearch,
    onlyActive,
    productId: null,
    variantId: null,
  });

  useEffect(() => {
    setStockPage(1);
  }, [stockSearch, onlyActive]);

  return (
    <section className="space-y-4">
      <PageHeader subtitle="Consulta el stock actual por variante de producto." />

      <Card>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
          <input
            placeholder="Buscar por producto..."
            value={stockSearch}
            onChange={(event) => setStockSearch(event.target.value)}
          />
          <label className="flex items-center gap-2">
            <input
              className="h-4 w-4 rounded border-slate-300"
              type="checkbox"
              checked={onlyActive}
              onChange={(event) => setOnlyActive(event.target.checked)}
            />
            Solo activos
          </label>
        </div>
      </Card>

      {stockQuery.isError && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {toApiError(stockQuery.error).detail}
        </p>
      )}

      <StockTable
        data={stockQuery.data}
        page={stockPage}
        pageSize={PAGE_SIZE}
        onPageChange={setStockPage}
        loading={stockQuery.isLoading}
      />
    </section>
  );
}
