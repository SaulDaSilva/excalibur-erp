import { useEffect, useMemo, useState } from "react";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PaginationControls } from "../components/ui/PaginationControls";
import { PageHeader } from "../components/ui/PageHeader";
import { toApiError } from "../lib/api";
import { PedidoFormModal } from "../features/pedidos/PedidoFormModal";
import { PedidosTable } from "../features/pedidos/PedidosTable";
import {
  useCancelPedido,
  useCreatePedido,
  useDeletePedido,
  useDispatchPedido,
  usePedidos,
} from "../features/pedidos/hooks";
import type { OrderCreatePayload, Pedido, PedidoStatus } from "../features/pedidos/types";

const PAGE_SIZE = 10;

export function PedidosPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | PedidoStatus>("");
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageError, setPageError] = useState("");

  const pedidosQuery = usePedidos({ page, pageSize: PAGE_SIZE, q, status, customerId, from, to });
  const createPedido = useCreatePedido();
  const dispatchPedido = useDispatchPedido();
  const cancelPedido = useCancelPedido();
  const deletePedido = useDeletePedido();

  const totalPages = useMemo(() => {
    const total = pedidosQuery.data?.count ?? 0;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [pedidosQuery.data?.count]);

  useEffect(() => {
    setPage(1);
  }, [q, status, customerId, from, to]);

  const handleCreate = async (payload: OrderCreatePayload) => {
    await createPedido.mutateAsync(payload);
  };

  const handleDispatch = async (pedido: Pedido) => {
    if (!window.confirm(`Despachar pedido #${pedido.id}?`)) {
      return;
    }
    setPageError("");
    try {
      await dispatchPedido.mutateAsync(pedido.id);
    } catch (error) {
      setPageError(toApiError(error).detail);
    }
  };

  const handleCancel = async (pedido: Pedido) => {
    if (!window.confirm(`Cancelar pedido #${pedido.id}?`)) {
      return;
    }
    setPageError("");
    try {
      await cancelPedido.mutateAsync(pedido.id);
    } catch (error) {
      setPageError(toApiError(error).detail);
    }
  };

  const handleDelete = async (pedido: Pedido) => {
    if (!window.confirm(`Eliminar pedido #${pedido.id}?`)) {
      return;
    }
    setPageError("");
    try {
      await deletePedido.mutateAsync(pedido.id);
    } catch (error) {
      setPageError(toApiError(error).detail);
    }
  };

  return (
    <section className="space-y-4">
      <PageHeader
        actions={
          <Button type="button" variant="primary" onClick={() => setIsModalOpen(true)}>
            Nuevo pedido
          </Button>
        }
      />

      <Card>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
          <input placeholder="Buscar..." value={q} onChange={(event) => setQ(event.target.value)} />
          <select value={status} onChange={(event) => setStatus(event.target.value as "" | PedidoStatus)}>
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="DISPATCHED">Despachado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
          <input
            type="number"
            placeholder="ID cliente"
            value={customerId ?? ""}
            onChange={(event) => setCustomerId(event.target.value ? Number(event.target.value) : null)}
          />
          <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          <input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </div>
      </Card>

      {pedidosQuery.isLoading && <p className="text-sm text-slate-600">Cargando...</p>}
      {pedidosQuery.isError && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {toApiError(pedidosQuery.error).detail}
        </p>
      )}
      {pageError && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{pageError}</p>}

      {pedidosQuery.data && (
        <>
          <PedidosTable
            data={pedidosQuery.data.results}
            onDispatch={handleDispatch}
            onCancel={handleCancel}
            onDelete={handleDelete}
          />
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <PedidoFormModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreate} />
    </section>
  );
}
