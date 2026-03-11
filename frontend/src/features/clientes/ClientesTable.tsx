import { Button } from "../../components/ui/Button";
import styles from "../../components/ui/DataTable.module.css";
import { Notice } from "../../components/ui/Notice";
import { TableCard } from "../../components/ui/TableCard";
import type { Cliente } from "./types";

type ClientesTableProps = {
  data: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (cliente: Cliente) => void;
};

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
            <th className={styles.th}>Acciones</th>
          </tr>
        </thead>
        <tbody className={styles.body}>
          {data.map((cliente) => (
            <tr key={cliente.id} className={styles.row}>
              <td className={styles.td}>
                <div className={styles.cellStack}>
                  <p className={styles.primaryText}>{`${cliente.first_name} ${cliente.last_name}`.trim()}</p>
                </div>
              </td>
              <td className={styles.td}>{cliente.id_number}</td>
              <td className={styles.td}>{cliente.email || "-"}</td>
              <td className={styles.td}>{cliente.phone || "-"}</td>
              <td className={styles.td}>{cliente.country}</td>
              <td className={styles.td}>{cliente.is_active ? "Si" : "No"}</td>
              <td className={styles.td}>
                <div className={styles.actions}>
                  <Button type="button" onClick={() => onEdit(cliente)}>
                    Editar
                  </Button>
                  <Button type="button" variant="danger" onClick={() => onDelete(cliente)}>
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
