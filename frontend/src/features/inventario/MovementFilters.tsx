import { FilterPanel, filterPanelStyles } from "../../components/ui/FilterPanel";
import type { Variante } from "../catalogo/api";

export type MovementFilterState = {
  movementType: string;
  variantId: number | null;
  orderId: number | null;
  from: string;
  to: string;
};

type MovementFiltersProps = {
  value: MovementFilterState;
  variantes: Variante[];
  onChange: (next: MovementFilterState) => void;
};

export function MovementFilters({ value, variantes, onChange }: MovementFiltersProps) {
  return (
    <FilterPanel
      title="Filtros"
      subtitle="Filtra por tipo, variante, pedido o rango de fechas."
      gridClassName={filterPanelStyles.fiveFieldGrid}
    >
      <div className={filterPanelStyles.field}>
        <span className={filterPanelStyles.fieldLabel}>Tipo</span>
        <select value={value.movementType} onChange={(event) => onChange({ ...value, movementType: event.target.value })}>
          <option value="">Todos los tipos</option>
          <option value="PRODUCTION">Produccion</option>
          <option value="ADJUSTMENT">Ajuste</option>
          <option value="SALE">Venta</option>
          <option value="PROMO">Promocion</option>
          <option value="REVERSAL_SALE">Reversion venta</option>
          <option value="REVERSAL_PROMO">Reversion promocion</option>
        </select>
      </div>

      <div className={filterPanelStyles.field}>
        <span className={filterPanelStyles.fieldLabel}>Variante</span>
        <select
          value={value.variantId ?? ""}
          onChange={(event) => onChange({ ...value, variantId: event.target.value ? Number(event.target.value) : null })}
        >
          <option value="">Todas las variantes</option>
          {variantes.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.product_name} - {variant.measure_mm}mm
            </option>
          ))}
        </select>
      </div>

      <div className={filterPanelStyles.field}>
        <span className={filterPanelStyles.fieldLabel}>Pedido</span>
        <input
          type="number"
          placeholder="ID pedido"
          value={value.orderId ?? ""}
          onChange={(event) => onChange({ ...value, orderId: event.target.value ? Number(event.target.value) : null })}
        />
      </div>
      <div className={filterPanelStyles.field}>
        <span className={filterPanelStyles.fieldLabel}>Desde</span>
        <input type="date" value={value.from} onChange={(event) => onChange({ ...value, from: event.target.value })} />
      </div>
      <div className={filterPanelStyles.field}>
        <span className={filterPanelStyles.fieldLabel}>Hasta</span>
        <input type="date" value={value.to} onChange={(event) => onChange({ ...value, to: event.target.value })} />
      </div>
    </FilterPanel>
  );
}
