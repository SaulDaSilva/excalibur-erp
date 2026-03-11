import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { listVariantes } from "../catalogo/api";
import { listClientes, listDirecciones } from "../clientes/api";
import { cancelPedido, createPedido, deletePedido, dispatchPedido, getPedido, listPedidos } from "./api";
import type { OrderCreatePayload, PedidoListParams } from "./types";

export function usePedidos({ page, pageSize, q, status, customerId, from, to }: PedidoListParams) {
  return useQuery({
    queryKey: ["pedidos", { page, pageSize, q, status, customerId, from, to }],
    queryFn: () => listPedidos({ page, pageSize, q, status, customerId, from, to }),
    placeholderData: (previous) => previous,
  });
}

export function usePedido(id: number | null) {
  return useQuery({
    queryKey: ["pedido", id],
    queryFn: () => getPedido(id as number),
    enabled: id !== null,
  });
}

export function useCreatePedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OrderCreatePayload) => createPedido(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["pedidos"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] }),
      ]);
    },
  });
}

export function useDispatchPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => dispatchPedido(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["pedidos"] }),
        queryClient.invalidateQueries({ queryKey: ["pedido"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboardStockByVariant"] }),
        queryClient.invalidateQueries({ queryKey: ["stock_by_variant"] }),
        queryClient.invalidateQueries({ queryKey: ["movimientos"] }),
      ]);
    },
  });
}

export function useCancelPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelPedido(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["pedidos"] }),
        queryClient.invalidateQueries({ queryKey: ["pedido"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboardStockByVariant"] }),
        queryClient.invalidateQueries({ queryKey: ["stock_by_variant"] }),
        queryClient.invalidateQueries({ queryKey: ["movimientos"] }),
      ]);
    },
  });
}

export function useDeletePedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePedido(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["pedidos"] }),
        queryClient.invalidateQueries({ queryKey: ["pedido"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] }),
      ]);
    },
  });
}

export function usePedidoCustomerSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: ["pedido-customer-search", query],
    queryFn: () =>
      listClientes({
        page: 1,
        pageSize: 10,
        q: query,
        includeInactive: false,
      }),
    enabled,
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
