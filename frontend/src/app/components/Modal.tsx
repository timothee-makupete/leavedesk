import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${widths[size]} rounded-lg border border-[#E2E8F0] bg-white shadow-lg`}
      >
        <div className="flex items-start justify-between border-b border-[#E2E8F0] px-5 py-3">
          <h3 className="text-sm font-semibold text-[#0F172A]">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4 text-sm text-slate-700">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-[#E2E8F0] bg-slate-50 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
