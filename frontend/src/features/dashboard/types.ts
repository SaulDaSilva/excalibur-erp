export type Metrics = {
  pending_orders_count: number;
  sales_last_7_days_usd: string;
  sold_pairs_last_7_days: number;
  promo_pairs_last_7_days: number;
  low_stock_variants_count: number;
  low_stock_threshold: number;
};

export type DashboardStockVariant = {
  product_variant_id: number;
  product_name: string;
  measure_mm: number;
  stock_pairs: number;
  is_active: boolean;
};

export type PendingOrderItem = {
  id: number;
  kind: "SALE" | "PROMO";
  quantity_pairs: number;
  unit_price: string;
  product_variant: {
    id: number;
    measure_mm: number;
    product_name: string;
  };
};

export type PendingOrder = {
  id: number;
  created_at: string;
  channel: string;
  status: "PENDING";
  customer: {
    id: number;
    first_name: string;
    last_name: string;
    id_number: string;
  };
  shipping_address: {
    id: number;
    province: string;
    city: string;
    address_line: string;
    is_primary: boolean;
  };
  items: PendingOrderItem[];
  sold_amount_usd: string;
  sold_pairs: number;
  promo_pairs: number;
  total_pairs: number;
};

export type DashboardSummaryResponse = {
  metrics: Metrics;
  pending_orders: PendingOrder[];
  generated_at: string;
};
