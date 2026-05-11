type NoticeVariant = "error" | "info" | "empty";

type NoticeProps = {
  message: string;
  variant?: NoticeVariant;
  className?: string;
};

const VARIANT_CLASSES: Record<NoticeVariant, string> = {
  error: "border-rose-200 bg-[var(--danger-soft)] text-[var(--danger-text)]",
  info: "border-[var(--border-soft)] bg-white/90 text-[var(--text-muted)]",
  empty: "border-dashed border-[var(--border-soft)] bg-[var(--surface-muted)] text-[var(--text-muted)]",
};

export function Notice({ message, variant = "info", className = "" }: NoticeProps) {
  return (
    <p
      className={`rounded-2xl border px-4 py-3 text-sm font-medium shadow-[0_6px_18px_rgba(15,23,42,0.03)] ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {message}
    </p>
  );
}
