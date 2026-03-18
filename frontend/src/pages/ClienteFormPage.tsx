import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Notice } from "../components/ui/Notice";
import { PageHeader } from "../components/ui/PageHeader";
import { ClienteForm } from "../features/clientes/ClienteForm";
import {
  useCliente,
  useCreateCliente,
  useCreatePais,
  useCreateDireccion,
  useDeleteDireccion,
  useDirecciones,
  usePaises,
  useUpdateCliente,
  useUpdateDireccion,
} from "../features/clientes/hooks";
import type {
  ClienteCreateInput,
  ClienteFormSubmitPayload,
  ClienteUpdateInput,
  DireccionDraft,
  Pais,
} from "../features/clientes/types";
import {
  CUSTOMER_FIELDS,
  extractApiValidation,
  syncDirecciones,
} from "../features/clientes/utils";
import { toApiError } from "../lib/api";

type ClienteFormPageProps = {
  mode: "create" | "edit";
};

type LocationState = {
  pageError?: string;
};

function mapDireccionesToDrafts(addresses: DireccionDraft[] | undefined): DireccionDraft[] {
  return (addresses ?? []).map((address) => ({
    id: address.id,
    province: address.province,
    city: address.city,
    address_line: address.address_line,
    is_primary: address.is_primary,
  }));
}

export function ClienteFormPage({ mode }: ClienteFormPageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const params = useParams();

  const clienteId = mode === "edit" ? Number(params.clienteId) : null;
  const hasValidClienteId = mode === "create" || (clienteId !== null && Number.isInteger(clienteId) && clienteId > 0);
  const locationState = (location.state ?? null) as LocationState | null;

  const paisesQuery = usePaises();
  const clienteQuery = useCliente(mode === "edit" && hasValidClienteId ? clienteId : null);
  const direccionesQuery = useDirecciones(mode === "edit" && hasValidClienteId ? clienteId : null);

  const createCliente = useCreateCliente();
  const createPais = useCreatePais();
  const updateCliente = useUpdateCliente();
  const createDireccion = useCreateDireccion();
  const updateDireccion = useUpdateDireccion();
  const deleteDireccion = useDeleteDireccion();

  const initialAddresses = useMemo(
    () => mapDireccionesToDrafts(direccionesQuery.data),
    [direccionesQuery.data],
  );

  const isLoading =
    paisesQuery.isLoading ||
    (mode === "edit" && (clienteQuery.isLoading || direccionesQuery.isLoading));

  const blockingErrorMessage =
    (!hasValidClienteId && "El cliente solicitado no es valido.") ||
    (paisesQuery.isError && toApiError(paisesQuery.error).detail) ||
    (clienteQuery.isError && toApiError(clienteQuery.error).detail) ||
    (direccionesQuery.isError && toApiError(direccionesQuery.error).detail) ||
    "";

  const invalidateClienteQueries = async (id?: number) => {
    await queryClient.invalidateQueries({ queryKey: ["clientes"] });
    if (typeof id === "number") {
      await queryClient.invalidateQueries({ queryKey: ["cliente", id] });
      await queryClient.invalidateQueries({ queryKey: ["direcciones", id] });
    }
  };

  const handleCreatePais = async (payload: { name: string; iso_code: string }): Promise<Pais> => {
    const created = await createPais.mutateAsync(payload);
    queryClient.setQueryData<Pais[]>(["paises"], (previous) => {
      const next = [...(previous ?? []), created];
      return next.sort((left, right) => left.name.localeCompare(right.name, "es"));
    });
    await queryClient.invalidateQueries({ queryKey: ["paises"] });
    return created;
  };

  const handleSubmit = async ({ customer, addresses }: ClienteFormSubmitPayload) => {
    if (mode === "create") {
      let createdCustomer;

      try {
        createdCustomer = await createCliente.mutateAsync(customer as ClienteCreateInput);
      } catch (error) {
        const { detail, fieldErrors } = extractApiValidation(error, CUSTOMER_FIELDS);
        throw {
          detail,
          customerFieldErrors: fieldErrors,
        };
      }

      try {
        await syncDirecciones({
          customerId: createdCustomer.id,
          existingAddresses: [],
          nextAddresses: addresses,
          createAddress: (payload) => createDireccion.mutateAsync(payload),
          updateAddress: (id, payload) => updateDireccion.mutateAsync({ id, data: payload }),
          deleteAddress: (id) => deleteDireccion.mutateAsync(id),
        });
      } catch (error) {
        await invalidateClienteQueries(createdCustomer.id);
        navigate(`/clientes/${createdCustomer.id}/editar`, {
          replace: true,
          state: {
            pageError:
              (typeof error === "object" && error !== null && "detail" in error && typeof error.detail === "string"
                ? error.detail
                : "Cliente creado, pero hubo un problema al guardar las direcciones.") as string,
          } satisfies LocationState,
        });
        return;
      }

      await invalidateClienteQueries(createdCustomer.id);
      navigate("/clientes", { replace: true });
      return;
    }

    if (!hasValidClienteId || clienteId === null) {
      throw { detail: "El cliente solicitado no es valido." };
    }

    try {
      await updateCliente.mutateAsync({
        id: clienteId,
        data: customer as ClienteUpdateInput,
      });
    } catch (error) {
      const { detail, fieldErrors } = extractApiValidation(error, CUSTOMER_FIELDS);
      throw {
        detail,
        customerFieldErrors: fieldErrors,
      };
    }

    await syncDirecciones({
      customerId: clienteId,
      existingAddresses: direccionesQuery.data ?? [],
      nextAddresses: addresses,
      createAddress: (payload) => createDireccion.mutateAsync(payload),
      updateAddress: (id, payload) => updateDireccion.mutateAsync({ id, data: payload }),
      deleteAddress: (id) => deleteDireccion.mutateAsync(id),
    });

    await invalidateClienteQueries(clienteId);
    navigate("/clientes", { replace: true });
  };

  return (
    <section className="space-y-4">
      <PageHeader
        actions={
          <Button type="button" onClick={() => navigate("/clientes")}>
            Volver a clientes
          </Button>
        }
      />

      {isLoading && <Notice variant="info" message="Cargando..." />}
      {blockingErrorMessage && <Notice variant="error" message={blockingErrorMessage} />}
      {!blockingErrorMessage && locationState?.pageError && (
        <Notice variant="error" message={locationState.pageError} />
      )}

      {!isLoading && !blockingErrorMessage && (
        <Card className="mx-auto w-full max-w-5xl">
          <ClienteForm
            mode={mode}
            initialData={clienteQuery.data ?? null}
            initialAddresses={initialAddresses}
            paises={paisesQuery.data ?? []}
            onCreatePais={handleCreatePais}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/clientes")}
          />
        </Card>
      )}
    </section>
  );
}
