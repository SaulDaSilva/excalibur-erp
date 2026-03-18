import { Button } from "../../components/ui/Button";
import styles from "../../components/ui/DataTable.module.css";
import { Notice } from "../../components/ui/Notice";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableCard } from "../../components/ui/TableCard";
import type { Cliente } from "./types";

type ClientesTableProps = {
  data: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (cliente: Cliente) => void;
};

function getInitials(cliente: Cliente): string {
  const fullName = `${cliente.first_name} ${cliente.last_name}`.trim();
  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "CL";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function ClientesTable({ data, onEdit, onDelete }: ClientesTableProps) {
  if (data.length === 0) {
    return (
      <Notice variant="empty" message="No se encontraron clientes." />
    );
  }

  return (
    <TableCard>
      <table className={styles.table}>
        <thead className={styles.head}>
          <tr>
            <th className={styles.th}>Nombre</th>
            <th className={styles.th}>ID</th>
            <th className={styles.th}>Correo</th>
            <th className={styles.th}>Telefono</th>
            <th className={styles.th}>Pais</th>
            <th className={styles.th}>Activo</th>
            <th className={styles.thRight}>Acciones</th>
          </tr>
        </thead>
        <tbody className={styles.body}>
          {data.map((cliente) => (
            <tr key={cliente.id} className={styles.row}>
              <td className={styles.td}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">
                    {getInitials(cliente)}
                  </div>
                  <div className={styles.cellStack}>
                    <p className={styles.primaryText}>{`${cliente.first_name} ${cliente.last_name}`.trim()}</p>
                    <p className={styles.secondaryText}>{cliente.id_number}</p>
                  </div>
                </div>
              </td>
              <td className={styles.td}>{cliente.id_number}</td>
              <td className={styles.td}>{cliente.email || "-"}</td>
              <td className={styles.td}>{cliente.phone || "-"}</td>
              <td className={styles.td}>{cliente.country_name || `#${cliente.country}`}</td>
              <td className={styles.td}>
                <StatusBadge label={cliente.is_active ? "Activo" : "Inactivo"} variant={cliente.is_active ? "success" : "neutral"} />
              </td>
              <td className={styles.tdRight}>
                <div className={styles.actions}>
                  <Button type="button" size="sm" onClick={() => onEdit(cliente)}>
                    Editar
                  </Button>
                  <Button type="button" size="sm" variant="danger" onClick={() => onDelete(cliente)}>
                    Eliminar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableCard>
  );
}
