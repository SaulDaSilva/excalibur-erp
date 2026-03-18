import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../../components/ui/Button";
import formStyles from "../../components/ui/FormLayout.module.css";
import { toApiError } from "../../lib/api";
import type {
  Expense,
  ExpenseCategory,
  ExpenseCategoryCreateInput,
  ExpenseCreateInput,
  ExpenseFormSubmitPayload,
  ExpenseUpdateInput,
} from "./types";
import {
  EXPENSE_CATEGORY_FIELDS,
  EXPENSE_FIELDS,
  extractApiValidation,
  isExpenseFormSubmissionError,
} from "./utils";

type ExpenseFormValues = {
  category: number;
  amount: string;
  description: string;
  expense_date: string;
  supplier_name: string;
  reference_number: string;
  notes: string;
};

type GastoFormProps = {
  mode: "create" | "edit";
  initialData: Expense | null;
  categories: ExpenseCategory[];
  onCreateCategory: (data: ExpenseCategoryCreateInput) => Promise<ExpenseCategory>;
  onSubmit: (data: ExpenseFormSubmitPayload) => Promise<void>;
  onCancel: () => void;
};

const expenseSchema = z.object({
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
});

const categorySchema = z.object({
  name: z.string().trim().min(1, "El nombre de la categoria es obligatorio."),
  description: z.string().trim(),
});

export function GastoForm({
  mode,
  initialData,
  categories,
  onCreateCategory,
  onSubmit,
  onCancel,
}: GastoFormProps) {
  const [submitError, setSubmitError] = useState("");
  const [isCategoryEditorOpen, setIsCategoryEditorOpen] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState<ExpenseCategoryCreateInput>({
    name: "",
    description: "",
  });
  const [categoryFieldErrors, setCategoryFieldErrors] = useState<
    Partial<Record<keyof ExpenseCategoryCreateInput, string>>
  >({});
  const [categorySubmitError, setCategorySubmitError] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const defaultValues = useMemo<ExpenseFormValues>(
    () => ({
      category: initialData?.category ?? 0,
      amount: initialData?.amount ?? "",
      description: initialData?.description ?? "",
      expense_date: initialData?.expense_date ?? "",
      supplier_name: initialData?.supplier_name ?? "",
      reference_number: initialData?.reference_number ?? "",
      notes: initialData?.notes ?? "",
    }),
    [initialData],
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({ defaultValues });

  const selectedCategoryId = watch("category");

  useEffect(() => {
    reset(defaultValues);
    setSubmitError("");
  }, [defaultValues, reset]);

  const resetCategoryEditor = () => {
    setCategoryDraft({ name: "", description: "" });
    setCategoryFieldErrors({});
    setCategorySubmitError("");
    setIsCategoryEditorOpen(false);
  };

  const handleCreateCategory = async () => {
    setCategoryFieldErrors({});
    setCategorySubmitError("");

    const parsed = categorySchema.safeParse(categoryDraft);
    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof ExpenseCategoryCreateInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const fieldName = issue.path[0];
        if (fieldName === "name" || fieldName === "description") {
          nextErrors[fieldName] = issue.message;
        }
      }
      setCategoryFieldErrors(nextErrors);
      return;
    }

    setIsCreatingCategory(true);
    try {
      const created = await onCreateCategory(parsed.data);
      setValue("category", created.id, { shouldDirty: true, shouldValidate: true });
      resetCategoryEditor();
    } catch (error) {
      const { detail, fieldErrors } = extractApiValidation(error, EXPENSE_CATEGORY_FIELDS);
      setCategoryFieldErrors(fieldErrors);
      setCategorySubmitError(detail ?? "No se pudo crear la categoria.");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const submit = handleSubmit(async (values) => {
    setSubmitError("");

    const parsed = expenseSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const fieldName = issue.path[0];
        if (typeof fieldName === "string") {
          setError(fieldName as keyof ExpenseFormValues, { message: issue.message });
        }
      }
      return;
    }

    const payload: ExpenseCreateInput | ExpenseUpdateInput = {
      category: parsed.data.category,
      amount: Number(parsed.data.amount).toFixed(2),
      description: parsed.data.description,
      expense_date: parsed.data.expense_date,
      supplier_name: parsed.data.supplier_name,
      reference_number: parsed.data.reference_number,
      notes: parsed.data.notes,
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      if (isExpenseFormSubmissionError(error)) {
        if (error.fieldErrors) {
          for (const [fieldName, message] of Object.entries(error.fieldErrors)) {
            if (message) {
              setError(fieldName as keyof ExpenseFormValues, { message });
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
            setError(fieldName as keyof ExpenseFormValues, { message });
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
          Registra gastos realizados para mantener control operativo y facilitar reportes posteriores.
        </p>
      </div>

      <div className={formStyles.formGrid}>
        <div className={`${formStyles.field} ${formStyles.fieldFull}`}>
          <label htmlFor="category">Categoria</label>
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <select id="category" {...register("category", { valueAsNumber: true })}>
                <option value={0}>Seleccione una categoria</option>
                {categories.map((category) => (
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
            </div>
            <Button
              type="button"
              variant="secondary"
              className="md:self-end"
              onClick={() => {
                setCategorySubmitError("");
                setCategoryFieldErrors({});
                setIsCategoryEditorOpen((current) => !current);
              }}
            >
              {isCategoryEditorOpen ? "Ocultar nueva categoria" : "Nueva categoria"}
            </Button>
          </div>
          {errors.category && <p className={formStyles.errorText}>{errors.category.message}</p>}

          {isCategoryEditorOpen && (
            <div className={formStyles.section}>
              <div>
                <p className={formStyles.sectionTitle}>Crear categoria</p>
                <p className={formStyles.sectionText}>
                  Agrega una categoria al catalogo y quedara seleccionada automaticamente.
                </p>
              </div>

              <div className={formStyles.formGrid}>
                <div className={formStyles.field}>
                  <label htmlFor="category_name_create">Nombre</label>
                  <input
                    id="category_name_create"
                    type="text"
                    value={categoryDraft.name}
                    onChange={(event) =>
                      setCategoryDraft((previous) => ({ ...previous, name: event.target.value }))
                    }
                  />
                  {categoryFieldErrors.name && (
                    <p className={formStyles.errorText}>{categoryFieldErrors.name}</p>
                  )}
                </div>

                <div className={formStyles.field}>
                  <label htmlFor="category_description_create">Descripcion</label>
                  <input
                    id="category_description_create"
                    type="text"
                    value={categoryDraft.description}
                    onChange={(event) =>
                      setCategoryDraft((previous) => ({ ...previous, description: event.target.value }))
                    }
                  />
                  {categoryFieldErrors.description && (
                    <p className={formStyles.errorText}>{categoryFieldErrors.description}</p>
                  )}
                </div>
              </div>

              {categorySubmitError && <p className={formStyles.errorBox}>{categorySubmitError}</p>}

              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetCategoryEditor}
                  disabled={isCreatingCategory}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleCreateCategory}
                  disabled={isCreatingCategory}
                >
                  {isCreatingCategory ? "Guardando categoria..." : "Guardar categoria"}
                </Button>
              </div>
            </div>
          )}
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
            placeholder="Describe el gasto realizado"
            {...register("description")}
          />
          {errors.description && <p className={formStyles.errorText}>{errors.description.message}</p>}
        </div>

        <div className={formStyles.field}>
          <label htmlFor="supplier_name">Proveedor</label>
          <input id="supplier_name" type="text" placeholder="DHL, proveedor local, etc." {...register("supplier_name")} />
          {errors.supplier_name && <p className={formStyles.errorText}>{errors.supplier_name.message}</p>}
        </div>

        <div className={formStyles.field}>
          <label htmlFor="reference_number">Referencia</label>
          <input id="reference_number" type="text" placeholder="Factura, guia, recibo..." {...register("reference_number")} />
          {errors.reference_number && <p className={formStyles.errorText}>{errors.reference_number.message}</p>}
        </div>

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
