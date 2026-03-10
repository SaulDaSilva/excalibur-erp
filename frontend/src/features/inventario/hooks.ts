import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createAdjustment, createProduction, listMovimientos, listStock, listVariantesForInventario } from "./api";
import type {
  AdjustmentPayload,
  ManualMovementPayload,
  MovimientosListParams,
  ProductionPayload,
  StockListParams,
} from "./types";

export function useStock({ page, pageSize, q, onlyActive, productId, variantId }: StockListParams) {
  return useQuery({
    queryKey: ["stock_by_variant", { page, pageSize, q, onlyActive, productId, variantId }],
    queryFn: () => listStock({ page, pageSize, q, onlyActive, productId, variantId }),
    placeholderData: (previous) => previous,
  });
}

export function useMovimientos({
  page,
  pageSize,
  movementType,
  variantId,
  orderId,
  from,
  to,
}: MovimientosListParams) {
  return useQuery({
    queryKey: ["movimientos", { page, pageSize, movementType, variantId, orderId, from, to }],
    queryFn: () => listMovimientos({ page, pageSize, movementType, variantId, orderId, from, to }),
    placeholderData: (previous) => previous,
  });
}

export function useCreateProduction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductionPayload) => createProduction(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["stock_by_variant"] }),
        queryClient.invalidateQueries({ queryKey: ["movimientos"] }),
      ]);
    },
  });
}

export function useCreateAdjustment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdjustmentPayload) => createAdjustment(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["stock_by_variant"] }),
        queryClient.invalidateQueries({ queryKey: ["movimientos"] }),
      ]);
    },
  });
}

export function useCreateManualMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ManualMovementPayload) => {
      if (payload.movement_type === "PRODUCTION") {
        const productionPayload: ProductionPayload = {
          product_variant: payload.product_variant,
          quantity_pairs: payload.quantity_pairs,
          note: payload.note,
        };
        return createProduction(productionPayload);
      }

      const adjustmentPayload: AdjustmentPayload = {
        product_variant: payload.product_variant,
        quantity_pairs: payload.quantity_pairs,
        note: payload.note,
      };
      return createAdjustment(adjustmentPayload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["stock_by_variant"] }),
        queryClient.invalidateQueries({ queryKey: ["movimientos"] }),
      ]);
    },
  });
}

export function useVariantesForInventario() {
  return useQuery({
    queryKey: ["inventario-variantes"],
    queryFn: listVariantesForInventario,
  });
}
