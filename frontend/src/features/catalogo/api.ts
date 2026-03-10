import { apiGet } from "../../lib/api";
import type { PaginatedResponse } from "../clientes/types";

export type Variante = {
  id: number;
  product: number;
  product_name: string;
  measure_mm: number;
  base_price_usd: string;
  is_active: boolean;
};

type ListVariantesParams = {
  page?: number;
  pageSize?: number;
  q?: string;
  productId?: number;
  onlyActive?: boolean;
};

export function listVariantes(params: ListVariantesParams = {}): Promise<PaginatedResponse<Variante>> {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("page_size", String(params.pageSize ?? 200));
  searchParams.set("only_active", params.onlyActive === false ? "false" : "true");

  if (params.q?.trim()) {
    searchParams.set("q", params.q.trim());
  }
  if (params.productId) {
    searchParams.set("product_id", String(params.productId));
  }

  return apiGet<PaginatedResponse<Variante>>(`/api/catalogo/variantes/?${searchParams.toString()}`);
}
