import type { ReactNode } from "react";

import { Card } from "./Card";

type StatCardProps = {
  title: string;
  value: ReactNode;
  accent?: ReactNode;
  helper?: ReactNode;
  className?: string;
};

export function StatCard({ title, value, accent, helper, className = "" }: StatCardProps) {
  return (
    <Card className={`flex h-full min-h-[11.5rem] flex-col ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">{title}</p>
        </div>
        {accent && (
          <div className="inline-flex min-h-[2.15rem] min-w-[2.15rem] items-center justify-center rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)] px-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
            {accent}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center text-center">
          <p className="text-[2.1rem] font-semibold leading-none tracking-[-0.05em] text-[var(--text-main)] md:text-[2.45rem]">
            {value}
          </p>
        </div>
        {helper && <div className="flex justify-center pt-3">{helper}</div>}
      </div>
    </Card>
  );
}
