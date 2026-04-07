import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

import { Button } from "../../components/ui/Button";
import formStyles from "../../components/ui/FormLayout.module.css";
import { toApiError } from "../../lib/api";
import type { Cliente } from "../clientes/types";
import { PedidoCustomerSearch } from "./PedidoCustomerSearch";
import { PedidoItemsEditor } from "./PedidoItemsEditor";
import { useDireccionesByCliente, useVariantesForPedidos } from "./hooks";
import type { OrderCreatePayload, PedidoItemPayload } from "./types";

type PedidoFormProps = {
  onSubmit: (payload: OrderCreatePayload) => Promise<void>;
  onCancel: () => void;
};

type PedidoFormState = {
  customer: number;
  shipping_address: number;
  channel: "WHATSAPP" | "CALL";
  order_date: string;
  items: PedidoItemPayload[];
};

function getTodayInputValue(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const initialItem: PedidoItemPayload = {
  kind: "SALE",
  product_variant: 0,
  quantity_pairs: 1,
  unit_price: "1.00",
};

function createInitialFormState(): PedidoFormState {
  return {
    customer: 0,
    shipping_address: 0,
    channel: "WHATSAPP",
    order_date: getTodayInputValue(),
    items: [{ ...initialItem }],
  };
}

const schema = z
  .object({
    customer: z.number().int().positive("El cliente es obligatorio."),
    shipping_address: z.number().int().positive("La direccion de envio es obligatoria."),
    channel: z.enum(["WHATSAPP", "CALL"]),
    order_date: z
      .string()
      .min(1, "La fecha del pedido es obligatoria.")
      .refine((value) => value <= getTodayInputValue(), "La fecha del pedido no puede ser futura."),
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

export function PedidoForm({ onSubmit, onCancel }: PedidoFormProps) {
  const [form, setForm] = useState<PedidoFormState>(() => createInitialFormState());
  const [selectedCustomer, setSelectedCustomer] = useState<Cliente | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const variantesQuery = useVariantesForPedidos();
  const direccionesQuery = useDireccionesByCliente(form.customer > 0 ? form.customer : null);

  useEffect(() => {
    setForm((previous) => ({ ...previous, shipping_address: 0 }));
  }, [form.customer]);

  const addresses = useMemo(() => direccionesQuery.data ?? [], [direccionesQuery.data]);

  const setItemPatch = (index: number, patch: Partial<PedidoItemPayload>) => {
    setForm((previous) => {
      const nextItems = [...previous.items];
      nextItems[index] = { ...nextItems[index], ...patch };
      return { ...previous, items: nextItems };
    });
  };

  const addItem = () => {
    setForm((previous) => ({
      ...previous,
      items: [...previous.items, { ...initialItem }],
    }));
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
      setForm(createInitialFormState());
      setSelectedCustomer(null);
    } catch (error) {
      setErrorMessage(toApiError(error).detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {variantesQuery.isLoading && <p className="text-sm text-slate-600">Cargando...</p>}
      {variantesQuery.isError && (
        <p className={formStyles.errorBox}>
          {toApiError(variantesQuery.error).detail}
        </p>
      )}

      <div className={formStyles.intro}>
        <p className={formStyles.introTitle}>Crear pedido</p>
        <p className={formStyles.introText}>
          Selecciona cliente, direccion de envio y agrega los items que formaran el pedido.
        </p>
      </div>

      <div className={formStyles.formGrid}>
        <PedidoCustomerSearch
          selectedCustomer={selectedCustomer}
          onSelect={(customer) => {
            setSelectedCustomer(customer);
            setForm((previous) => ({
              ...previous,
              customer: customer.id,
              shipping_address: 0,
            }));
          }}
          onClear={() => {
            setSelectedCustomer(null);
            setForm((previous) => ({
              ...previous,
              customer: 0,
              shipping_address: 0,
            }));
          }}
        />

        <div className={formStyles.field}>
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
          {form.customer > 0 && direccionesQuery.isLoading && (
            <p className={formStyles.hint}>Cargando direcciones...</p>
          )}
        </div>

        <div className={formStyles.field}>
          <label>Canal</label>
          <select
            value={form.channel}
            onChange={(event) => setForm({ ...form, channel: event.target.value as "WHATSAPP" | "CALL" })}
          >
            <option value="WHATSAPP">WhatsApp</option>
            <option value="CALL">Llamada</option>
          </select>
        </div>

        <div className={formStyles.field}>
          <label>Fecha del pedido</label>
          <input
            type="date"
            max={getTodayInputValue()}
            value={form.order_date}
            onChange={(event) => setForm({ ...form, order_date: event.target.value })}
          />
        </div>
      </div>

      <PedidoItemsEditor
        items={form.items}
        variantes={variantesQuery.data?.results ?? []}
        onAdd={addItem}
        onRemove={removeItem}
        onChange={setItemPatch}
      />

      {errorMessage && <p className={formStyles.errorBox}>{errorMessage}</p>}

      <div className={formStyles.actions}>
        <Button type="button" variant="primary" onClick={submit} disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Crear"}
        </Button>
        <Button type="button" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
