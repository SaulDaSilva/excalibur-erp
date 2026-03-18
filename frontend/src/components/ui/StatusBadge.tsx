type StatusVariant = "success" | "warning" | "error" | "info" | "neutral";

type StatusBadgeProps = {
  label: string;
  variant?: StatusVariant;
  className?: string;
};

const BADGE_CLASSES: Record<StatusVariant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  error: "border-rose-200 bg-rose-50 text-rose-700",
  info: "border-teal-200 bg-teal-50 text-teal-700",
  neutral: "border-stone-200 bg-stone-100 text-stone-700",
};

const DOT_CLASSES: Record<StatusVariant, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-rose-500",
  info: "bg-teal-500",
  neutral: "bg-stone-500",
};

export function StatusBadge({
  label,
  variant = "neutral",
  className = "",
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${BADGE_CLASSES[variant]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_CLASSES[variant]}`} aria-hidden="true" />
      {label}
    </span>
  );
}
