import { useMutation, useQuery } from "@tanstack/react-query";

import { createCliente, deleteCliente, listClientes, listPaises, updateCliente } from "./api";
import type { ClienteCreateInput, ClientesListParams, ClienteUpdateInput } from "./types";

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

export function useCreateCliente() {
  return useMutation({
    mutationFn: (data: ClienteCreateInput) => createCliente(data),
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
