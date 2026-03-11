import { useEffect, useState } from "react";

import { Button } from "../../components/ui/Button";
import type { Cliente } from "../clientes/types";
import { usePedidoCustomerSearch } from "./hooks";
import styles from "./PedidoCustomerSearch.module.css";

type PedidoCustomerSearchProps = {
  selectedCustomer: Cliente | null;
  onSelect: (customer: Cliente) => void;
  onClear: () => void;
};

export function PedidoCustomerSearch({
  selectedCustomer,
  onSelect,
  onClear,
}: PedidoCustomerSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  const searchQuery = usePedidoCustomerSearch(
    debouncedSearchTerm,
    !selectedCustomer && debouncedSearchTerm.length >= 2,
  );

  if (selectedCustomer) {
    return (
      <div className={styles.field}>
        <label>Cliente</label>
        <div className={styles.selectedCard}>
          <p className={styles.selectedTitle}>Cliente seleccionado</p>
          <p className={styles.selectedName}>
            {selectedCustomer.first_name} {selectedCustomer.last_name}
          </p>
          <p className={styles.selectedMeta}>{selectedCustomer.id_number}</p>
          <div className="mt-3">
            <Button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setDebouncedSearchTerm("");
                onClear();
              }}
            >
              Cambiar cliente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const results = searchQuery.data?.results ?? [];

  return (
    <div className={styles.field}>
      <label htmlFor="pedido-customer-search">Cliente</label>
      <input
        id="pedido-customer-search"
        type="text"
        placeholder="Buscar por nombre o cedula..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />

      {searchTerm.trim().length < 2 && (
        <p className={styles.hint}>Escribe al menos 2 caracteres para buscar.</p>
      )}
      {searchQuery.isLoading && <p className={styles.hint}>Buscando clientes...</p>}
      {searchQuery.isError && (
        <p className={styles.error}>No se pudieron cargar los clientes.</p>
      )}

      {searchTerm.trim().length >= 2 && !searchQuery.isLoading && results.length === 0 && (
        <p className={styles.hint}>No se encontraron clientes.</p>
      )}

      {results.length > 0 && (
        <div className={styles.results}>
          {results.map((customer) => (
            <button
              key={customer.id}
              type="button"
              className={styles.resultButton}
              onClick={() => {
                setSearchTerm("");
                setDebouncedSearchTerm("");
                onSelect(customer);
              }}
            >
              <p className={styles.resultName}>
                {customer.first_name} {customer.last_name}
              </p>
              <p className={styles.resultMeta}>{customer.id_number}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
