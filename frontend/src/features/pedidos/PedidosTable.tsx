import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { TableCard } from "../../components/ui/TableCard";
import type { Pedido } from "./types";

function getStatusLabel(status: Pedido["status"]): string {
  if (status === "PENDING") {
    return "Pendiente";
  }
  if (status === "DISPATCHED") {
    return "Despachado";
  }
  return "Cancelado";
}

type PedidosTableProps = {
  data: Pedido[];
  onDispatch: (pedido: Pedido) => void;
  onCancel: (pedido: Pedido) => void;
  onDelete: (pedido: Pedido) => void;
};

export function PedidosTable({ data, onDispatch, onCancel, onDelete }: PedidosTableProps) {
  if (data.length === 0) {
    return (
      <Card>
        <p className="text-sm text-slate-600">No se encontraron pedidos.</p>
      </Card>
    );
  }

  return (
    <TableCard>
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 text-left font-medium">ID</th>
            <th className="px-4 py-3 text-left font-medium">Creado</th>
            <th className="px-4 py-3 text-left font-medium">Cliente</th>
            <th className="px-4 py-3 text-left font-medium">Estado</th>
            <th className="px-4 py-3 text-left font-medium">Total pares</th>
            <th className="px-4 py-3 text-left font-medium">Total venta</th>
            <th className="px-4 py-3 text-left font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
          {data.map((pedido) => (
            <tr key={pedido.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">#{pedido.id}</td>
              <td className="px-4 py-3">{new Date(pedido.created_at).toLocaleString()}</td>
              <td className="px-4 py-3">
                {pedido.customer.first_name} {pedido.customer.last_name}
              </td>
              <td className="px-4 py-3">{getStatusLabel(pedido.status)}</td>
              <td className="px-4 py-3">{pedido.total_pairs ?? "-"}</td>
              <td className="px-4 py-3">{pedido.sold_amount ?? "-"}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {pedido.status === "PENDING" && (
                    <Button type="button" variant="primary" onClick={() => onDispatch(pedido)}>
                      Despachar
                    </Button>
                  )}
                  {pedido.status !== "CANCELLED" && (
                    <Button type="button" onClick={() => onCancel(pedido)}>
                      Cancelar
                    </Button>
                  )}
                  {pedido.status === "PENDING" && (
                    <Button type="button" variant="danger" onClick={() => onDelete(pedido)}>
                      Eliminar
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableCard>
  );
}
