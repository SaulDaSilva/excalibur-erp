import { useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { ManualMovementForm } from "../features/inventario/ManualMovementForm";
import { useCreateManualMovement } from "../features/inventario/hooks";
import type { ManualMovementPayload } from "../features/inventario/types";

export function InventarioMovimientoNuevoPage() {
  const navigate = useNavigate();
  const createManualMovement = useCreateManualMovement();

  const handleSubmit = async (payload: ManualMovementPayload) => {
    await createManualMovement.mutateAsync(payload);
    navigate("/inventario/movimientos", { replace: true });
  };

  return (
    <section className="space-y-4">
      <PageHeader
        actions={
          <Button onClick={() => navigate("/inventario/movimientos")}>
            Volver a movimientos
          </Button>
        }
      />

      <ManualMovementForm onSubmit={handleSubmit} loading={createManualMovement.isPending} />
    </section>
  );
}
