import { useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { PedidoForm } from "../features/pedidos/PedidoForm";
import { useCreatePedido } from "../features/pedidos/hooks";
import type { OrderCreatePayload } from "../features/pedidos/types";

export function PedidoNuevoPage() {
  const navigate = useNavigate();
  const createPedido = useCreatePedido();

  const handleSubmit = async (payload: OrderCreatePayload) => {
    await createPedido.mutateAsync(payload);
    navigate("/pedidos", { replace: true });
  };

  return (
    <section className="space-y-4">
      <PageHeader
        actions={
          <Button type="button" onClick={() => navigate("/pedidos")}>
            Volver a pedidos
          </Button>
        }
      />

      <Card className="mx-auto w-full max-w-6xl">
        <PedidoForm onSubmit={handleSubmit} onCancel={() => navigate("/pedidos")} />
      </Card>
    </section>
  );
}
