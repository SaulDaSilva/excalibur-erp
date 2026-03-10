import { Button } from "../../components/ui/Button";
import type { Variante } from "../catalogo/api";
import type { PedidoItemPayload, PedidoItemKind } from "./types";

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
    <section>
      <h3 className="text-base font-semibold text-slate-900">Items del pedido</h3>
      {items.map((item, index) => (
        <div key={index} className="mt-3 grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <select
            value={item.kind}
            onChange={(event) => onChange(index, updateKindDefaults(event.target.value as PedidoItemKind))}
          >
            <option value="SALE">SALE</option>
            <option value="PROMO">PROMO</option>
          </select>

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

          <input
            type="number"
            min={1}
            value={item.quantity_pairs}
            onChange={(event) => onChange(index, { quantity_pairs: Number(event.target.value) })}
          />

          <input
            type="number"
            step="0.01"
            min={item.kind === "PROMO" ? 0 : 0.01}
            value={item.unit_price}
            disabled={item.kind === "PROMO"}
            onChange={(event) => onChange(index, { unit_price: event.target.value })}
          />

          <Button type="button" onClick={() => onRemove(index)} disabled={items.length <= 1}>
            Eliminar item
          </Button>
        </div>
      ))}
      <Button type="button" className="mt-3" onClick={onAdd}>
        Agregar item
      </Button>
    </section>
  );
}
