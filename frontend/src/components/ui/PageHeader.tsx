import type { ReactNode } from "react";

type PageHeaderProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  const hasHeadingContent = Boolean(title || subtitle);

  return (
    <div
      className={`mb-6 flex flex-wrap items-start gap-4 ${hasHeadingContent ? "justify-between" : "justify-end"}`}
    >
      {hasHeadingContent && (
        <div className="space-y-1.5">
          {title && <h1 className="text-[1.55rem] font-semibold tracking-[-0.03em] text-[var(--text-main)]">{title}</h1>}
          {subtitle && <p className="max-w-2xl text-sm leading-6 text-[var(--text-muted)]">{subtitle}</p>}
        </div>
      )}
      {actions && <div className="flex items-center gap-2 rounded-2xl bg-white/70 p-1.5">{actions}</div>}
    </div>
  );
}
