import { toApiError } from "../../lib/api";
import type {
  ExpenseCategoryFieldName,
  ExpenseFieldName,
  ExpenseFormSubmissionError,
} from "./types";

function parseBackendMessage(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function extractApiValidation<T extends string>(
  error: unknown,
  allowedFields: readonly T[],
): { detail?: string; fieldErrors: Partial<Record<T, string>> } {
  const apiError = toApiError(error);
  const fieldErrors: Partial<Record<T, string>> = {};
  let detail = apiError.detail;

  if (isRecord(apiError.data)) {
    for (const fieldName of allowedFields) {
      const message = parseBackendMessage(apiError.data[fieldName]);
      if (message) {
        fieldErrors[fieldName] = message;
      }
    }

    const explicitDetail =
      parseBackendMessage(apiError.data.detail) ?? parseBackendMessage(apiError.data.non_field_errors);
    if (explicitDetail) {
      detail = explicitDetail;
    }
  }

  return { detail, fieldErrors };
}

export function isExpenseFormSubmissionError(
  value: unknown,
): value is ExpenseFormSubmissionError {
  return isRecord(value) && ("detail" in value || "fieldErrors" in value);
}

export const EXPENSE_FIELDS = [
  "category",
  "amount",
  "description",
  "expense_date",
  "supplier_name",
  "reference_number",
  "notes",
] as const satisfies readonly ExpenseFieldName[];

export const EXPENSE_CATEGORY_FIELDS = [
  "name",
  "description",
] as const satisfies readonly ExpenseCategoryFieldName[];
