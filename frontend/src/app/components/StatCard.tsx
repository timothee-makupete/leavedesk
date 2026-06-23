import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
}) {
  const tones = {
    neutral: "text-slate-600 bg-slate-100",
    info: "text-[#1D4ED8] bg-[#EFF6FF]",
    success: "text-[#16A34A] bg-[#DCFCE7]",
    warning: "text-[#D97706] bg-[#FEF3C7]",
    danger: "text-[#DC2626] bg-[#FEE2E2]",
  } as const;
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 sm:text-xs">
          {label}
        </span>
        {icon && (
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${tones[tone]}`}>
            {icon}
          </span>
        )}
      </div>
      <div className="mt-3 text-xl font-semibold text-[#0F172A] sm:text-2xl">{value}</div>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
