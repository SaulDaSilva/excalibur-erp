import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <section
      className={`rounded-[28px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.92)] p-5 shadow-[var(--shadow-card)] backdrop-blur-sm md:p-6 ${className}`}
    >
      {children}
    </section>
  );
}
