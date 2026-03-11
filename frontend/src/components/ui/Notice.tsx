type NoticeVariant = "error" | "info" | "empty";

type NoticeProps = {
  message: string;
  variant?: NoticeVariant;
  className?: string;
};

const VARIANT_CLASSES: Record<NoticeVariant, string> = {
  error: "border-rose-200 bg-rose-50 text-rose-700",
  info: "border-slate-200 bg-white text-slate-600",
  empty: "border-slate-200 bg-slate-50 text-slate-600",
};

export function Notice({ message, variant = "info", className = "" }: NoticeProps) {
  return (
    <p className={`rounded-xl border px-3 py-2 text-sm ${VARIANT_CLASSES[variant]} ${className}`}>
      {message}
    </p>
  );
}
