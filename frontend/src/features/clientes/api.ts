import { apiDelete, apiGet, apiPatch, apiPost } from "../../lib/api";
import { buildClientesQueryString } from "./filters";
import type {
  Cliente,
  ClienteCreateInput,
  ClientesListParams,
  Direccion,
  ClienteUpdateInput,
  PaginatedResponse,
  Pais,
} from "./types";

export function listClientes(params: ClientesListParams): Promise<PaginatedResponse<Cliente>> {
  const query = buildClientesQueryString(params);
  return apiGet<PaginatedResponse<Cliente>>(`/api/clientes/?${query}`);
}

export function createCliente(data: ClienteCreateInput): Promise<Cliente> {
  return apiPost<Cliente>("/api/clientes/", data);
}

export function updateCliente(id: number, data: ClienteUpdateInput): Promise<Cliente> {
  return apiPatch<Cliente>(`/api/clientes/${id}/`, data);
}

export function deleteCliente(id: number): Promise<null> {
  return apiDelete<null>(`/api/clientes/${id}/`);
}

export function listPaises(): Promise<Pais[]> {
  return apiGet<Pais[]>("/api/clientes/paises/");
}

export function listClientesForSelect(): Promise<PaginatedResponse<Cliente>> {
  return apiGet<PaginatedResponse<Cliente>>("/api/clientes/?page=1&page_size=200");
}

export function listDirecciones(customerId: number): Promise<Direccion[]> {
  return apiGet<Direccion[]>(`/api/clientes/direcciones/?customer_id=${customerId}`);
}
