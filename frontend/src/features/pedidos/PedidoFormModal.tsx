import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

import { Button } from "../../components/ui/Button";
import { toApiError } from "../../lib/api";
import { PedidoItemsEditor } from "./PedidoItemsEditor";
import { useClientesForSelect, useDireccionesByCliente, useVariantesForPedidos } from "./hooks";
import type { OrderCreatePayload, PedidoItemPayload } from "./types";

type PedidoFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: OrderCreatePayload) => Promise<void>;
};

type PedidoFormState = {
  customer: number;
  shipping_address: number;
  channel: "WHATSAPP" | "CALL";
  items: PedidoItemPayload[];
};

const initialItem: PedidoItemPayload = {
  kind: "SALE",
  product_variant: 0,
  quantity_pairs: 1,
  unit_price: "1.00",
};

const schema = z
  .object({
    customer: z.number().int().positive("El cliente es obligatorio."),
    shipping_address: z.number().int().positive("La direccion de envio es obligatoria."),
    channel: z.enum(["WHATSAPP", "CALL"]),
    items: z
      .array(
        z.object({
          kind: z.enum(["SALE", "PROMO"]),
          product_variant: z.number().int().positive("La variante es obligatoria."),
          quantity_pairs: z.number().int().positive("La cantidad debe ser mayor que 0."),
          unit_price: z.string(),
        }),
      )
      .min(1, "Debe agregar al menos un item."),
  })
  .superRefine((values, ctx) => {
    values.items.forEach((item, index) => {
      const price = Number(item.unit_price);
      if (item.kind === "PROMO" && Number(item.unit_price).toFixed(2) !== "0.00") {
        ctx.addIssue({
          code: "custom",
          message: "PROMO debe tener precio unitario 0.00.",
          path: ["items", index, "unit_price"],
        });
      }
      if (item.kind === "SALE" && (!Number.isFinite(price) || price <= 0)) {
        ctx.addIssue({
          code: "custom",
          message: "SALE debe tener precio unitario mayor que 0.",
          path: ["items", index, "unit_price"],
        });
      }
    });
  });

export function PedidoFormModal({ open, onClose, onSubmit }: PedidoFormModalProps) {
  const [form, setForm] = useState<PedidoFormState>({
    customer: 0,
    shipping_address: 0,
    channel: "WHATSAPP",
    items: [initialItem],
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clientesQuery = useClientesForSelect();
  const variantesQuery = useVariantesForPedidos();
  const direccionesQuery = useDireccionesByCliente(form.customer > 0 ? form.customer : null);

  useEffect(() => {
    setForm((previous) => ({ ...previous, shipping_address: 0 }));
  }, [form.customer]);

  const addresses = useMemo(() => direccionesQuery.data ?? [], [direccionesQuery.data]);

  if (!open) {
    return null;
  }

  const setItemPatch = (index: number, patch: Partial<PedidoItemPayload>) => {
    setForm((previous) => {
      const nextItems = [...previous.items];
      nextItems[index] = { ...nextItems[index], ...patch };
      return { ...previous, items: nextItems };
    });
  };

  const addItem = () => {
    setForm((previous) => ({ ...previous, items: [...previous.items, initialItem] }));
  };

  const removeItem = (index: number) => {
    setForm((previous) => ({
      ...previous,
      items: previous.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const submit = async () => {
    setErrorMessage("");
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? "Formulario invalido.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(parsed.data);
      setForm({
        customer: 0,
        shipping_address: 0,
        channel: "WHATSAPP",
        items: [initialItem],
      });
      onClose();
    } catch (error) {
      setErrorMessage(toApiError(error).detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4"
    >
      <div className="w-full max-w-[680px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <h2 className="text-lg font-semibold text-slate-900">Nuevo pedido</h2>

        {(clientesQuery.isLoading || variantesQuery.isLoading) && <p className="mt-3 text-sm text-slate-600">Cargando...</p>}
        {(clientesQuery.isError || variantesQuery.isError) && (
          <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {toApiError(clientesQuery.error ?? variantesQuery.error).detail}
          </p>
        )}

        <div className="mt-4 space-y-3">
          <label>Cliente</label>
          <select value={form.customer} onChange={(event) => setForm({ ...form, customer: Number(event.target.value) })}>
            <option value={0}>Seleccione un cliente</option>
            {(clientesQuery.data?.results ?? []).map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.first_name} {cliente.last_name} ({cliente.id_number})
              </option>
            ))}
          </select>

          <label>Direccion de envio</label>
          <select
            value={form.shipping_address}
            onChange={(event) => setForm({ ...form, shipping_address: Number(event.target.value) })}
            disabled={form.customer <= 0 || direccionesQuery.isLoading}
          >
            <option value={0}>Seleccione una direccion</option>
            {addresses.map((address) => (
              <option key={address.id} value={address.id}>
                {address.province} - {address.city} - {address.address_line}
              </option>
            ))}
          </select>

          <label>Canal</label>
          <select
            value={form.channel}
            onChange={(event) => setForm({ ...form, channel: event.target.value as "WHATSAPP" | "CALL" })}
          >
            <option value="WHATSAPP">WhatsApp</option>
            <option value="CALL">Llamada</option>
          </select>

          <PedidoItemsEditor
            items={form.items}
            variantes={variantesQuery.data?.results ?? []}
            onAdd={addItem}
            onRemove={removeItem}
            onChange={setItemPatch}
          />
        </div>

        {errorMessage && (
          <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>
        )}

        <div className="mt-4 flex gap-2">
          <Button type="button" variant="primary" onClick={submit} disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Crear"}
          </Button>
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
