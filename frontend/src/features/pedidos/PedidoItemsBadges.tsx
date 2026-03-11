import type { PendingOrderItem } from "../dashboard/types";
import type { PedidoItemDetail } from "./types";
import styles from "./PedidoItemsBadges.module.css";

type BadgeItem = PedidoItemDetail | PendingOrderItem;

type PedidoItemsBadgesProps = {
  items: BadgeItem[];
  maxVisible?: number;
  stacked?: boolean;
};

function getProductName(item: BadgeItem): string {
  if ("product" in item.product_variant) {
    return item.product_variant.product.name;
  }

  return item.product_variant.product_name;
}

export function PedidoItemsBadges({
  items,
  maxVisible = 4,
  stacked = false,
}: PedidoItemsBadgesProps) {
  if (items.length === 0) {
    return <span>-</span>;
  }

  const visibleItems = items.slice(0, maxVisible);
  const remainingItems = items.length - visibleItems.length;

  return (
    <div className={`${styles.list} ${stacked ? styles.stacked : ""}`}>
      {visibleItems.map((item) => {
        const productName = getProductName(item);
        const badgeClassName =
          item.kind === "PROMO"
            ? `${styles.badge} ${styles.promo}`
            : `${styles.badge} ${styles.sale}`;

        return (
          <span key={item.id} className={badgeClassName}>
            {productName} {item.product_variant.measure_mm}mm x{item.quantity_pairs}
          </span>
        );
      })}

      {remainingItems > 0 && (
        <span className={`${styles.badge} ${styles.more}`}>+{remainingItems}</span>
      )}
    </div>
  );
}
