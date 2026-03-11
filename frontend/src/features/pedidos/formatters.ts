import type { Pedido, PedidoChannel, PedidoItemDetail, PedidoStatus } from "./types";

export function formatPedidoStatus(status: PedidoStatus): string {
  if (status === "PENDING") {
    return "Pendiente";
  }
  if (status === "DISPATCHED") {
    return "Despachado";
  }
  return "Cancelado";
}

export function formatPedidoChannel(channel: PedidoChannel): string {
  if (channel === "WHATSAPP") {
    return "WhatsApp";
  }
  if (channel === "CALL") {
    return "Llamada";
  }
  return channel;
}

export function formatPedidoDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

export function formatPedidoCurrency(value?: string): string {
  if (!value) {
    return "-";
  }

  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(value));
}

export function summarizePedidoItems(items: Pedido["items"] | PedidoItemDetail[]): string {
  if (items.length === 0) {
    return "-";
  }

  const summary = items.slice(0, 2).map((item) => {
    const productName = item.product_variant.product.name;
    return `${productName} ${item.product_variant.measure_mm}mm x${item.quantity_pairs}`;
  });

  const remaining = items.length - summary.length;
  return remaining > 0 ? `${summary.join("; ")} +${remaining}` : summary.join("; ");
}

export function calculatePedidoItemSubtotal(item: PedidoItemDetail): string {
  const total = Number(item.unit_price) * item.quantity_pairs;
  return total.toFixed(2);
}
