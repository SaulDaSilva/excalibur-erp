import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Notice } from "../components/ui/Notice";
import { PageHeader } from "../components/ui/PageHeader";
import { GastoForm } from "../features/gastos/GastoForm";
import {
  useCreateExpense,
  useCreateExpenseCategory,
  useExpense,
  useExpenseCategories,
  useUpdateExpense,
} from "../features/gastos/hooks";
import type {
  ExpenseCategory,
  ExpenseCategoryCreateInput,
  ExpenseFormSubmitPayload,
} from "../features/gastos/types";
import { toApiError } from "../lib/api";

type GastoFormPageProps = {
  mode: "create" | "edit";
};

export function GastoFormPage({ mode }: GastoFormPageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = useParams();

  const expenseId = mode === "edit" ? Number(params.gastoId) : null;
  const hasValidExpenseId = mode === "create" || (expenseId !== null && Number.isInteger(expenseId) && expenseId > 0);

  const categoriesQuery = useExpenseCategories({ includeInactive: true });
  const expenseQuery = useExpense(mode === "edit" && hasValidExpenseId ? expenseId : null);
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const createCategory = useCreateExpenseCategory();

  const isLoading = categoriesQuery.isLoading || (mode === "edit" && expenseQuery.isLoading);

  const blockingErrorMessage = useMemo(
    () =>
      (!hasValidExpenseId && "El gasto solicitado no es valido.") ||
      (categoriesQuery.isError && toApiError(categoriesQuery.error).detail) ||
      (expenseQuery.isError && toApiError(expenseQuery.error).detail) ||
      "",
    [categoriesQuery.error, categoriesQuery.isError, expenseQuery.error, expenseQuery.isError, hasValidExpenseId],
  );

  const handleCreateCategory = async (payload: ExpenseCategoryCreateInput): Promise<ExpenseCategory> => {
    const created = await createCategory.mutateAsync(payload);
    await queryClient.invalidateQueries({ queryKey: ["gasto-categorias"] });
    return created;
  };

  const handleSubmit = async (payload: ExpenseFormSubmitPayload) => {
    if (mode === "create") {
      await createExpense.mutateAsync(payload);
      navigate("/gastos", { replace: true });
      return;
    }

    if (!hasValidExpenseId || expenseId === null) {
      throw { detail: "El gasto solicitado no es valido." };
    }

    await updateExpense.mutateAsync({ id: expenseId, data: payload });
    navigate("/gastos", { replace: true });
  };

  return (
    <section className="space-y-4">
      <PageHeader
        actions={
          <Button type="button" onClick={() => navigate("/gastos")}>
            Volver a gastos
          </Button>
        }
      />

      {isLoading && <Notice variant="info" message="Cargando..." />}
      {blockingErrorMessage && <Notice variant="error" message={blockingErrorMessage} />}

      {!isLoading && !blockingErrorMessage && (
        <Card className="mx-auto w-full max-w-5xl">
          <GastoForm
            mode={mode}
            initialData={expenseQuery.data ?? null}
            categories={categoriesQuery.data ?? []}
            onCreateCategory={handleCreateCategory}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/gastos")}
          />
        </Card>
      )}
    </section>
  );
}
