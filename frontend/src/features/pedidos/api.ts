import { apiDelete, apiGet, apiPatch, apiPost } from "../../lib/api";
import type { PaginatedResponse } from "../clientes/types";
import { buildPedidosQueryString } from "./filters";
import type { OrderCreatePayload, Pedido, PedidoListParams } from "./types";

export function listPedidos(params: PedidoListParams): Promise<PaginatedResponse<Pedido>> {
  const query = buildPedidosQueryString(params);
  return apiGet<PaginatedResponse<Pedido>>(`/api/pedidos/?${query}`);
}

export function createPedido(payload: OrderCreatePayload): Promise<Pedido> {
  return apiPost<Pedido>("/api/pedidos/", payload);
}

export function updatePedido(id: number, payloadPartial: Partial<OrderCreatePayload>): Promise<Pedido> {
  return apiPatch<Pedido>(`/api/pedidos/${id}/`, payloadPartial);
}

export function deletePedido(id: number): Promise<null> {
  return apiDelete<null>(`/api/pedidos/${id}/`);
}

export function dispatchPedido(id: number): Promise<Pedido> {
  return apiPost<Pedido>(`/api/pedidos/${id}/dispatch/`);
}

export function cancelPedido(id: number): Promise<Pedido> {
  return apiPost<Pedido>(`/api/pedidos/${id}/cancel/`);
}
