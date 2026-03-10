import type { PendingOrderItem } from "./types";

const USD_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const DATETIME_FORMATTER = new Intl.DateTimeFormat("es-EC", {
  dateStyle: "medium",
  timeStyle: "short",
});

function translateItemKind(kind: PendingOrderItem["kind"]): string {
  return kind === "SALE" ? "Venta" : "Promocion";
}

export function formatCurrencyUSD(value: string): string {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return value;
  }
  return USD_FORMATTER.format(numeric);
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return isoString;
  }
  return DATETIME_FORMATTER.format(date);
}

export function itemsSummary(items: PendingOrderItem[]): string {
  if (!items.length) {
    return "-";
  }

  const visibleItems = items.slice(0, 3).map((item) => {
    return `${item.product_variant.product_name} ${item.product_variant.measure_mm}mm (${translateItemKind(item.kind)}) x${item.quantity_pairs}`;
  });
  const hiddenCount = items.length - visibleItems.length;
  return hiddenCount > 0 ? `${visibleItems.join("; ")}; +${hiddenCount}` : visibleItems.join("; ");
}
