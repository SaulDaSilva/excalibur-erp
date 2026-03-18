import type { PaginatedResponse } from "../clientes/types";

export type ExpenseCategory = {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ExpenseCreatedBy = {
  id: number;
  username: string;
};

export type Expense = {
  id: number;
  category: number;
  category_name: string;
  amount: string;
  description: string;
  expense_date: string;
  supplier_name: string;
  reference_number: string;
  notes: string;
  created_by: ExpenseCreatedBy | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ExpenseCategoryListParams = {
  q?: string;
  includeInactive?: boolean;
};

export type ExpenseListParams = {
  page: number;
  pageSize: number;
  q: string;
  categoryId: number | null;
  from: string;
  to: string;
  includeInactive: boolean;
};

export type ExpenseCategoryCreateInput = {
  name: string;
  description: string;
};

export type ExpenseCreateInput = {
  category: number;
  amount: string;
  description: string;
  expense_date: string;
  supplier_name: string;
  reference_number: string;
  notes: string;
};

export type ExpenseUpdateInput = ExpenseCreateInput;

export type ExpenseFormSubmitPayload = ExpenseCreateInput | ExpenseUpdateInput;

export type ExpenseFieldName =
  | "category"
  | "amount"
  | "description"
  | "expense_date"
  | "supplier_name"
  | "reference_number"
  | "notes";

export type ExpenseCategoryFieldName = "name" | "description";

export type ExpenseFormSubmissionError = {
  detail?: string;
  fieldErrors?: Partial<Record<ExpenseFieldName, string>>;
};

export type ExpenseListResponse = PaginatedResponse<Expense>;
