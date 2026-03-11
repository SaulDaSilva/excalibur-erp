import { useEffect, useState } from "react";

import { FilterPanel, filterPanelStyles } from "../components/ui/FilterPanel";
import { Notice } from "../components/ui/Notice";
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

      <FilterPanel title="Filtros" subtitle="Busca stock por producto y limita el resultado a variantes activas si lo necesitas.">
          <input
            placeholder="Buscar por producto..."
            value={stockSearch}
            onChange={(event) => setStockSearch(event.target.value)}
          />
          <label className={filterPanelStyles.checkbox}>
            <input
              className={filterPanelStyles.checkboxInput}
              type="checkbox"
              checked={onlyActive}
              onChange={(event) => setOnlyActive(event.target.checked)}
            />
            Solo activos
          </label>
      </FilterPanel>

      {stockQuery.isError && (
        <Notice variant="error" message={toApiError(stockQuery.error).detail} />
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
