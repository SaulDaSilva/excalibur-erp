import { Link } from "react-router-dom";

import { Card } from "../../components/ui/Card";
import { TableCard } from "../../components/ui/TableCard";
import { formatCurrencyUSD, formatDateTime, itemsSummary } from "./formatters";
import type { PendingOrder } from "./types";

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
        <h2 className="text-lg font-semibold text-slate-900">Pedidos pendientes</h2>
        <p className="mt-3 text-sm text-slate-600">Cargando...</p>
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 md:px-5">
        <h2 className="text-lg font-semibold text-slate-900">Pedidos pendientes</h2>
      </div>

      <TableCard className="rounded-none border-0 shadow-none" scrollAreaClassName="h-[28rem]">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium md:px-5">Pedido</th>
              <th className="px-4 py-3 font-medium md:px-5">Cliente</th>
              <th className="px-4 py-3 font-medium md:px-5">Fecha</th>
              <th className="px-4 py-3 font-medium md:px-5">Canal</th>
              <th className="px-4 py-3 font-medium md:px-5">Items</th>
              <th className="px-4 py-3 font-medium md:px-5">Total venta</th>
              <th className="px-4 py-3 font-medium text-right md:px-5">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-slate-500 md:px-5" colSpan={7}>
                  No hay pedidos pendientes.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 md:px-5">#{order.id}</td>
                <td className="px-4 py-3 md:px-5">
                  <p className="font-medium text-slate-900">
                    {order.customer.first_name} {order.customer.last_name}
                  </p>
                  <p className="text-xs text-slate-500">{order.customer.id_number}</p>
                </td>
                <td className="px-4 py-3 md:px-5">{formatDateTime(order.created_at)}</td>
                <td className="px-4 py-3 md:px-5">{getChannelLabel(order.channel)}</td>
                <td className="px-4 py-3 md:px-5 text-slate-700">{itemsSummary(order.items)}</td>
                <td className="px-4 py-3 md:px-5">{formatCurrencyUSD(order.sold_amount_usd)}</td>
                <td className="px-4 py-3 text-right md:px-5">
                  <Link
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50"
                    to="/pedidos"
                  >
                    Ver en Pedidos
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
