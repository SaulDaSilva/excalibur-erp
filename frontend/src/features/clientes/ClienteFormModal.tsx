import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../../components/ui/Button";
import { toApiError } from "../../lib/api";
import type { Cliente, ClienteCreateInput, ClienteUpdateInput, Pais } from "./types";

type ClienteFormValues = {
  first_name: string;
  last_name: string;
  id_number: string;
  email: string;
  phone: string;
  country: number;
};

type ClienteFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  initialData: Cliente | null;
  paises: Pais[];
  onSubmit: (data: ClienteCreateInput | ClienteUpdateInput) => Promise<void>;
  onClose: () => void;
};

const createSchema = z.object({
  first_name: z.string().trim().min(1, "Los nombres son obligatorios."),
  last_name: z.string().trim().min(1, "Los apellidos son obligatorios."),
  id_number: z.string().trim().min(1, "La identificacion es obligatoria."),
  email: z.string().trim(),
  phone: z.string().trim(),
  country: z.number().int().positive("El pais es obligatorio."),
});

const editSchema = createSchema.omit({ id_number: true });

function parseBackendMessage(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }
  return undefined;
}

export function ClienteFormModal({
  open,
  mode,
  initialData,
  paises,
  onSubmit,
  onClose,
}: ClienteFormModalProps) {
  const [submitError, setSubmitError] = useState("");

  const defaultValues = useMemo<ClienteFormValues>(
    () => ({
      first_name: initialData?.first_name ?? "",
      last_name: initialData?.last_name ?? "",
      id_number: initialData?.id_number ?? "",
      email: initialData?.email ?? "",
      phone: initialData?.phone ?? "",
      country: initialData?.country ?? 0,
    }),
    [initialData],
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormValues>({ defaultValues });

  useEffect(() => {
    reset(defaultValues);
    setSubmitError("");
  }, [defaultValues, reset]);

  if (!open) {
    return null;
  }

  const submit = handleSubmit(async (values) => {
    setSubmitError("");

    const parsed = mode === "create" ? createSchema.safeParse(values) : editSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const fieldName = issue.path[0];
        if (typeof fieldName === "string") {
          setError(fieldName as keyof ClienteFormValues, { message: issue.message });
        }
      }
      return;
    }

    const payload: ClienteCreateInput | ClienteUpdateInput =
      mode === "create"
        ? parsed.data
        : {
            first_name: parsed.data.first_name,
            last_name: parsed.data.last_name,
            email: parsed.data.email,
            phone: parsed.data.phone,
            country: parsed.data.country,
          };

    try {
      await onSubmit(payload);
      onClose();
    } catch (error) {
      const apiError = toApiError(error);
      const data = apiError.data;
      if (data && typeof data === "object") {
        const errorRecord = data as Record<string, unknown>;
        (["first_name", "last_name", "id_number", "email", "phone", "country"] as const).forEach(
          (fieldName) => {
            const message = parseBackendMessage(errorRecord[fieldName]);
            if (message) {
              setError(fieldName, { message });
            }
          },
        );
        const detailMessage = parseBackendMessage(errorRecord.detail);
        if (detailMessage) {
          setSubmitError(detailMessage);
          return;
        }
      }
      setSubmitError(apiError.detail);
    }
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4"
    >
      <div className="w-full max-w-[520px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <h2 className="text-lg font-semibold text-slate-900">{mode === "create" ? "Nuevo cliente" : "Editar cliente"}</h2>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <label htmlFor="first_name">Nombres</label>
          <input id="first_name" type="text" {...register("first_name")} />
          {errors.first_name && <p className="text-xs text-rose-600">{errors.first_name.message}</p>}

          <label htmlFor="last_name">Apellidos</label>
          <input id="last_name" type="text" {...register("last_name")} />
          {errors.last_name && <p className="text-xs text-rose-600">{errors.last_name.message}</p>}

          <label htmlFor="id_number">Identificacion</label>
          <input id="id_number" type="text" {...register("id_number")} disabled={mode === "edit"} />
          {errors.id_number && <p className="text-xs text-rose-600">{errors.id_number.message}</p>}

          <label htmlFor="email">Correo</label>
          <input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-rose-600">{errors.email.message}</p>}

          <label htmlFor="phone">Telefono</label>
          <input id="phone" type="text" {...register("phone")} />
          {errors.phone && <p className="text-xs text-rose-600">{errors.phone.message}</p>}

          <label htmlFor="country">Pais</label>
          <select id="country" {...register("country", { valueAsNumber: true })}>
            <option value={0}>Seleccione un pais</option>
            {paises.map((pais) => (
              <option key={pais.id} value={pais.id}>
                {pais.name}
              </option>
            ))}
          </select>
          {errors.country && <p className="text-xs text-rose-600">{errors.country.message}</p>}

          {submitError && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{submitError}</p>}

          <div className="mt-4 flex gap-2">
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
            <Button type="button" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
