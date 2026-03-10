import { apiGet, apiPost } from "../../lib/api";
import type { PaginatedResponse } from "../clientes/types";
import { listVariantes, type Variante } from "../catalogo/api";
import { buildMovimientosQueryString, buildStockQueryString } from "./filters";
import type {
  AdjustmentPayload,
  InventoryMovementRow,
  MovimientosListParams,
  ProductionPayload,
  StockByVariantRow,
  StockListParams,
} from "./types";

type StockApiRow = Omit<StockByVariantRow, "product_name"> & { product: string };

export async function listStock(params: StockListParams): Promise<PaginatedResponse<StockByVariantRow>> {
  const query = buildStockQueryString(params);
  const response = await apiGet<PaginatedResponse<StockApiRow>>(`/api/inventario/stock_by_variant/?${query}`);
  return {
    ...response,
    results: response.results.map((row) => ({
      ...row,
      product_name: row.product,
    })),
  };
}

export function listMovimientos(params: MovimientosListParams): Promise<PaginatedResponse<InventoryMovementRow>> {
  const query = buildMovimientosQueryString(params);
  return apiGet<PaginatedResponse<InventoryMovementRow>>(`/api/inventario/movimientos/?${query}`);
}

export function createProduction(payload: ProductionPayload): Promise<InventoryMovementRow> {
  return apiPost<InventoryMovementRow>("/api/inventario/production/", payload);
}

export function createAdjustment(payload: AdjustmentPayload): Promise<InventoryMovementRow> {
  return apiPost<InventoryMovementRow>("/api/inventario/adjustment/", payload);
}

export async function listVariantesForInventario(): Promise<Variante[]> {
  const response = await listVariantes({ onlyActive: true, page: 1, pageSize: 200 });
  return response.results;
}
