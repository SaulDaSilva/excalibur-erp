import type { ReactNode } from "react";

type PageHeaderProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  const hasHeadingContent = Boolean(title || subtitle);

  return (
    <div className={`mb-4 flex flex-wrap items-start gap-3 ${hasHeadingContent ? "justify-between" : "justify-end"}`}>
      {hasHeadingContent && (
        <div>
          {title && <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">{title}</h1>}
          {subtitle && <p className={`${title ? "mt-1" : ""} text-sm text-slate-600`}>{subtitle}</p>}
        </div>
      )}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
