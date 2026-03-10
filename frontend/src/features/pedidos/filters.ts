import type { PedidoListParams } from "./types";

export function buildPedidosQueryString(params: PedidoListParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page));
  searchParams.set("page_size", String(params.pageSize));

  if (params.q.trim()) {
    searchParams.set("q", params.q.trim());
  }
  if (params.status) {
    searchParams.set("status", params.status);
  }
  if (params.customerId) {
    searchParams.set("customer_id", String(params.customerId));
  }
  if (params.from.trim()) {
    searchParams.set("from", params.from.trim());
  }
  if (params.to.trim()) {
    searchParams.set("to", params.to.trim());
  }

  return searchParams.toString();
}
