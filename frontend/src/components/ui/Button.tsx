import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "border border-slate-900 bg-slate-900 text-white hover:bg-slate-800 disabled:border-slate-400 disabled:bg-slate-300 disabled:text-slate-600",
  secondary:
    "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400",
  danger:
    "border border-rose-600 bg-rose-600 text-white hover:bg-rose-500 disabled:border-rose-300 disabled:bg-rose-300 disabled:text-rose-100",
  ghost:
    "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400",
};

export function Button({
  variant = "secondary",
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium shadow-sm transition ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
