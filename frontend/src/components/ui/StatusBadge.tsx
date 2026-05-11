type StatusVariant = "success" | "warning" | "error" | "info" | "neutral";

type StatusBadgeProps = {
  label: string;
  variant?: StatusVariant;
  className?: string;
};

const BADGE_CLASSES: Record<StatusVariant, string> = {
  success: "border-emerald-100 bg-[var(--success-soft)] text-[var(--success-text)]",
  warning: "border-amber-100 bg-[var(--warning-soft)] text-[var(--warning-text)]",
  error: "border-rose-100 bg-[var(--danger-soft)] text-[var(--danger-text)]",
  info: "border-[rgba(49,94,251,0.12)] bg-[var(--accent-soft)] text-[var(--accent)]",
  neutral: "border-[var(--border-soft)] bg-[var(--surface-muted)] text-[var(--text-muted)]",
};

const DOT_CLASSES: Record<StatusVariant, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-rose-500",
  info: "bg-[var(--accent)]",
  neutral: "bg-[var(--text-soft)]",
};

export function StatusBadge({ label, variant = "neutral", className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.01em] ${BADGE_CLASSES[variant]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_CLASSES[variant]}`} aria-hidden="true" />
      {label}
    </span>
  );
}
