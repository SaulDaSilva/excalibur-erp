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
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
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

export type ClienteUpdateInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: number;
};
