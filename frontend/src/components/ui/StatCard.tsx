import type { ReactNode } from "react";

import { Card } from "./Card";

type StatCardProps = {
  title: string;
  value: ReactNode;
  accent?: ReactNode;
  helper?: ReactNode;
  className?: string;
};

export function StatCard({
  title,
  value,
  accent,
  helper,
  className = "",
}: StatCardProps) {
  return (
    <Card className={`flex h-full min-h-[15rem] flex-col ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-stone-600">{title}</h3>
        {accent && (
          <div className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg bg-stone-100 px-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-600">
            {accent}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-1 flex-col justify-center text-center">
        <p className="text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">{value}</p>
        {helper && <div className="mt-4">{helper}</div>}
      </div>
    </Card>
  );
}
