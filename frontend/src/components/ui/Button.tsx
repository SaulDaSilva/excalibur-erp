import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "md" | "sm";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "border border-[rgba(49,94,251,0.16)] bg-[linear-gradient(180deg,#3d68ff_0%,#315efb_100%)] text-white shadow-[0_12px_24px_rgba(49,94,251,0.22)] hover:border-[rgba(49,94,251,0.28)] hover:bg-[linear-gradient(180deg,#456fff_0%,#2f58ea_100%)] disabled:border-[rgba(49,94,251,0.08)] disabled:bg-[linear-gradient(180deg,#b8c7ff_0%,#9fb3ff_100%)] disabled:text-white/85",
  secondary:
    "border border-[var(--border-soft)] bg-white/90 text-[var(--text-main)] shadow-[0_4px_14px_rgba(15,23,42,0.04)] hover:border-[var(--border-strong)] hover:bg-white disabled:border-[var(--border-soft)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-soft)]",
  danger:
    "border border-rose-200 bg-[var(--danger-soft)] text-[var(--danger-text)] shadow-[0_4px_14px_rgba(225,29,72,0.08)] hover:border-rose-300 hover:bg-rose-50 disabled:border-rose-100 disabled:bg-rose-50 disabled:text-rose-300",
  ghost:
    "border border-transparent bg-transparent text-[var(--text-muted)] hover:border-[var(--border-soft)] hover:bg-white/80 hover:text-[var(--text-main)] disabled:text-[var(--text-soft)]",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "min-h-[2.9rem] px-4 py-2.5 text-sm",
  sm: "min-h-[2.35rem] px-3.5 py-2 text-[0.78rem]",
};

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-semibold tracking-[-0.01em] transition duration-150 ease-out ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
