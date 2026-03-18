import { apiDelete, apiGet, apiPatch, apiPost } from "../../lib/api";
import { buildExpenseCategoriesQueryString, buildGastosQueryString } from "./filters";
import type {
  Expense,
  ExpenseCategory,
  ExpenseCategoryCreateInput,
  ExpenseCategoryListParams,
  ExpenseCreateInput,
  ExpenseListResponse,
  ExpenseListParams,
  ExpenseUpdateInput,
} from "./types";

function withQuery(path: string, query: string): string {
  return query ? `${path}?${query}` : path;
}

export function listExpenseCategories(params: ExpenseCategoryListParams = {}): Promise<ExpenseCategory[]> {
  const query = buildExpenseCategoriesQueryString(params);
  return apiGet<ExpenseCategory[]>(withQuery("/api/gastos/categorias/", query));
}

export function createExpenseCategory(data: ExpenseCategoryCreateInput): Promise<ExpenseCategory> {
  return apiPost<ExpenseCategory>("/api/gastos/categorias/", data);
}

export function listExpenses(params: ExpenseListParams): Promise<ExpenseListResponse> {
  const query = buildGastosQueryString(params);
  return apiGet<ExpenseListResponse>(withQuery("/api/gastos/", query));
}

export function getExpense(id: number): Promise<Expense> {
  return apiGet<Expense>(`/api/gastos/${id}/`);
}

export function createExpense(data: ExpenseCreateInput): Promise<Expense> {
  return apiPost<Expense>("/api/gastos/", data);
}

export function updateExpense(id: number, data: ExpenseUpdateInput): Promise<Expense> {
  return apiPatch<Expense>(`/api/gastos/${id}/`, data);
}

export function deleteExpense(id: number): Promise<null> {
  return apiDelete<null>(`/api/gastos/${id}/`);
}
