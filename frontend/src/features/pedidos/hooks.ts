import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { listVariantes } from "../catalogo/api";
import { listClientesForSelect, listDirecciones } from "../clientes/api";
import { cancelPedido, createPedido, deletePedido, dispatchPedido, listPedidos } from "./api";
import type { OrderCreatePayload, PedidoListParams } from "./types";

export function usePedidos({ page, pageSize, q, status, customerId, from, to }: PedidoListParams) {
  return useQuery({
    queryKey: ["pedidos", { page, pageSize, q, status, customerId, from, to }],
    queryFn: () => listPedidos({ page, pageSize, q, status, customerId, from, to }),
    placeholderData: (previous) => previous,
  });
}

export function useCreatePedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OrderCreatePayload) => createPedido(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pedidos"] });
    },
  });
}

export function useDispatchPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => dispatchPedido(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pedidos"] });
    },
  });
}

export function useCancelPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelPedido(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pedidos"] });
    },
  });
}

export function useDeletePedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePedido(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pedidos"] });
    },
  });
}

export function useClientesForSelect() {
  return useQuery({
    queryKey: ["clientes-select"],
    queryFn: listClientesForSelect,
  });
}

export function useVariantesForPedidos() {
  return useQuery({
    queryKey: ["variantes-select"],
    queryFn: () => listVariantes({ onlyActive: true, page: 1, pageSize: 200 }),
  });
}

export function useDireccionesByCliente(customerId: number | null) {
  return useQuery({
    queryKey: ["direcciones", customerId],
    queryFn: () => listDirecciones(customerId as number),
    enabled: customerId !== null,
  });
}
