import { useMutation, useQuery } from "@tanstack/react-query";

import {
  createCliente,
  createPais,
  createDireccion,
  deleteCliente,
  deleteDireccion,
  getCliente,
  listClientes,
  listDirecciones,
  listPaises,
  updateCliente,
  updateDireccion,
} from "./api";
import type {
  ClienteCreateInput,
  ClientesListParams,
  ClienteUpdateInput,
  DireccionCreateInput,
  DireccionUpdateInput,
  PaisCreateInput,
} from "./types";

export function useClientes({ page, pageSize, q, includeInactive }: ClientesListParams) {
  return useQuery({
    queryKey: ["clientes", { page, pageSize, q, includeInactive }],
    queryFn: () => listClientes({ page, pageSize, q, includeInactive }),
    placeholderData: (previous) => previous,
  });
}

export function usePaises() {
  return useQuery({
    queryKey: ["paises"],
    queryFn: listPaises,
  });
}

export function useCliente(id: number | null) {
  return useQuery({
    queryKey: ["cliente", id],
    queryFn: () => getCliente(id as number),
    enabled: id !== null,
  });
}

export function useDirecciones(customerId: number | null) {
  return useQuery({
    queryKey: ["direcciones", customerId],
    queryFn: () => listDirecciones(customerId as number),
    enabled: customerId !== null,
  });
}

export function useCreateCliente() {
  return useMutation({
    mutationFn: (data: ClienteCreateInput) => createCliente(data),
  });
}

export function useCreatePais() {
  return useMutation({
    mutationFn: (data: PaisCreateInput) => createPais(data),
  });
}

export function useUpdateCliente() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClienteUpdateInput }) => updateCliente(id, data),
  });
}

export function useDeleteCliente() {
  return useMutation({
    mutationFn: (id: number) => deleteCliente(id),
  });
}

export function useCreateDireccion() {
  return useMutation({
    mutationFn: (data: DireccionCreateInput) => createDireccion(data),
  });
}

export function useUpdateDireccion() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DireccionUpdateInput }) => updateDireccion(id, data),
  });
}

export function useDeleteDireccion() {
  return useMutation({
    mutationFn: (id: number) => deleteDireccion(id),
  });
}
