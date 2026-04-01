import { Button } from "../../components/ui/Button";
import {
  ECUADOR_PROVINCES,
  getEcuadorCities,
  mergeOption,
} from "./ecuadorLocations";
import type { DireccionDraft, DireccionFieldName } from "./types";
import styles from "./DireccionesEditor.module.css";

type DireccionesEditorProps = {
  addresses: DireccionDraft[];
  errors: Record<number, Partial<Record<DireccionFieldName, string>>>;
  useEcuadorPreset: boolean;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, patch: Partial<DireccionDraft>) => void;
  onSetPrimary: (index: number) => void;
};

export function DireccionesEditor({
  addresses,
  errors,
  useEcuadorPreset,
  onAdd,
  onRemove,
  onChange,
  onSetPrimary,
}: DireccionesEditorProps) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>Direcciones</p>
          <p className={styles.subtitle}>
            Puedes registrar multiples direcciones. Una de ellas debe quedar como principal.
          </p>
        </div>
        <Button type="button" onClick={onAdd}>
          Agregar direccion
        </Button>
      </div>

      <div className={styles.list}>
        {addresses.length === 0 && (
          <p className={styles.subtitle}>Aun no hay direcciones agregadas.</p>
        )}

        {addresses.map((address, index) => {
          const addressErrors = errors[index] ?? {};
          const provinceOptions = mergeOption(ECUADOR_PROVINCES, address.province);
          const cityOptions = mergeOption(getEcuadorCities(address.province), address.city);

          return (
            <div key={address.id ?? `new-${index}`} className={styles.card}>
              <div className={styles.cardHeader}>
                <p className={styles.cardTitle}>Direccion {index + 1}</p>
                <Button type="button" variant="danger" onClick={() => onRemove(index)}>
                  Eliminar
                </Button>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label htmlFor={`province-${index}`}>Provincia</label>
                  {useEcuadorPreset ? (
                    <select
                      id={`province-${index}`}
                      value={address.province}
                      onChange={(event) => onChange(index, { province: event.target.value, city: "" })}
                    >
                      <option value="">Seleccione una provincia</option>
                      {provinceOptions.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`province-${index}`}
                      type="text"
                      value={address.province}
                      onChange={(event) => onChange(index, { province: event.target.value })}
                    />
                  )}
                  {addressErrors.province && <p className={styles.errorText}>{addressErrors.province}</p>}
                </div>

                <div className={styles.field}>
                  <label htmlFor={`city-${index}`}>Ciudad</label>
                  {useEcuadorPreset ? (
                    <select
                      id={`city-${index}`}
                      value={address.city}
                      disabled={!address.province}
                      onChange={(event) => onChange(index, { city: event.target.value })}
                    >
                      <option value="">{address.province ? "Seleccione una ciudad" : "Primero seleccione provincia"}</option>
                      {cityOptions.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`city-${index}`}
                      type="text"
                      value={address.city}
                      onChange={(event) => onChange(index, { city: event.target.value })}
                    />
                  )}
                  {addressErrors.city && <p className={styles.errorText}>{addressErrors.city}</p>}
                </div>

                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor={`address-line-${index}`}>Direccion</label>
                  <input
                    id={`address-line-${index}`}
                    type="text"
                    value={address.address_line}
                    onChange={(event) => onChange(index, { address_line: event.target.value })}
                  />
                  {addressErrors.address_line && <p className={styles.errorText}>{addressErrors.address_line}</p>}
                </div>

                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.checkbox}>
                    <input
                      className={styles.checkboxInput}
                      type="checkbox"
                      checked={address.is_primary}
                      onChange={() => onSetPrimary(index)}
                    />
                    Direccion principal
                  </label>
                  {addressErrors.is_primary && <p className={styles.errorText}>{addressErrors.is_primary}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
