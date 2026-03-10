import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
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
      <Card>
        <p className="text-sm text-slate-600">No se encontraron clientes.</p>
      </Card>
    );
  }

  return (
    <TableCard>
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Nombre</th>
            <th className="px-4 py-3 text-left font-medium">ID</th>
            <th className="px-4 py-3 text-left font-medium">Correo</th>
            <th className="px-4 py-3 text-left font-medium">Telefono</th>
            <th className="px-4 py-3 text-left font-medium">Pais</th>
            <th className="px-4 py-3 text-left font-medium">Activo</th>
            <th className="px-4 py-3 text-left font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
          {data.map((cliente) => (
            <tr key={cliente.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">{`${cliente.first_name} ${cliente.last_name}`.trim()}</td>
              <td className="px-4 py-3">{cliente.id_number}</td>
              <td className="px-4 py-3">{cliente.email || "-"}</td>
              <td className="px-4 py-3">{cliente.phone || "-"}</td>
              <td className="px-4 py-3">{cliente.country}</td>
              <td className="px-4 py-3">{cliente.is_active ? "Si" : "No"}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
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
