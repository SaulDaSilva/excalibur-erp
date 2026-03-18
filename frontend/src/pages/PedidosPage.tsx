import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { FilterPanel } from "../components/ui/FilterPanel";
import { Notice } from "../components/ui/Notice";
import { PaginationControls } from "../components/ui/PaginationControls";
import { PageHeader } from "../components/ui/PageHeader";
import { toApiError } from "../lib/api";
import { PedidosTable } from "../features/pedidos/PedidosTable";
import {
  useCancelPedido,
  useDeletePedido,
  useDispatchPedido,
  usePedidos,
} from "../features/pedidos/hooks";
import type { Pedido, PedidoStatus } from "../features/pedidos/types";

const PAGE_SIZE = 10;

export function PedidosPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | PedidoStatus>("");
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [pageError, setPageError] = useState("");

  const pedidosQuery = usePedidos({ page, pageSize: PAGE_SIZE, q, status, customerId, from, to });
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
    <section className="space-y-6">
      <PageHeader
        actions={
          <Button type="button" variant="primary" onClick={() => navigate("/pedidos/nuevo")}>
            Nuevo pedido
          </Button>
        }
      />

      <FilterPanel
        title="Filtros"
        subtitle="Filtra pedidos por texto, estado, cliente o rango de fechas."
        gridClassName="xl:grid-cols-5"
      >
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
      </FilterPanel>

      {pedidosQuery.isLoading && <Notice variant="info" message="Cargando..." />}
      {pedidosQuery.isError && (
        <Notice variant="error" message={toApiError(pedidosQuery.error).detail} />
      )}
      {pageError && <Notice variant="error" message={pageError} />}

      {pedidosQuery.data && (
        <>
          <PedidosTable
            data={pedidosQuery.data.results}
            onView={(pedido) => navigate(`/pedidos/${pedido.id}`)}
            onDispatch={handleDispatch}
            onCancel={handleCancel}
            onDelete={handleDelete}
          />
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  );
}
