import { Link } from "react-router-dom";

import { Card } from "../../components/ui/Card";
import tableStyles from "../../components/ui/DataTable.module.css";
import { TableCard } from "../../components/ui/TableCard";
import { PedidoItemsBadges } from "../pedidos/PedidoItemsBadges";
import { formatCurrencyUSD, formatDate } from "./formatters";
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
        <table className={tableStyles.table}>
          <thead className={tableStyles.head}>
            <tr>
              <th className={tableStyles.th}>Pedido</th>
              <th className={tableStyles.th}>Cliente</th>
              <th className={tableStyles.th}>Fecha</th>
              <th className={tableStyles.th}>Canal</th>
              <th className={tableStyles.th}>Items</th>
              <th className={tableStyles.th}>Total venta</th>
              <th className={tableStyles.thRight}>Acciones</th>
            </tr>
          </thead>
          <tbody className={tableStyles.body}>
            {orders.length === 0 && (
              <tr>
                <td className={styles.empty} colSpan={7}>
                  No hay pedidos pendientes.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className={tableStyles.row}>
                <td className={tableStyles.td}>#{order.id}</td>
                <td className={tableStyles.td}>
                  <div className={tableStyles.cellStack}>
                    <p className={tableStyles.primaryText}>
                      {order.customer.first_name} {order.customer.last_name}
                    </p>
                    <p className={tableStyles.secondaryText}>{order.customer.id_number}</p>
                  </div>
                </td>
                <td className={tableStyles.td}>{formatDate(order.order_date)}</td>
                <td className={tableStyles.td}>{getChannelLabel(order.channel)}</td>
                <td className={`${tableStyles.td} ${styles.itemsCell}`}>
                  <PedidoItemsBadges items={order.items} maxVisible={3} stacked />
                </td>
                <td className={tableStyles.td}>{formatCurrencyUSD(order.sold_amount_usd)}</td>
                <td className={tableStyles.tdRight}>
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
