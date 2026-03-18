import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <section className={`rounded-xl border border-stone-200 bg-white p-5 shadow-sm md:p-6 ${className}`}>
      {children}
    </section>
  );
}
