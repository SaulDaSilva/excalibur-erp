import type { ReactNode } from "react";

type PageHeaderProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  const hasHeadingContent = Boolean(title || subtitle);

  return (
    <div className={`mb-6 flex flex-wrap items-start gap-4 ${hasHeadingContent ? "justify-between" : "justify-end"}`}>
      {hasHeadingContent && (
        <div className="space-y-1">
          {title && <h1 className="text-xl font-semibold text-stone-900 md:text-2xl">{title}</h1>}
          {subtitle && <p className="text-sm text-stone-500">{subtitle}</p>}
        </div>
      )}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
