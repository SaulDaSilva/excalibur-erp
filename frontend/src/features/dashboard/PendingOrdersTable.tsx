import { Link } from "react-router-dom";

import { Card } from "../../components/ui/Card";
import { TableCard } from "../../components/ui/TableCard";
import { PedidoItemsBadges } from "../pedidos/PedidoItemsBadges";
import { formatCurrencyUSD, formatDateTime } from "./formatters";
import type { PendingOrder } from "./types";
import styles from "./PendingOrdersTable.module.css";

function getChannelLabel(channel: PendingOrder["channel"]): string {
  if (channel === "WHATSAPP") {
    return "WhatsApp";
  }
  if (channel === "CALL") {
    return "Llamada";
  }
  return channel;
}

type PendingOrdersTableProps = {
  orders: PendingOrder[];
  loading?: boolean;
};

export function PendingOrdersTable({ orders, loading = false }: PendingOrdersTableProps) {
  if (loading) {
    return (
      <Card>
        <h2 className={styles.loadingTitle}>Pedidos pendientes</h2>
        <p className={styles.loadingText}>Cargando...</p>
      </Card>
    );
  }

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>Pedidos pendientes</h2>
      </div>

      <TableCard className={styles.tableCard} scrollAreaClassName={styles.scrollArea}>
        <table className={styles.table}>
          <thead className={styles.head}>
            <tr>
              <th className={styles.cell}>Pedido</th>
              <th className={styles.cell}>Cliente</th>
              <th className={styles.cell}>Fecha</th>
              <th className={styles.cell}>Canal</th>
              <th className={styles.cell}>Items</th>
              <th className={styles.cell}>Total venta</th>
              <th className={styles.cellRight}>Acciones</th>
            </tr>
          </thead>
          <tbody className={styles.body}>
            {orders.length === 0 && (
              <tr>
                <td className={styles.empty} colSpan={7}>
                  No hay pedidos pendientes.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className={styles.row}>
                <td className={styles.bodyCell}>#{order.id}</td>
                <td className={styles.bodyCell}>
                  <p className={styles.customerName}>
                    {order.customer.first_name} {order.customer.last_name}
                  </p>
                  <p className={styles.customerMeta}>{order.customer.id_number}</p>
                </td>
                <td className={styles.bodyCell}>{formatDateTime(order.created_at)}</td>
                <td className={styles.bodyCell}>{getChannelLabel(order.channel)}</td>
                <td className={styles.summaryCell}>
                  <PedidoItemsBadges items={order.items} maxVisible={3} stacked />
                </td>
                <td className={styles.bodyCell}>{formatCurrencyUSD(order.sold_amount_usd)}</td>
                <td className={styles.actionCell}>
                  <Link className={styles.actionLink} to={`/pedidos/${order.id}`}>
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </Card>
  );
}
