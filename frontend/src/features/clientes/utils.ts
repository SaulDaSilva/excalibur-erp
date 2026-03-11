import { toApiError } from "../../lib/api";
import type {
  ClienteFormSubmissionError,
  ClienteFieldName,
  Direccion,
  DireccionDraft,
  DireccionFieldName,
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

export function isClienteFormSubmissionError(
  value: unknown,
): value is ClienteFormSubmissionError {
  return isRecord(value) && (
    "detail" in value ||
    "customerFieldErrors" in value ||
    "addressFieldErrors" in value
  );
}

export function ensurePrimaryAddress(addresses: DireccionDraft[]): DireccionDraft[] {
  if (addresses.length === 0) {
    return [];
  }

  let primaryAssigned = false;

  return addresses.map((address, index) => {
    const shouldBePrimary = address.is_primary && !primaryAssigned;
    if (shouldBePrimary) {
      primaryAssigned = true;
      return { ...address, is_primary: true };
    }

    if (!primaryAssigned && index === 0) {
      primaryAssigned = true;
      return { ...address, is_primary: true };
    }

    return { ...address, is_primary: false };
  });
}

type SyncDireccionesArgs = {
  customerId: number;
  existingAddresses: Direccion[];
  nextAddresses: DireccionDraft[];
  createAddress: (address: {
    customer: number;
    province: string;
    city: string;
    address_line: string;
    is_primary: boolean;
  }) => Promise<unknown>;
  updateAddress: (
    id: number,
    address: {
      province: string;
      city: string;
      address_line: string;
      is_primary: boolean;
    },
  ) => Promise<unknown>;
  deleteAddress: (id: number) => Promise<unknown>;
};

const ADDRESS_FIELDS = ["province", "city", "address_line", "is_primary"] as const satisfies readonly DireccionFieldName[];

export async function syncDirecciones({
  customerId,
  existingAddresses,
  nextAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
}: SyncDireccionesArgs): Promise<void> {
  const normalizedAddresses = ensurePrimaryAddress(nextAddresses);
  const nextIds = new Set(
    normalizedAddresses
      .map((address) => address.id)
      .filter((addressId): addressId is number => typeof addressId === "number"),
  );

  const addressesToDelete = existingAddresses.filter((address) => !nextIds.has(address.id));

  for (const [index, address] of normalizedAddresses.entries()) {
    const payload = {
      province: address.province,
      city: address.city,
      address_line: address.address_line,
      is_primary: address.is_primary,
    };

    try {
      if (typeof address.id === "number") {
        await updateAddress(address.id, payload);
      } else {
        await createAddress({
          customer: customerId,
          ...payload,
        });
      }
    } catch (error) {
      const { detail, fieldErrors } = extractApiValidation(error, ADDRESS_FIELDS);
      throw {
        detail: detail ?? "No se pudo guardar una de las direcciones.",
        addressFieldErrors: {
          [index]: fieldErrors,
        },
      } satisfies ClienteFormSubmissionError;
    }
  }

  for (const address of addressesToDelete) {
    try {
      await deleteAddress(address.id);
    } catch (error) {
      const apiError = toApiError(error);
      throw {
        detail: apiError.detail || "No se pudo eliminar una direccion removida.",
      } satisfies ClienteFormSubmissionError;
    }
  }
}

export const CUSTOMER_FIELDS = [
  "first_name",
  "last_name",
  "id_number",
  "email",
  "phone",
  "country",
] as const satisfies readonly ClienteFieldName[];
