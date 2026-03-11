import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../../components/ui/Button";
import formStyles from "../../components/ui/FormLayout.module.css";
import { toApiError } from "../../lib/api";
import { DireccionesEditor } from "./DireccionesEditor";
import type {
  Cliente,
  ClienteCreateInput,
  ClienteFormSubmitPayload,
  ClienteUpdateInput,
  DireccionDraft,
  DireccionFieldName,
  Pais,
} from "./types";
import { ensurePrimaryAddress, isClienteFormSubmissionError } from "./utils";

type ClienteFormValues = {
  first_name: string;
  last_name: string;
  id_number: string;
  email: string;
  phone: string;
  country: number;
};

type ClienteFormProps = {
  mode: "create" | "edit";
  initialData: Cliente | null;
  initialAddresses?: DireccionDraft[];
  paises: Pais[];
  onSubmit: (data: ClienteFormSubmitPayload) => Promise<void>;
  onCancel: () => void;
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
const addressSchema = z.object({
  province: z.string().trim().min(1, "La provincia es obligatoria."),
  city: z.string().trim().min(1, "La ciudad es obligatoria."),
  address_line: z.string().trim(),
  is_primary: z.boolean(),
});

export function ClienteForm({
  mode,
  initialData,
  initialAddresses = [],
  paises,
  onSubmit,
  onCancel,
}: ClienteFormProps) {
  const [submitError, setSubmitError] = useState("");
  const [addresses, setAddresses] = useState<DireccionDraft[]>([]);
  const [addressErrors, setAddressErrors] = useState<Record<number, Partial<Record<DireccionFieldName, string>>>>({});

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

  useEffect(() => {
    setAddresses(initialAddresses);
    setAddressErrors({});
  }, [initialAddresses]);

  const updateAddress = (index: number, patch: Partial<DireccionDraft>) => {
    setAddresses((previous) => {
      const next = [...previous];
      next[index] = { ...next[index], ...patch };
      return next;
    });
    setAddressErrors((previous) => ({ ...previous, [index]: {} }));
  };

  const addAddress = () => {
    setAddresses((previous) => [
      ...previous,
      {
        province: "",
        city: "",
        address_line: "",
        is_primary: previous.length === 0,
      },
    ]);
  };

  const removeAddress = (index: number) => {
    setAddresses((previous) => ensurePrimaryAddress(previous.filter((_, itemIndex) => itemIndex !== index)));
    setAddressErrors((previous) => {
      const nextEntries = Object.entries(previous)
        .filter(([key]) => Number(key) !== index)
        .map(([key, value]) => {
          const numericKey = Number(key);
          return [numericKey > index ? numericKey - 1 : numericKey, value] as const;
        });
      return Object.fromEntries(nextEntries);
    });
  };

  const setPrimaryAddress = (index: number) => {
    setAddresses((previous) =>
      previous.map((address, itemIndex) => ({
        ...address,
        is_primary: itemIndex === index,
      })),
    );
  };

  const submit = handleSubmit(async (values) => {
    setSubmitError("");
    setAddressErrors({});

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

    const nextAddressErrors: Record<number, Partial<Record<DireccionFieldName, string>>> = {};
    const normalizedAddresses = ensurePrimaryAddress(addresses);
    let hasAddressError = false;

    normalizedAddresses.forEach((address, index) => {
      const parsedAddress = addressSchema.safeParse(address);
      if (!parsedAddress.success) {
        hasAddressError = true;
        nextAddressErrors[index] = {};
        for (const issue of parsedAddress.error.issues) {
          const fieldName = issue.path[0];
          if (typeof fieldName === "string" && fieldName in address) {
            nextAddressErrors[index][fieldName as DireccionFieldName] = issue.message;
          }
        }
      }
    });

    if (hasAddressError) {
      setAddressErrors(nextAddressErrors);
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
      await onSubmit({
        customer: payload,
        addresses: normalizedAddresses,
      });
    } catch (error) {
      if (isClienteFormSubmissionError(error)) {
        if (error.customerFieldErrors) {
          for (const [fieldName, message] of Object.entries(error.customerFieldErrors)) {
            if (message) {
              setError(fieldName as keyof ClienteFormValues, { message });
            }
          }
        }
        if (error.addressFieldErrors) {
          setAddressErrors(error.addressFieldErrors);
        }
        if (error.detail) {
          setSubmitError(error.detail);
          return;
        }
      }

      const apiError = toApiError(error);
      setSubmitError(apiError.detail);
    }
  });

  return (
    <form onSubmit={submit} className={formStyles.form}>
      <div className={formStyles.intro}>
        <p className={formStyles.introTitle}>
          {mode === "create" ? "Registrar cliente" : "Actualizar cliente"}
        </p>
        <p className={formStyles.introText}>
          Completa los datos principales para mantener el maestro de clientes consistente.
        </p>
      </div>

      <div className={formStyles.formGrid}>
        <div className={formStyles.field}>
          <label htmlFor="first_name">Nombres</label>
          <input id="first_name" type="text" {...register("first_name")} />
          {errors.first_name && <p className={formStyles.errorText}>{errors.first_name.message}</p>}
        </div>

        <div className={formStyles.field}>
          <label htmlFor="last_name">Apellidos</label>
          <input id="last_name" type="text" {...register("last_name")} />
          {errors.last_name && <p className={formStyles.errorText}>{errors.last_name.message}</p>}
        </div>

        <div className={formStyles.field}>
          <label htmlFor="id_number">Identificacion</label>
          <input id="id_number" type="text" {...register("id_number")} disabled={mode === "edit"} />
          {mode === "edit" && <p className={formStyles.hint}>La identificacion no se puede modificar.</p>}
          {errors.id_number && <p className={formStyles.errorText}>{errors.id_number.message}</p>}
        </div>

        <div className={formStyles.field}>
          <label htmlFor="country">Pais</label>
          <select id="country" {...register("country", { valueAsNumber: true })}>
            <option value={0}>Seleccione un pais</option>
            {paises.map((pais) => (
              <option key={pais.id} value={pais.id}>
                {pais.name}
              </option>
            ))}
          </select>
          {errors.country && <p className={formStyles.errorText}>{errors.country.message}</p>}
        </div>

        <div className={formStyles.field}>
          <label htmlFor="email">Correo</label>
          <input id="email" type="email" placeholder="cliente@empresa.com" {...register("email")} />
          {errors.email && <p className={formStyles.errorText}>{errors.email.message}</p>}
        </div>

        <div className={formStyles.field}>
          <label htmlFor="phone">Telefono</label>
          <input id="phone" type="text" placeholder="+57 300 000 0000" {...register("phone")} />
          {errors.phone && <p className={formStyles.errorText}>{errors.phone.message}</p>}
        </div>
      </div>

      <DireccionesEditor
        addresses={addresses}
        errors={addressErrors}
        onAdd={addAddress}
        onRemove={removeAddress}
        onChange={updateAddress}
        onSetPrimary={setPrimaryAddress}
      />

      {submitError && <p className={formStyles.errorBox}>{submitError}</p>}

      <div className={formStyles.actions}>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar"}
        </Button>
        <Button type="button" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
