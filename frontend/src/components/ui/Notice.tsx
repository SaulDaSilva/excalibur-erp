type NoticeVariant = "error" | "info" | "empty";

type NoticeProps = {
  message: string;
  variant?: NoticeVariant;
  className?: string;
};

const VARIANT_CLASSES: Record<NoticeVariant, string> = {
  error: "border-rose-200 bg-rose-50 text-rose-700",
  info: "border-stone-200 bg-white text-stone-600",
  empty: "border-stone-200 bg-stone-50 text-stone-600",
};

export function Notice({ message, variant = "info", className = "" }: NoticeProps) {
  return (
    <p className={`rounded-xl border px-4 py-3 text-sm shadow-sm ${VARIANT_CLASSES[variant]} ${className}`}>
      {message}
    </p>
  );
}
