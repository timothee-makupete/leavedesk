import type { LeaveStatus } from "../api/types";

const map: Record<LeaveStatus, string> = {
  Pending: "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]",
  Approved: "bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]",
  Rejected: "bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]",
};

export function StatusBadge({ status }: { status: LeaveStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${map[status]}`}
    >
      {status}
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
}) {
  const tones = {
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    info: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
    success: "bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]",
    warning: "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]",
    danger: "bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
