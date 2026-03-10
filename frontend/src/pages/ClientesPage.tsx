import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PaginationControls } from "../components/ui/PaginationControls";
import { PageHeader } from "../components/ui/PageHeader";
import { toApiError } from "../lib/api";
import { ClienteFormModal } from "../features/clientes/ClienteFormModal";
import { ClientesTable } from "../features/clientes/ClientesTable";
import {
  useClientes,
  useCreateCliente,
  useDeleteCliente,
  usePaises,
  useUpdateCliente,
} from "../features/clientes/hooks";
import type { Cliente, ClienteCreateInput, ClienteUpdateInput } from "../features/clientes/types";

const PAGE_SIZE = 10;

export function ClientesPage() {
  const [q, setQ] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [page, setPage] = useState(1);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [pageError, setPageError] = useState("");

  const queryClient = useQueryClient();
  const clientesQuery = useClientes({ page, pageSize: PAGE_SIZE, q, includeInactive });
  const paisesQuery = usePaises();
  const createCliente = useCreateCliente();
  const updateCliente = useUpdateCliente();
  const deleteCliente = useDeleteCliente();

  const totalPages = useMemo(() => {
    const total = clientesQuery.data?.count ?? 0;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [clientesQuery.data?.count]);

  useEffect(() => {
    setPage(1);
  }, [q, includeInactive]);

  const refreshClientes = async () => {
    await queryClient.invalidateQueries({ queryKey: ["clientes"] });
  };

  const handleSave = async (payload: ClienteCreateInput | ClienteUpdateInput) => {
    if (modalMode === "create") {
      await createCliente.mutateAsync(payload as ClienteCreateInput);
    } else if (selectedCliente) {
      await updateCliente.mutateAsync({ id: selectedCliente.id, data: payload as ClienteUpdateInput });
    }
    await refreshClientes();
  };

  const handleDelete = async (cliente: Cliente) => {
    setPageError("");
    if (!window.confirm(`Eliminar cliente ${cliente.first_name} ${cliente.last_name}?`)) {
      return;
    }
    try {
      await deleteCliente.mutateAsync(cliente.id);
      await refreshClientes();
    } catch (error) {
      setPageError(toApiError(error).detail);
    }
  };

  return (
    <section className="space-y-4">
      <PageHeader
        actions={
          <Button
            variant="primary"
            type="button"
            onClick={() => {
              setModalMode("create");
              setSelectedCliente(null);
              setOpenModal(true);
            }}
          >
            Nuevo cliente
          </Button>
        }
      />

      <Card>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
          <input placeholder="Buscar..." value={q} onChange={(event) => setQ(event.target.value)} />
          <label className="flex items-center gap-2">
            <input
              className="h-4 w-4 rounded border-slate-300"
              type="checkbox"
              checked={includeInactive}
              onChange={(event) => setIncludeInactive(event.target.checked)}
            />
            Incluir inactivos
          </label>
        </div>
      </Card>

      {(clientesQuery.isLoading || paisesQuery.isLoading) && <p className="text-sm text-slate-600">Cargando...</p>}
      {(clientesQuery.isError || paisesQuery.isError) && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {toApiError(clientesQuery.error ?? paisesQuery.error).detail}
        </p>
      )}
      {pageError && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{pageError}</p>}

      {clientesQuery.data && (
        <>
          <ClientesTable
            data={clientesQuery.data.results}
            onEdit={(cliente) => {
              setModalMode("edit");
              setSelectedCliente(cliente);
              setOpenModal(true);
            }}
            onDelete={handleDelete}
          />
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <ClienteFormModal
        open={openModal}
        mode={modalMode}
        initialData={selectedCliente}
        paises={paisesQuery.data ?? []}
        onSubmit={handleSave}
        onClose={() => setOpenModal(false)}
      />
    </section>
  );
}
