import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { FilterPanel, filterPanelStyles } from "../components/ui/FilterPanel";
import { Notice } from "../components/ui/Notice";
import { PaginationControls } from "../components/ui/PaginationControls";
import { PageHeader } from "../components/ui/PageHeader";
import { GastosTable } from "../features/gastos/GastosTable";
import { useDeleteExpense, useExpenseCategories, useExpenses } from "../features/gastos/hooks";
import type { Expense } from "../features/gastos/types";
import { toApiError } from "../lib/api";

const PAGE_SIZE = 10;

export function GastosPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [pageError, setPageError] = useState("");

  const categoriesQuery = useExpenseCategories({ includeInactive: true });
  const expensesQuery = useExpenses({ page, pageSize: PAGE_SIZE, q, categoryId, from, to, includeInactive });
  const deleteExpense = useDeleteExpense();

  const totalPages = useMemo(() => {
    const total = expensesQuery.data?.count ?? 0;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [expensesQuery.data?.count]);

  useEffect(() => {
    setPage(1);
  }, [q, categoryId, from, to, includeInactive]);

  const handleDelete = async (expense: Expense) => {
    if (!window.confirm(`Eliminar gasto "${expense.description}"?`)) {
      return;
    }

    setPageError("");
    try {
      await deleteExpense.mutateAsync(expense.id);
    } catch (error) {
      setPageError(toApiError(error).detail);
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        actions={
          <Button type="button" variant="primary" onClick={() => navigate("/gastos/nuevo")}>
            Nuevo gasto
          </Button>
        }
      />

      <FilterPanel
        title="Filtros"
        subtitle="Filtra gastos por texto, categoria, rango de fechas o registros inactivos."
        gridClassName="xl:grid-cols-5"
      >
        <input
          placeholder="Buscar descripcion, proveedor o referencia..."
          value={q}
          onChange={(event) => setQ(event.target.value)}
        />
        <select
          value={categoryId ?? ""}
          onChange={(event) => setCategoryId(event.target.value ? Number(event.target.value) : null)}
        >
          <option value="">Todas las categorias</option>
          {(categoriesQuery.data ?? []).map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
              {!category.is_active ? " (inactiva)" : ""}
            </option>
          ))}
        </select>
        <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        <input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
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

      {categoriesQuery.isError && <Notice variant="error" message={toApiError(categoriesQuery.error).detail} />}
      {expensesQuery.isLoading && <Notice variant="info" message="Cargando..." />}
      {expensesQuery.isError && <Notice variant="error" message={toApiError(expensesQuery.error).detail} />}
      {pageError && <Notice variant="error" message={pageError} />}

      {expensesQuery.data && (
        <>
          <GastosTable
            data={expensesQuery.data.results}
            onEdit={(expense) => navigate(`/gastos/${expense.id}/editar`)}
            onDelete={handleDelete}
          />
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  );
}
