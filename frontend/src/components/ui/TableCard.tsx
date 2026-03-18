import type { ReactNode } from "react";

import { Card } from "./Card";

type TableCardProps = {
  children: ReactNode;
  className?: string;
  scrollAreaClassName?: string;
};

export function TableCard({
  children,
  className = "",
  scrollAreaClassName = "h-[28rem]",
}: TableCardProps) {
  return (
    <Card className={`overflow-hidden p-0 ${className}`}>
      <div className={`overflow-auto ${scrollAreaClassName}`}>{children}</div>
    </Card>
  );
}
