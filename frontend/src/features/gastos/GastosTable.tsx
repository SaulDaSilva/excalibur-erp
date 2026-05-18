import { Button } from "../../components/ui/Button";
import styles from "../../components/ui/DataTable.module.css";
import { Notice } from "../../components/ui/Notice";
import { TableCard } from "../../components/ui/TableCard";
import { EXPENSE_FORM_GROUP_LABELS, type Expense } from "./types";

type GastosTableProps = {
  data: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
};

function formatExpenseDate(value: string): string {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium" }).format(parsed);
}

function formatCurrency(value: string): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return value;
  }

  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function GastosTable({ data, onEdit, onDelete }: GastosTableProps) {
  if (data.length === 0) {
    return <Notice variant="empty" message="No se encontraron gastos." />;
  }

  return (
    <TableCard>
      <table className={styles.table}>
        <thead className={styles.head}>
          <tr>
            <th className={styles.th}>Fecha</th>
            <th className={styles.th}>Categoria</th>
            <th className={styles.th}>Subcategoria</th>
            <th className={styles.th}>Descripcion</th>
            <th className={styles.th}>Observaciones</th>
            <th className={styles.th}>Monto</th>
            <th className={styles.thRight}>Acciones</th>
          </tr>
        </thead>
        <tbody className={styles.body}>
          {data.map((expense) => (
            <tr key={expense.id} className={styles.row}>
              <td className={styles.td}>{formatExpenseDate(expense.expense_date)}</td>
              <td className={styles.td}>
                {expense.category_group ? EXPENSE_FORM_GROUP_LABELS[expense.category_group] : "-"}
              </td>
              <td className={styles.td}>
                {expense.category_name}
              </td>
              <td className={styles.td}>
                <div className={styles.cellStack}>
                  <p className={styles.primaryText}>{expense.description}</p>
                </div>
              </td>
              <td className={styles.td}>{expense.notes || "-"}</td>
              <td className={styles.td}>
                <span className="font-medium text-stone-900">{formatCurrency(expense.amount)}</span>
              </td>
              <td className={styles.tdRight}>
                <div className={styles.actions}>
                  <Button type="button" size="sm" onClick={() => onEdit(expense)}>
                    Editar
                  </Button>
                  {expense.is_active && (
                    <Button type="button" size="sm" variant="danger" onClick={() => onDelete(expense)}>
                      Eliminar
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableCard>
  );
}
