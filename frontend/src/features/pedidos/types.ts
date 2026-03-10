export type PedidoStatus = "PENDING" | "DISPATCHED" | "CANCELLED";
export type PedidoChannel = "WHATSAPP" | "CALL";
export type PedidoItemKind = "SALE" | "PROMO";

export type PedidoCustomer = {
  id: number;
  first_name: string;
  last_name: string;
  id_number: string;
};

export type PedidoShippingAddress = {
  id: number;
  province: string;
  city: string;
  address_line: string;
  is_primary: boolean;
};

export type PedidoItemDetail = {
  id: number;
  kind: PedidoItemKind;
  product_variant: {
    id: number;
    measure_mm: number;
    product: {
      id: number;
      name: string;
    };
  };
  quantity_pairs: number;
  unit_price: string;
};

export type Pedido = {
  id: number;
  customer: PedidoCustomer;
  shipping_address: PedidoShippingAddress;
  items: PedidoItemDetail[];
  status: PedidoStatus;
  channel: PedidoChannel;
  sold_pairs?: number;
  promo_pairs?: number;
  total_pairs?: number;
  sold_amount?: string;
  created_at: string;
  dispatched_at: string | null;
  cancelled_at: string | null;
};

export type PedidoItemPayload = {
  kind: PedidoItemKind;
  product_variant: number;
  quantity_pairs: number;
  unit_price: string;
};

export type OrderCreatePayload = {
  customer: number;
  shipping_address: number;
  channel: PedidoChannel;
  items: PedidoItemPayload[];
};

export type PedidoListParams = {
  page: number;
  pageSize: number;
  q: string;
  status: "" | PedidoStatus;
  customerId: number | null;
  from: string;
  to: string;
};
