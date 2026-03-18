import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createExpense,
  createExpenseCategory,
  deleteExpense,
  getExpense,
  listExpenseCategories,
  listExpenses,
  updateExpense,
} from "./api";
import type {
  ExpenseCategoryCreateInput,
  ExpenseCategoryListParams,
  ExpenseCreateInput,
  ExpenseListParams,
  ExpenseUpdateInput,
} from "./types";

export function useExpenseCategories(params: ExpenseCategoryListParams = {}) {
  const { q = "", includeInactive = false } = params;

  return useQuery({
    queryKey: ["gasto-categorias", { q, includeInactive }],
    queryFn: () => listExpenseCategories({ q, includeInactive }),
  });
}

export function useExpenses({
  page,
  pageSize,
  q,
  categoryId,
  from,
  to,
  includeInactive,
}: ExpenseListParams) {
  return useQuery({
    queryKey: ["gastos", { page, pageSize, q, categoryId, from, to, includeInactive }],
    queryFn: () => listExpenses({ page, pageSize, q, categoryId, from, to, includeInactive }),
    placeholderData: (previous) => previous,
  });
}

export function useExpense(id: number | null) {
  return useQuery({
    queryKey: ["gasto", id],
    queryFn: () => getExpense(id as number),
    enabled: id !== null,
  });
}

export function useCreateExpenseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExpenseCategoryCreateInput) => createExpenseCategory(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["gasto-categorias"] });
    },
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExpenseCreateInput) => createExpense(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["gastos"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] }),
      ]);
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ExpenseUpdateInput }) => updateExpense(id, data),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["gastos"] }),
        queryClient.invalidateQueries({ queryKey: ["gasto", variables.id] }),
      ]);
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteExpense(id),
    onSuccess: async (_, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["gastos"] }),
        queryClient.invalidateQueries({ queryKey: ["gasto", id] }),
      ]);
    },
  });
}
