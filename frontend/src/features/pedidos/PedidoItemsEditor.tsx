import { Button } from "../../components/ui/Button";
import type { Variante } from "../catalogo/api";
import type { PedidoItemPayload, PedidoItemKind } from "./types";
import styles from "./PedidoItemsEditor.module.css";

type PedidoItemsEditorProps = {
  items: PedidoItemPayload[];
  variantes: Variante[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, patch: Partial<PedidoItemPayload>) => void;
};

function updateKindDefaults(kind: PedidoItemKind): Partial<PedidoItemPayload> {
  if (kind === "PROMO") {
    return { kind, unit_price: "0.00" };
  }
  return { kind, unit_price: "1.00" };
}

export function PedidoItemsEditor({ items, variantes, onAdd, onRemove, onChange }: PedidoItemsEditorProps) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Items del pedido</h3>
          <p className={styles.subtitle}>Define los productos, cantidades y precios por cada item.</p>
        </div>
        <Button type="button" onClick={onAdd}>
          Agregar item
        </Button>
      </div>

      <div className={styles.list}>
        {items.map((item, index) => (
          <div key={index} className={styles.itemCard}>
            <div className={styles.itemHeader}>
              <p className={styles.itemTitle}>Item {index + 1}</p>
              <Button type="button" onClick={() => onRemove(index)} disabled={items.length <= 1}>
                Eliminar item
              </Button>
            </div>

            <div className={styles.itemGrid}>
              <div className={styles.field}>
                <label>Tipo</label>
                <select
                  value={item.kind}
                  onChange={(event) => onChange(index, updateKindDefaults(event.target.value as PedidoItemKind))}
                >
                  <option value="SALE">Venta</option>
                  <option value="PROMO">Promocion</option>
                </select>
              </div>

              <div className={styles.field}>
                <label>Variante</label>
                <select
                  value={item.product_variant || 0}
                  onChange={(event) => onChange(index, { product_variant: Number(event.target.value) })}
                >
                  <option value={0}>Seleccione una variante</option>
                  {variantes.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.product_name} - {variant.measure_mm}mm
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label>Cantidad</label>
                <input
                  type="number"
                  min={1}
                  value={item.quantity_pairs}
                  onChange={(event) => onChange(index, { quantity_pairs: Number(event.target.value) })}
                />
              </div>

              <div className={styles.field}>
                <label>Precio unitario</label>
                <input
                  type="number"
                  step="0.01"
                  min={item.kind === "PROMO" ? 0 : 0.01}
                  value={item.unit_price}
                  disabled={item.kind === "PROMO"}
                  onChange={(event) => onChange(index, { unit_price: event.target.value })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
