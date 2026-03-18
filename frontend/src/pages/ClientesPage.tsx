import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "../components/ui/Button";
import { FilterPanel, filterPanelStyles } from "../components/ui/FilterPanel";
import { Notice } from "../components/ui/Notice";
import { PaginationControls } from "../components/ui/PaginationControls";
import { PageHeader } from "../components/ui/PageHeader";
import { toApiError } from "../lib/api";
import { ClientesTable } from "../features/clientes/ClientesTable";
import { useClientes, useDeleteCliente } from "../features/clientes/hooks";
import type { Cliente } from "../features/clientes/types";

const PAGE_SIZE = 10;

export function ClientesPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [page, setPage] = useState(1);
  const [pageError, setPageError] = useState("");

  const queryClient = useQueryClient();
  const clientesQuery = useClientes({ page, pageSize: PAGE_SIZE, q, includeInactive });
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
    <section className="space-y-6">
      <PageHeader
        actions={
          <Button
            variant="primary"
            type="button"
            onClick={() => navigate("/clientes/nuevo")}
          >
            Nuevo cliente
          </Button>
        }
      />

      <FilterPanel title="Filtros" subtitle="Busca clientes y controla si deseas incluir registros inactivos.">
          <input placeholder="Buscar..." value={q} onChange={(event) => setQ(event.target.value)} />
          <label className={filterPanelStyles.checkbox}>
            <input
              className={filterPanelStyles.checkboxInput}
              type="checkbox"
              checked={includeInactive}
              onChange={(event) => setIncludeInactive(event.target.checked)}
            />
            Incluir inactivos
          </label>
      </FilterPanel>

      {clientesQuery.isLoading && <Notice variant="info" message="Cargando..." />}
      {clientesQuery.isError && <Notice variant="error" message={toApiError(clientesQuery.error).detail} />}
      {pageError && <Notice variant="error" message={pageError} />}

      {clientesQuery.data && (
        <>
          <ClientesTable
            data={clientesQuery.data.results}
            onEdit={(cliente) => navigate(`/clientes/${cliente.id}/editar`)}
            onDelete={handleDelete}
          />
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  );
}
