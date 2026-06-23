import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  title,
  subtitle,
  actions,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className={`overflow-hidden rounded-lg border border-[#E2E8F0] bg-white ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] px-4 py-3 sm:px-5">
          <div>
            {title && <h3 className="text-sm font-semibold text-[#0F172A]">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}
