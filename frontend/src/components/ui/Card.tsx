import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return <section className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5 ${className}`}>{children}</section>;
}
