export type StockByVariantRow = {
  product_variant_id: number;
  product_name: string;
  measure_mm: number;
  base_price_usd?: string;
  stock_pairs: number;
  is_active: boolean;
};

export type ManualMovementType = "PRODUCTION" | "ADJUSTMENT";

export type InventoryMovementRow = {
  id: number;
  created_at: string;
  movement_type: string;
  quantity_pairs: number;
  note: string;
  order: number | null;
  product_variant: {
    id: number;
    product: string;
    measure_mm: number;
  };
};

export type StockListParams = {
  page: number;
  pageSize: number;
  q: string;
  onlyActive: boolean;
  productId: number | null;
  variantId: number | null;
};

export type MovimientosListParams = {
  page: number;
  pageSize: number;
  movementType: string;
  variantId: number | null;
  orderId: number | null;
  from: string;
  to: string;
};

export type ProductionPayload = {
  product_variant: number;
  quantity_pairs: number;
  note?: string;
};

export type AdjustmentPayload = {
  product_variant: number;
  quantity_pairs: number;
  note: string;
};

export type ManualMovementPayload = {
  movement_type: ManualMovementType;
  product_variant: number;
  quantity_pairs: number;
  note: string;
};
