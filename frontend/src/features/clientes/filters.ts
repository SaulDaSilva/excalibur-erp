import type { ClientesListParams } from "./types";

export function buildClientesQueryString(params: ClientesListParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page));
  searchParams.set("page_size", String(params.pageSize));

  const trimmedQuery = params.q.trim();
  if (trimmedQuery) {
    searchParams.set("q", trimmedQuery);
  }

  if (params.includeInactive) {
    searchParams.set("include_inactive", "true");
  }

  return searchParams.toString();
}
