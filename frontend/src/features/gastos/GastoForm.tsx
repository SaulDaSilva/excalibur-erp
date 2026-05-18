import { useEffect, useMemo, useRef, useState } from "react";
import { type Path, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../../components/ui/Button";
import formStyles from "../../components/ui/FormLayout.module.css";
import { toApiError } from "../../lib/api";
import type {
  Expense,
  ExpenseCategory,
  ExpenseCreateInput,
  ExpenseDetails,
  ExpenseFormSubmitPayload,
  ExpenseFormGroup,
  ExpenseUpdateInput,
} from "./types";
import { EXPENSE_FIELDS, extractApiValidation, isExpenseFormSubmissionError } from "./utils";

type ExpenseDetailsFormValues = {
  destination: string;
  employee_name: string;
  payment_concept: string;
  service_provider_name: string;
};

type ExpenseFormValues = {
  group: ExpenseFormGroup | "";
  category: number;
  amount: string;
  description: string;
  expense_date: string;
  supplier_name: string;
  reference_number: string;
  notes: string;
  details: ExpenseDetailsFormValues;
};

type DynamicFieldIssue = {
  path: Path<ExpenseFormValues>;
  message: string;
};

type GastoFormProps = {
  mode: "create" | "edit";
  initialData: Expense | null;
  categories: ExpenseCategory[];
  onSubmit: (data: ExpenseFormSubmitPayload) => Promise<void>;
  onCancel: () => void;
};

const GROUP_OPTIONS: Array<{ value: ExpenseFormGroup; label: string }> = [
  { value: "LOGISTICA", label: "Logistica" },
  { value: "PERSONAL", label: "Personal" },
  { value: "PRODUCCION", label: "Produccion" },
  { value: "FISCAL", label: "Fiscal" },
  { value: "SERVICIOS", label: "Servicios" },
  { value: "MISCELANEO", label: "Miscelaneo" },
  { value: "VIAJES", label: "Viajes" },
];

const GROUP_VALUES = GROUP_OPTIONS.map((group) => group.value) as [ExpenseFormGroup, ...ExpenseFormGroup[]];

const expenseSchema = z.object({
  group: z.enum(GROUP_VALUES, {
    message: "El grupo es obligatorio.",
  }),
  category: z.number().int().positive("La categoria es obligatoria."),
  amount: z
    .string()
    .trim()
    .min(1, "El monto es obligatorio.")
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, "El monto debe ser mayor que 0."),
  description: z.string().trim().min(1, "La descripcion es obligatoria."),
  expense_date: z
    .string()
    .trim()
    .min(1, "La fecha del gasto es obligatoria.")
    .refine((value) => {
      const parsed = new Date(`${value}T00:00:00`);
      if (Number.isNaN(parsed.getTime())) {
        return false;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return parsed <= today;
    }, "La fecha del gasto no puede ser futura."),
  supplier_name: z.string().trim(),
  reference_number: z.string().trim(),
  notes: z.string().trim(),
  details: z.object({
    destination: z.string().trim(),
    employee_name: z.string().trim(),
    payment_concept: z.string().trim(),
    service_provider_name: z.string().trim(),
  }),
});

function createEmptyExpenseDetails(): ExpenseDetailsFormValues {
  return {
    destination: "",
    employee_name: "",
    payment_concept: "",
    service_provider_name: "",
  };
}

function createDefaultValues(initialData: Expense | null): ExpenseFormValues {
  const details = initialData?.details ?? {};
  return {
    group: initialData?.category_group ?? "",
    category: initialData?.category ?? 0,
    amount: initialData?.amount ?? "",
    description: initialData?.description ?? "",
    expense_date: initialData?.expense_date ?? "",
    supplier_name: initialData?.supplier_name ?? "",
    reference_number: initialData?.reference_number ?? "",
    notes: initialData?.notes ?? "",
    details: {
      destination: details.destination ?? "",
      employee_name: details.employee_name ?? "",
      payment_concept: details.payment_concept ?? "",
      service_provider_name: details.service_provider_name ?? "",
    },
  };
}

function shouldShowSupplierName(category: ExpenseCategory | null): boolean {
  if (!category) {
    return false;
  }

  return category.code === "DELIVERY_RUNS";
}

function shouldShowReferenceNumber(): boolean {
  return false;
}

function getDynamicIssues(
  values: ExpenseFormValues,
  category: ExpenseCategory | null,
): DynamicFieldIssue[] {
  if (!category || !category.form_group) {
    return [];
  }

  const issues: DynamicFieldIssue[] = [];
  const group = category.form_group as ExpenseFormGroup;

  if (group === "VIAJES" && !values.details.destination.trim()) {
    issues.push({
      path: "details.destination",
      message: "El destino es obligatorio para gastos de viajes.",
    });
  }

  if (group === "PERSONAL") {
    if (!values.details.employee_name.trim()) {
      issues.push({
        path: "details.employee_name",
        message: "El nombre del empleado es obligatorio.",
      });
    }
    if (!values.details.payment_concept.trim()) {
      issues.push({
        path: "details.payment_concept",
        message: "El concepto del pago es obligatorio.",
      });
    }
  }

  if (group === "SERVICIOS" && !values.details.service_provider_name.trim()) {
    issues.push({
      path: "details.service_provider_name",
      message: "El nombre del prestador del servicio es obligatorio.",
    });
  }

  return issues;
}

function buildExpenseDetails(
  values: ExpenseFormValues,
  category: ExpenseCategory | null,
): ExpenseDetails {
  if (!category || !category.form_group) {
    return {};
  }

  switch (category.form_group as ExpenseFormGroup) {
    case "VIAJES":
      return {
        destination: values.details.destination.trim(),
      };
    case "PERSONAL":
      return {
        employee_name: values.details.employee_name.trim(),
        payment_concept: values.details.payment_concept.trim(),
      };
    case "SERVICIOS":
      return {
        service_provider_name: values.details.service_provider_name.trim(),
      };
    default:
      return {};
  }
}

export function GastoForm({ mode, initialData, categories, onSubmit, onCancel }: GastoFormProps) {
  const [submitError, setSubmitError] = useState("");
  const defaultValues = useMemo(() => createDefaultValues(initialData), [initialData]);
  const previousGroup = useRef<ExpenseFormGroup | "">(defaultValues.group);
  const previousCategoryId = useRef<number | null>(defaultValues.category || null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    getValues,
    watch,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({ defaultValues });

  const selectedGroup = watch("group");
  const selectedCategoryId = watch("category");
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  );
  const groupCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.form_group === selectedGroup &&
          (category.is_system || category.id === selectedCategoryId),
      ),
    [categories, selectedCategoryId, selectedGroup],
  );
  const visibleCategories = useMemo(
    () => {
      if (!selectedGroup) {
        return selectedCategory ? [selectedCategory] : [];
      }
      return groupCategories;
    },
    [groupCategories, selectedCategory, selectedGroup],
  );
  const showSupplierName = shouldShowSupplierName(selectedCategory);
  const showReferenceNumber = shouldShowReferenceNumber();

  useEffect(() => {
    reset(defaultValues);
    previousGroup.current = defaultValues.group;
    previousCategoryId.current = defaultValues.category || null;
    setSubmitError("");
  }, [defaultValues, reset]);

  useEffect(() => {
    if (!selectedGroup && selectedCategory?.form_group) {
      setValue("group", selectedCategory.form_group, { shouldDirty: false });
      previousGroup.current = selectedCategory.form_group;
    }
  }, [selectedCategory, selectedGroup, setValue]);

  useEffect(() => {
    if (previousGroup.current === selectedGroup) {
      return;
    }

    previousGroup.current = selectedGroup;
    const currentValues = getValues();

    if (!selectedGroup) {
      setValue("category", 0, { shouldDirty: true });
      setValue("supplier_name", "", { shouldDirty: true });
      setValue("reference_number", "", { shouldDirty: true });
      setValue("details", createEmptyExpenseDetails(), { shouldDirty: true });
      return;
    }

    if (selectedCategory && selectedCategory.form_group === selectedGroup) {
      return;
    }

    setValue("category", 0, { shouldDirty: true });
    setValue("supplier_name", "", { shouldDirty: true });
    setValue("reference_number", "", { shouldDirty: true });

    const nextDetails = createEmptyExpenseDetails();
    if (selectedGroup === "VIAJES") {
      nextDetails.destination = currentValues.details.destination;
    }
    if (selectedGroup === "PERSONAL") {
      nextDetails.employee_name = currentValues.details.employee_name;
      nextDetails.payment_concept = currentValues.details.payment_concept;
    }
    if (selectedGroup === "SERVICIOS") {
      nextDetails.service_provider_name = currentValues.details.service_provider_name;
    }
    setValue("details", nextDetails, { shouldDirty: true });
  }, [getValues, selectedCategory, selectedGroup, setValue]);

  useEffect(() => {
    if (!selectedCategoryId || selectedCategoryId <= 0) {
      previousCategoryId.current = null;
      return;
    }

    if (previousCategoryId.current === null) {
      previousCategoryId.current = selectedCategoryId;
      return;
    }

    if (previousCategoryId.current === selectedCategoryId) {
      return;
    }

    previousCategoryId.current = selectedCategoryId;
    const currentValues = getValues();

    setValue("supplier_name", showSupplierName ? currentValues.supplier_name : "", {
      shouldDirty: true,
    });
    setValue("reference_number", showReferenceNumber ? currentValues.reference_number : "", {
      shouldDirty: true,
    });

    const nextDetails = createEmptyExpenseDetails();
    if (selectedCategory?.form_group === "VIAJES") {
      nextDetails.destination = currentValues.details.destination;
    }
    if (selectedCategory?.form_group === "PERSONAL") {
      nextDetails.employee_name = currentValues.details.employee_name;
      nextDetails.payment_concept = currentValues.details.payment_concept;
    }
    if (selectedCategory?.form_group === "SERVICIOS") {
      nextDetails.service_provider_name = currentValues.details.service_provider_name;
    }

    setValue("details", nextDetails, { shouldDirty: true });
  }, [
    getValues,
    selectedCategory,
    selectedCategoryId,
    setValue,
    showReferenceNumber,
    showSupplierName,
  ]);

  const submit = handleSubmit(async (values) => {
    clearErrors();
    setSubmitError("");

    const parsed = expenseSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const fieldName = issue.path.join(".") as Path<ExpenseFormValues>;
        setError(fieldName, { message: issue.message });
      }
      return;
    }

    if (!selectedCategory) {
      setError("category", { message: "La categoria es obligatoria." });
      return;
    }

    const dynamicIssues = getDynamicIssues(parsed.data, selectedCategory);
    if (dynamicIssues.length > 0) {
      for (const issue of dynamicIssues) {
        setError(issue.path, { message: issue.message });
      }
      return;
    }

    const payload: ExpenseCreateInput | ExpenseUpdateInput = {
      category: parsed.data.category,
      amount: Number(parsed.data.amount).toFixed(2),
      description: parsed.data.description,
      expense_date: parsed.data.expense_date,
      supplier_name: showSupplierName ? parsed.data.supplier_name.trim() : "",
      reference_number: showReferenceNumber ? parsed.data.reference_number.trim() : "",
      notes: parsed.data.notes,
      details: buildExpenseDetails(parsed.data, selectedCategory),
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      if (isExpenseFormSubmissionError(error)) {
        if (error.fieldErrors) {
          for (const [fieldName, message] of Object.entries(error.fieldErrors)) {
            if (message) {
              setError(fieldName as Path<ExpenseFormValues>, { message });
            }
          }
        }
        if (error.detail) {
          setSubmitError(error.detail);
          return;
        }
      }

      const { detail, fieldErrors } = extractApiValidation(error, EXPENSE_FIELDS);
      if (Object.keys(fieldErrors).length > 0) {
        for (const [fieldName, message] of Object.entries(fieldErrors)) {
          if (message) {
            setError(fieldName as Path<ExpenseFormValues>, { message });
          }
        }
      }
      setSubmitError(detail ?? toApiError(error).detail);
    }
  });

  return (
    <form onSubmit={submit} className={formStyles.form}>
      <div className={formStyles.intro}>
        <p className={formStyles.introTitle}>
          {mode === "create" ? "Registrar gasto" : "Actualizar gasto"}
        </p>
        <p className={formStyles.introText}>
          Registra el gasto seleccionando primero el grupo y luego la subcategoria correspondiente.
        </p>
      </div>

      <div className={formStyles.formGrid}>
        <div className={formStyles.field}>
          <label htmlFor="group">Grupo</label>
          <select id="group" {...register("group")}>
            <option value="">Seleccione un grupo</option>
            {GROUP_OPTIONS.map((group) => (
              <option key={group.value} value={group.value}>
                {group.label}
              </option>
            ))}
          </select>
          {errors.group && <p className={formStyles.errorText}>{errors.group.message}</p>}
        </div>

        <div className={`${formStyles.field} ${formStyles.fieldFull}`}>
          <label htmlFor="category">Subcategoria</label>
          <select id="category" {...register("category", { valueAsNumber: true })}>
            <option value={0}>{selectedGroup ? "Seleccione una subcategoria" : "Seleccione primero un grupo"}</option>
            {visibleCategories.map((category) => (
              <option
                key={category.id}
                value={category.id}
                disabled={!category.is_active && category.id !== selectedCategoryId}
              >
                {category.name}
                {!category.is_active ? " (inactiva)" : ""}
              </option>
            ))}
          </select>
          {errors.category && <p className={formStyles.errorText}>{errors.category.message}</p>}
        </div>

        <div className={formStyles.field}>
          <label htmlFor="amount">Monto</label>
          <input id="amount" type="number" step="0.01" min="0.01" placeholder="0.00" {...register("amount")} />
          {errors.amount && <p className={formStyles.errorText}>{errors.amount.message}</p>}
        </div>

        <div className={formStyles.field}>
          <label htmlFor="expense_date">Fecha del gasto</label>
          <input id="expense_date" type="date" {...register("expense_date")} />
          {errors.expense_date && <p className={formStyles.errorText}>{errors.expense_date.message}</p>}
        </div>

        <div className={`${formStyles.field} ${formStyles.fieldFull}`}>
          <label htmlFor="description">Descripcion</label>
          <input
            id="description"
            type="text"
            placeholder="Describe el concepto del gasto"
            {...register("description")}
          />
          {errors.description && <p className={formStyles.errorText}>{errors.description.message}</p>}
        </div>

        {selectedCategory?.form_group === "VIAJES" && (
          <div className={formStyles.field}>
            <label htmlFor="travel_destination">Destino</label>
            <input
              id="travel_destination"
              type="text"
              placeholder="Ciudad o destino del viaje"
              {...register("details.destination")}
            />
            {errors.details?.destination && (
              <p className={formStyles.errorText}>{errors.details.destination.message}</p>
            )}
          </div>
        )}

        {selectedCategory?.form_group === "PERSONAL" && (
          <>
            <div className={formStyles.field}>
              <label htmlFor="employee_name">Nombre del empleado</label>
              <input
                id="employee_name"
                type="text"
                placeholder="Empleado relacionado al pago"
                {...register("details.employee_name")}
              />
              {errors.details?.employee_name && (
                <p className={formStyles.errorText}>{errors.details.employee_name.message}</p>
              )}
            </div>
            <div className={formStyles.field}>
              <label htmlFor="payment_concept">Concepto del pago</label>
              <input
                id="payment_concept"
                type="text"
                placeholder="Motivo o concepto del pago"
                {...register("details.payment_concept")}
              />
              {errors.details?.payment_concept && (
                <p className={formStyles.errorText}>{errors.details.payment_concept.message}</p>
              )}
            </div>
          </>
        )}

        {selectedCategory?.form_group === "SERVICIOS" && (
          <div className={formStyles.field}>
            <label htmlFor="service_provider_name">Nombre del prestador del servicio</label>
            <input
              id="service_provider_name"
              type="text"
              placeholder="Nombre de quien presta el servicio"
              {...register("details.service_provider_name")}
            />
            {errors.details?.service_provider_name && (
              <p className={formStyles.errorText}>{errors.details.service_provider_name.message}</p>
            )}
          </div>
        )}

        {showSupplierName && (
          <div className={formStyles.field}>
            <label htmlFor="supplier_name">Proveedor</label>
            <input
              id="supplier_name"
              type="text"
              placeholder="Mensajero, proveedor o tercero"
              {...register("supplier_name")}
            />
            {errors.supplier_name && <p className={formStyles.errorText}>{errors.supplier_name.message}</p>}
          </div>
        )}

        {showReferenceNumber && (
          <div className={formStyles.field}>
            <label htmlFor="reference_number">Referencia</label>
            <input
              id="reference_number"
              type="text"
              placeholder="Factura, recibo u otra referencia"
              {...register("reference_number")}
            />
            {errors.reference_number && <p className={formStyles.errorText}>{errors.reference_number.message}</p>}
          </div>
        )}

        <div className={`${formStyles.field} ${formStyles.fieldFull}`}>
          <label htmlFor="notes">Observaciones</label>
          <textarea
            id="notes"
            rows={4}
            placeholder="Observaciones internas opcionales"
            {...register("notes")}
          />
          {errors.notes && <p className={formStyles.errorText}>{errors.notes.message}</p>}
        </div>
      </div>

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
