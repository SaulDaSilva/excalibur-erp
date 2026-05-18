import type { PaginatedResponse } from "../clientes/types";

export type ExpenseCategory = {
  id: number;
  name: string;
  description: string;
  code: ExpenseCategoryCode | null;
  form_group: ExpenseFormGroup | null;
  sort_order: number;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ExpenseFormGroup =
  | "VIAJES"
  | "LOGISTICA"
  | "PERSONAL"
  | "PRODUCCION"
  | "FISCAL"
  | "SERVICIOS"
  | "MISCELANEO";

export const EXPENSE_FORM_GROUP_LABELS: Record<ExpenseFormGroup, string> = {
  VIAJES: "Viajes",
  LOGISTICA: "Logistica",
  PERSONAL: "Personal",
  PRODUCCION: "Produccion",
  FISCAL: "Fiscal",
  SERVICIOS: "Servicios",
  MISCELANEO: "Miscelaneo",
};

export type ExpenseCategoryCode =
  | "GALLERY"
  | "TRAVEL_EXPENSES"
  | "CUBOX_STORAGE"
  | "DHL"
  | "EMPLOYEE_PAYMENTS"
  | "SPUR_PAINTING"
  | "DELIVERY_RUNS"
  | "MISCELLANEOUS"
  | "VAT_DECLARATIONS"
  | "PROVIDED_SERVICES"
  | "SUPPLIES"
  | "PRODUCTION_MOLDS";

export type ExpenseDetails = {
  destination?: string;
  employee_name?: string;
  payment_concept?: string;
  service_provider_name?: string;
};

export type ExpenseCreatedBy = {
  id: number;
  username: string;
};

export type Expense = {
  id: number;
  category: number;
  category_group: ExpenseFormGroup | null;
  category_name: string;
  amount: string;
  description: string;
  expense_date: string;
  supplier_name: string;
  reference_number: string;
  notes: string;
  details: ExpenseDetails;
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
  group: ExpenseFormGroup | null;
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
  details: ExpenseDetails;
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
  | "notes"
  | "details.destination"
  | "details.employee_name"
  | "details.payment_concept"
  | "details.service_provider_name";

export type ExpenseCategoryFieldName = "name" | "description";

export type ExpenseFormSubmissionError = {
  detail?: string;
  fieldErrors?: Partial<Record<ExpenseFieldName, string>>;
};

export type ExpenseListResponse = PaginatedResponse<Expense>;
