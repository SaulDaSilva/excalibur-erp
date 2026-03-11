import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import styles from "../components/ui/DataTable.module.css";
import { Notice } from "../components/ui/Notice";
import { PageHeader } from "../components/ui/PageHeader";
import {
  useCancelPedido,
  useDeletePedido,
  useDispatchPedido,
  usePedido,
} from "../features/pedidos/hooks";
import {
  calculatePedidoItemSubtotal,
  formatPedidoChannel,
  formatPedidoCurrency,
  formatPedidoDateTime,
  formatPedidoStatus,
} from "../features/pedidos/formatters";
import { toApiError } from "../lib/api";

export function PedidoDetallePage() {
  const navigate = useNavigate();
  const params = useParams();
  const pedidoId = Number(params.pedidoId);
  const hasValidPedidoId = Number.isInteger(pedidoId) && pedidoId > 0;
  const [pageError, setPageError] = useState("");

  const pedidoQuery = usePedido(hasValidPedidoId ? pedidoId : null);
  const dispatchPedido = useDispatchPedido();
  const cancelPedido = useCancelPedido();
  const deletePedido = useDeletePedido();

  const blockingError =
    (!hasValidPedidoId && "El pedido solicitado no es valido.") ||
    (pedidoQuery.isError && toApiError(pedidoQuery.error).detail) ||
    "";

  const isMutating =
    dispatchPedido.isPending || cancelPedido.isPending || deletePedido.isPending;

  const handleDispatch = async () => {
    if (!pedidoQuery.data) {
      return;
    }
    if (!window.confirm(`Despachar pedido #${pedidoQuery.data.id}?`)) {
      return;
    }

    setPageError("");
    try {
      await dispatchPedido.mutateAsync(pedidoQuery.data.id);
    } catch (error) {
      setPageError(toApiError(error).detail);
    }
  };

  const handleCancel = async () => {
    if (!pedidoQuery.data) {
      return;
    }
    if (!window.confirm(`Cancelar pedido #${pedidoQuery.data.id}?`)) {
      return;
    }

    setPageError("");
    try {
      await cancelPedido.mutateAsync(pedidoQuery.data.id);
    } catch (error) {
      setPageError(toApiError(error).detail);
    }
  };

  const handleDelete = async () => {
    if (!pedidoQuery.data) {
      return;
    }
    if (!window.confirm(`Eliminar pedido #${pedidoQuery.data.id}?`)) {
      return;
    }

    setPageError("");
    try {
      await deletePedido.mutateAsync(pedidoQuery.data.id);
      navigate("/pedidos", { replace: true });
    } catch (error) {
      setPageError(toApiError(error).detail);
    }
  };

  return (
    <section className="space-y-4">
      <PageHeader
        actions={
          <div className="flex flex-wrap gap-2">
            {pedidoQuery.data?.status === "PENDING" && (
              <Button type="button" size="sm" variant="primary" disabled={isMutating} onClick={handleDispatch}>
                Despachar
              </Button>
            )}
            {pedidoQuery.data?.status !== "CANCELLED" && pedidoQuery.data && (
              <Button type="button" size="sm" disabled={isMutating} onClick={handleCancel}>
                Cancelar
              </Button>
            )}
            {pedidoQuery.data?.status === "PENDING" && (
              <Button type="button" size="sm" variant="danger" disabled={isMutating} onClick={handleDelete}>
                Eliminar
              </Button>
            )}
            <Button type="button" size="sm" onClick={() => navigate("/pedidos")}>
              Volver a pedidos
            </Button>
          </div>
        }
      />

      {pedidoQuery.isLoading && <Notice variant="info" message="Cargando..." />}
      {blockingError && <Notice variant="error" message={blockingError} />}
      {pageError && <Notice variant="error" message={pageError} />}

      {!pedidoQuery.isLoading && !blockingError && pedidoQuery.data && (
        <>
          <Card className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Cliente</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {pedidoQuery.data.customer.first_name} {pedidoQuery.data.customer.last_name}
                </p>
                <p className="text-sm text-slate-600">{pedidoQuery.data.customer.id_number}</p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Estado</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatPedidoStatus(pedidoQuery.data.status)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Canal</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatPedidoChannel(pedidoQuery.data.channel)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Creado</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatPedidoDateTime(pedidoQuery.data.created_at)}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Direccion de envio</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {pedidoQuery.data.shipping_address.province} - {pedidoQuery.data.shipping_address.city}
                </p>
                <p className="text-sm text-slate-600">{pedidoQuery.data.shipping_address.address_line || "-"}</p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total pares</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {pedidoQuery.data.total_pairs ?? "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total venta</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatPedidoCurrency(pedidoQuery.data.sold_amount)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-0">
            <div className="border-b border-slate-200 px-4 py-3 md:px-5">
              <h2 className="text-lg font-semibold text-slate-900">Items del pedido</h2>
            </div>

            <div className="overflow-auto">
              <table className={styles.table}>
                <thead className={styles.head}>
                  <tr>
                    <th className={styles.th}>Producto</th>
                    <th className={styles.th}>Tipo</th>
                    <th className={styles.th}>Cantidad</th>
                    <th className={styles.th}>Precio unitario</th>
                    <th className={styles.th}>Subtotal</th>
                  </tr>
                </thead>
                <tbody className={styles.body}>
                  {pedidoQuery.data.items.map((item) => (
                    <tr key={item.id} className={styles.row}>
                      <td className={styles.td}>
                        <div className={styles.cellStack}>
                          <p className={styles.primaryText}>{item.product_variant.product.name}</p>
                          <p className={styles.secondaryText}>{item.product_variant.measure_mm}mm</p>
                        </div>
                      </td>
                      <td className={styles.td}>{item.kind === "SALE" ? "Venta" : "Promocion"}</td>
                      <td className={styles.td}>{item.quantity_pairs}</td>
                      <td className={styles.td}>{formatPedidoCurrency(item.unit_price)}</td>
                      <td className={styles.td}>{formatPedidoCurrency(calculatePedidoItemSubtotal(item))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </section>
  );
}
