import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import type { Variante } from "../catalogo/api";
import type { AdjustmentPayload } from "./types";

type AdjustmentFormProps = {
  variantes: Variante[];
  onSubmit: (payload: AdjustmentPayload) => Promise<void>;
  loading: boolean;
};

export function AdjustmentForm({ variantes, onSubmit, loading }: AdjustmentFormProps) {
  const [productVariant, setProductVariant] = useState(0);
  const [quantityPairs, setQuantityPairs] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (productVariant <= 0) {
      setError("Select a variant.");
      return;
    }
    if (quantityPairs === 0) {
      setError("Quantity cannot be 0.");
      return;
    }
    if (!note.trim()) {
      setError("Note is required.");
      return;
    }

    try {
      await onSubmit({ product_variant: productVariant, quantity_pairs: quantityPairs, note: note.trim() });
      setProductVariant(0);
      setQuantityPairs(1);
      setNote("");
    } catch {
      setError("Could not create adjustment movement.");
    }
  };

  return (
    <Card>
      <h3 className="mb-3 text-base font-semibold text-slate-900">Adjustment</h3>
      <div className="space-y-3">
        <select value={productVariant} onChange={(event) => setProductVariant(Number(event.target.value))}>
          <option value={0}>Select variant</option>
          {variantes.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.product_name} - {variant.measure_mm}mm
            </option>
          ))}
        </select>
        <input
          type="number"
          value={quantityPairs}
          onChange={(event) => setQuantityPairs(Number(event.target.value))}
        />
        <input type="text" placeholder="Note (required)" value={note} onChange={(event) => setNote(event.target.value)} />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <Button type="button" variant="primary" onClick={submit} disabled={loading}>
          {loading ? "Saving..." : "Create adjustment"}
        </Button>
      </div>
    </Card>
  );
}
