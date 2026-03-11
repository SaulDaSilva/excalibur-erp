import { apiDelete, apiGet, apiPatch, apiPost } from "../../lib/api";
import { buildClientesQueryString } from "./filters";
import type {
  Cliente,
  ClienteCreateInput,
  ClientesListParams,
  Direccion,
  DireccionCreateInput,
  DireccionUpdateInput,
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

export function getCliente(id: number): Promise<Cliente> {
  return apiGet<Cliente>(`/api/clientes/${id}/`);
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

export function createDireccion(data: DireccionCreateInput): Promise<Direccion> {
  return apiPost<Direccion>("/api/clientes/direcciones/", data);
}

export function updateDireccion(id: number, data: DireccionUpdateInput): Promise<Direccion> {
  return apiPatch<Direccion>(`/api/clientes/direcciones/${id}/`, data);
}

export function deleteDireccion(id: number): Promise<null> {
  return apiDelete<null>(`/api/clientes/direcciones/${id}/`);
}
