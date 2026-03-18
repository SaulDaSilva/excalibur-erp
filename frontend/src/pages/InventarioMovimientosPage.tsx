import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { Notice } from "../components/ui/Notice";
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
    <section className="space-y-6">
      <PageHeader
        subtitle="Revise el historial de movimientos y cree ajustes manuales."
        actions={
          <Button variant="primary" onClick={() => navigate("/inventario/nuevo-movimiento")}>
            Nuevo movimiento
          </Button>
        }
      />

      {variantesQuery.isError && (
        <Notice variant="error" message={toApiError(variantesQuery.error).detail} />
      )}

      <MovementFilters value={movementFilters} variantes={variantOptions} onChange={setMovementFilters} />

      {movimientosQuery.isError && (
        <Notice variant="error" message={toApiError(movimientosQuery.error).detail} />
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
