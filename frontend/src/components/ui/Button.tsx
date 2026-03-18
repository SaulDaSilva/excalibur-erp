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
    "border border-teal-600 bg-teal-600 text-white hover:bg-teal-700 disabled:border-teal-300 disabled:bg-teal-300 disabled:text-teal-50",
  secondary:
    "border border-stone-200 bg-white text-stone-900 hover:bg-stone-50 disabled:border-stone-200 disabled:bg-stone-100 disabled:text-stone-400",
  danger:
    "border border-rose-600 bg-rose-600 text-white hover:bg-rose-700 disabled:border-rose-300 disabled:bg-rose-300 disabled:text-rose-100",
  ghost:
    "border border-transparent bg-transparent text-stone-700 hover:bg-stone-100 disabled:text-stone-400",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "px-4 py-2.5 text-sm",
  sm: "px-3 py-1.5 text-xs",
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
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium shadow-sm transition duration-150 ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
