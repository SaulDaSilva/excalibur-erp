import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { MovementFilters, type MovementFilterState } from "../features/inventario/MovementFilters";
import { MovimientosTable } from "../features/inventario/MovimientosTable";
import { useMovimientos, useVariantesForInventario } from "../features/inventario/hooks";
import { toApiError } from "../lib/api";

const PAGE_SIZE = 10;

export function InventarioMovimientosPage() {
  const navigate = useNavigate();
  const [movementPage, setMovementPage] = useState(1);
  const [movementFilters, setMovementFilters] = useState<MovementFilterState>({
    movementType: "",
    variantId: null,
    orderId: null,
    from: "",
    to: "",
  });

  const movimientosQuery = useMovimientos({
    page: movementPage,
    pageSize: PAGE_SIZE,
    movementType: movementFilters.movementType,
    variantId: movementFilters.variantId,
    orderId: movementFilters.orderId,
    from: movementFilters.from,
    to: movementFilters.to,
  });
  const variantesQuery = useVariantesForInventario();
  const variantOptions = variantesQuery.data ?? [];

  useEffect(() => {
    setMovementPage(1);
  }, [movementFilters]);

  return (
    <section className="space-y-4">
      <PageHeader
        subtitle="Revise el historial de movimientos y cree ajustes manuales."
        actions={
          <Button variant="primary" onClick={() => navigate("/inventario/nuevo-movimiento")}>
            Nuevo movimiento
          </Button>
        }
      />

      {variantesQuery.isError && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {toApiError(variantesQuery.error).detail}
        </p>
      )}

      <MovementFilters value={movementFilters} variantes={variantOptions} onChange={setMovementFilters} />

      {movimientosQuery.isError && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {toApiError(movimientosQuery.error).detail}
        </p>
      )}

      <MovimientosTable
        data={movimientosQuery.data}
        page={movementPage}
        pageSize={PAGE_SIZE}
        onPageChange={setMovementPage}
        loading={movimientosQuery.isLoading}
      />
    </section>
  );
}
