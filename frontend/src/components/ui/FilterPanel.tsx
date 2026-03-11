import type { ReactNode } from "react";

import { Card } from "./Card";
import styles from "./FilterPanel.module.css";

type FilterPanelProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  gridClassName?: string;
};

export function FilterPanel({
  title = "Filtros",
  subtitle,
  children,
  className = "",
  gridClassName = "",
}: FilterPanelProps) {
  return (
    <Card className={`${styles.panel} ${className}`}>
      {(title || subtitle) && (
        <div className={styles.header}>
          <div>
            {title && <p className={styles.title}>{title}</p>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        </div>
      )}
      <div className={`${styles.filterGrid} ${gridClassName}`}>{children}</div>
    </Card>
  );
}

export { styles as filterPanelStyles };
