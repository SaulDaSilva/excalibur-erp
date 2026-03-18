import type { ExpenseCategoryListParams, ExpenseListParams } from "./types";

export function buildExpenseCategoriesQueryString(params: ExpenseCategoryListParams = {}): string {
  const searchParams = new URLSearchParams();

  if (params.q?.trim()) {
    searchParams.set("q", params.q.trim());
  }

  if (params.includeInactive) {
    searchParams.set("include_inactive", "true");
  }

  return searchParams.toString();
}

export function buildGastosQueryString(params: ExpenseListParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page));
  searchParams.set("page_size", String(params.pageSize));

  if (params.q.trim()) {
    searchParams.set("q", params.q.trim());
  }

  if (params.categoryId) {
    searchParams.set("category_id", String(params.categoryId));
  }

  if (params.from.trim()) {
    searchParams.set("from", params.from.trim());
  }

  if (params.to.trim()) {
    searchParams.set("to", params.to.trim());
  }

  if (params.includeInactive) {
    searchParams.set("include_inactive", "true");
  }

  return searchParams.toString();
}
