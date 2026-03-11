import { Button } from "../../components/ui/Button";
import styles from "../../components/ui/DataTable.module.css";
import { Notice } from "../../components/ui/Notice";
import { TableCard } from "../../components/ui/TableCard";
import { formatPedidoCurrency, formatPedidoDateTime, formatPedidoStatus } from "./formatters";
import { PedidoItemsBadges } from "./PedidoItemsBadges";
import type { Pedido } from "./types";

type PedidosTableProps = {
  data: Pedido[];
  onView: (pedido: Pedido) => void;
  onDispatch: (pedido: Pedido) => void;
  onCancel: (pedido: Pedido) => void;
  onDelete: (pedido: Pedido) => void;
};

export function PedidosTable({ data, onView, onDispatch, onCancel, onDelete }: PedidosTableProps) {
  if (data.length === 0) {
    return (
      <Notice variant="empty" message="No se encontraron pedidos." />
    );
  }

  return (
    <TableCard>
      <table className={styles.table}>
        <thead className={styles.head}>
          <tr>
            <th className={styles.th}>ID</th>
            <th className={styles.th}>Creado</th>
            <th className={styles.th}>Cliente</th>
            <th className={styles.th}>Estado</th>
            <th className={styles.th}>Items</th>
            <th className={styles.th}>Total pares</th>
            <th className={styles.th}>Total venta</th>
            <th className={styles.th}>Acciones</th>
          </tr>
        </thead>
        <tbody className={styles.body}>
          {data.map((pedido) => (
            <tr key={pedido.id} className={styles.row}>
              <td className={styles.td}>#{pedido.id}</td>
              <td className={styles.td}>{formatPedidoDateTime(pedido.created_at)}</td>
              <td className={styles.td}>
                <div className={styles.cellStack}>
                  <p className={styles.primaryText}>
                    {pedido.customer.first_name} {pedido.customer.last_name}
                  </p>
                </div>
              </td>
              <td className={styles.td}>{formatPedidoStatus(pedido.status)}</td>
              <td className={styles.td}>
                <PedidoItemsBadges items={pedido.items} />
              </td>
              <td className={styles.td}>{pedido.total_pairs ?? "-"}</td>
              <td className={styles.td}>{formatPedidoCurrency(pedido.sold_amount)}</td>
              <td className={styles.td}>
                <div className={styles.actions}>
                  <Button type="button" size="sm" onClick={() => onView(pedido)}>
                    Ver detalle
                  </Button>
                  {pedido.status === "PENDING" && (
                    <Button type="button" size="sm" variant="primary" onClick={() => onDispatch(pedido)}>
                      Despachar
                    </Button>
                  )}
                  {pedido.status !== "CANCELLED" && (
                    <Button type="button" size="sm" onClick={() => onCancel(pedido)}>
                      Cancelar
                    </Button>
                  )}
                  {pedido.status === "PENDING" && (
                    <Button type="button" size="sm" variant="danger" onClick={() => onDelete(pedido)}>
                      Eliminar
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableCard>
  );
}
