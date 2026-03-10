import type { MovimientosListParams, StockListParams } from "./types";

export function buildStockQueryString(params: StockListParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page));
  searchParams.set("page_size", String(params.pageSize));
  searchParams.set("only_active", params.onlyActive ? "true" : "false");

  if (params.q.trim()) {
    searchParams.set("q", params.q.trim());
  }
  if (params.productId) {
    searchParams.set("product_id", String(params.productId));
  }
  if (params.variantId) {
    searchParams.set("product_variant_id", String(params.variantId));
  }

  return searchParams.toString();
}

export function buildMovimientosQueryString(params: MovimientosListParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page));
  searchParams.set("page_size", String(params.pageSize));

  if (params.movementType.trim()) {
    searchParams.set("movement_type", params.movementType.trim());
  }
  if (params.variantId) {
    searchParams.set("product_variant_id", String(params.variantId));
  }
  if (params.orderId) {
    searchParams.set("order_id", String(params.orderId));
  }
  if (params.from.trim()) {
    searchParams.set("from", params.from.trim());
  }
  if (params.to.trim()) {
    searchParams.set("to", params.to.trim());
  }

  return searchParams.toString();
}
