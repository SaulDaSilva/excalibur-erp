export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type Pais = {
  id: number;
  name: string;
  iso_code: string;
};

export type Cliente = {
  id: number;
  first_name: string;
  last_name: string;
  id_number: string;
  email: string;
  phone: string;
  country: number;
  country_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  notes?: string;
};

export type Direccion = {
  id: number;
  customer: number;
  province: string;
  city: string;
  address_line: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export type ClientesListParams = {
  page: number;
  pageSize: number;
  q: string;
  includeInactive: boolean;
};

export type ClienteCreateInput = {
  first_name: string;
  last_name: string;
  id_number: string;
  email: string;
  phone: string;
  country: number;
};

export type PaisCreateInput = {
  name: string;
  iso_code: string;
};

export type ClienteUpdateInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: number;
};

export type DireccionDraft = {
  id?: number;
  province: string;
  city: string;
  address_line: string;
  is_primary: boolean;
};

export type DireccionCreateInput = {
  customer: number;
  province: string;
  city: string;
  address_line: string;
  is_primary: boolean;
};

export type DireccionUpdateInput = {
  province: string;
  city: string;
  address_line: string;
  is_primary: boolean;
};

export type ClienteFormSubmitPayload = {
  customer: ClienteCreateInput | ClienteUpdateInput;
  addresses: DireccionDraft[];
};

export type ClienteFieldName =
  | "first_name"
  | "last_name"
  | "id_number"
  | "email"
  | "phone"
  | "country";

export type DireccionFieldName = "province" | "city" | "address_line" | "is_primary";

export type ClienteFormSubmissionError = {
  detail?: string;
  customerFieldErrors?: Partial<Record<ClienteFieldName, string>>;
  addressFieldErrors?: Record<number, Partial<Record<DireccionFieldName, string>>>;
};
