import { useMemo, useState } from "react";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { toApiError } from "../../lib/api";
import { useVariantesForInventario } from "./hooks";
import type { ManualMovementPayload, ManualMovementType } from "./types";

type ManualMovementFormProps = {
  onSubmit: (payload: ManualMovementPayload) => Promise<void>;
  loading: boolean;
};

type NormalizedFormError = {
  detail?: string;
  non_field_errors?: string[];
  fieldErrors: Record<string, string[]>;
};

function toStringList(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return [];
}

function normalizeFormError(error: unknown): NormalizedFormError {
  const apiError = toApiError(error);
  const normalized: NormalizedFormError = {
    fieldErrors: {},
  };

  if (apiError.data && typeof apiError.data === "object") {
    const record = apiError.data as Record<string, unknown>;
    for (const [key, value] of Object.entries(record)) {
      if (key === "detail") {
        const detailValues = toStringList(value);
        if (detailValues.length > 0) {
          normalized.detail = detailValues[0];
        }
        continue;
      }
      if (key === "non_field_errors") {
        const nonFieldErrors = toStringList(value);
        if (nonFieldErrors.length > 0) {
          normalized.non_field_errors = nonFieldErrors;
        }
        continue;
      }

      const messages = toStringList(value);
      if (messages.length > 0) {
        normalized.fieldErrors[key] = messages;
      }
    }
  }

  if (!normalized.detail && apiError.detail) {
    normalized.detail = apiError.detail;
  }

  return normalized;
}

export function ManualMovementForm({ onSubmit, loading }: ManualMovementFormProps) {
  const [movementType, setMovementType] = useState<ManualMovementType | "">("");
  const [productVariant, setProductVariant] = useState(0);
  const [quantityPairs, setQuantityPairs] = useState<number | "">(1);
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<NormalizedFormError>({ fieldErrors: {} });

  const variantesQuery = useVariantesForInventario();
  const variants = useMemo(() => variantesQuery.data ?? [], [variantesQuery.data]);

  const setFieldError = (field: string, message: string) => {
    setFormError((previous) => ({
      ...previous,
      fieldErrors: { ...previous.fieldErrors, [field]: [message] },
    }));
  };

  const clearErrors = () => {
    setFormError({ fieldErrors: {} });
  };

  const submit = async () => {
    clearErrors();

    let hasUxError = false;
    if (!movementType) {
      setFieldError("movement_type", "Seleccione un tipo de movimiento.");
      hasUxError = true;
    }
    if (productVariant <= 0) {
      setFieldError("product_variant", "Seleccione una variante de producto.");
      hasUxError = true;
    }
    if (quantityPairs === "" || Number.isNaN(Number(quantityPairs))) {
      setFieldError("quantity_pairs", "La cantidad es obligatoria.");
      hasUxError = true;
    }
    if (movementType === "ADJUSTMENT" && !note.trim()) {
      setFieldError("note", "La nota es obligatoria para un ajuste.");
      hasUxError = true;
    }

    if (hasUxError) {
      return;
    }

    try {
      await onSubmit({
        movement_type: movementType as ManualMovementType,
        product_variant: productVariant,
        quantity_pairs: Number(quantityPairs),
        note,
      });
    } catch (error) {
      setFormError(normalizeFormError(error));
    }
  };

  const hintText =
    movementType === "PRODUCTION"
      ? "Sugerencia: la cantidad debe ser mayor que 0."
      : movementType === "ADJUSTMENT"
        ? "Sugerencia: la cantidad no puede ser 0 y la nota es obligatoria."
        : "Seleccione un tipo de movimiento para ver la guia.";

  return (
    <Card className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-900">Nuevo movimiento manual</h2>

      {formError.detail && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError.detail}</p>
      )}
      {formError.non_field_errors?.map((message, index) => (
        <p key={`${message}-${index}`} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {message}
        </p>
      ))}

      {variantesQuery.isLoading && <p className="text-sm text-slate-600">Cargando variantes...</p>}
      {variantesQuery.isError && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {toApiError(variantesQuery.error).detail}
        </p>
      )}

      <div className="grid gap-3">
        <label htmlFor="movement_type">Tipo de movimiento</label>
        <select id="movement_type" value={movementType} onChange={(event) => setMovementType(event.target.value as ManualMovementType | "")}>
          <option value="">Seleccione un tipo</option>
          <option value="PRODUCTION">Produccion</option>
          <option value="ADJUSTMENT">Ajuste</option>
        </select>
        {formError.fieldErrors.movement_type?.map((message, index) => (
          <p key={`${message}-${index}`} className="text-xs text-rose-600">
            {message}
          </p>
        ))}

        <label htmlFor="product_variant">Variante de producto</label>
        <select id="product_variant" value={productVariant} onChange={(event) => setProductVariant(Number(event.target.value))}>
          <option value={0}>Seleccione una variante</option>
          {variants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.product_name} - {variant.measure_mm}mm
            </option>
          ))}
        </select>
        {formError.fieldErrors.product_variant?.map((message, index) => (
          <p key={`${message}-${index}`} className="text-xs text-rose-600">
            {message}
          </p>
        ))}

        <label htmlFor="quantity_pairs">Cantidad de pares</label>
        <input
          id="quantity_pairs"
          type="number"
          value={quantityPairs}
          onChange={(event) => setQuantityPairs(event.target.value === "" ? "" : Number(event.target.value))}
        />
        {formError.fieldErrors.quantity_pairs?.map((message, index) => (
          <p key={`${message}-${index}`} className="text-xs text-rose-600">
            {message}
          </p>
        ))}

        <label htmlFor="note">
          Nota {movementType === "ADJUSTMENT" ? "(obligatoria)" : "(opcional)"}
        </label>
        <textarea id="note" value={note} onChange={(event) => setNote(event.target.value)} rows={3} />
        {formError.fieldErrors.note?.map((message, index) => (
          <p key={`${message}-${index}`} className="text-xs text-rose-600">
            {message}
          </p>
        ))}
      </div>

      <p className="text-sm text-slate-600">{hintText}</p>

      <Button variant="primary" onClick={submit} disabled={loading || variantesQuery.isLoading}>
        {loading ? "Guardando..." : "Crear movimiento"}
      </Button>
    </Card>
  );
}
