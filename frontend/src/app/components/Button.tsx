import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary:
    "bg-[#2563EB] text-white hover:bg-[#1D4ED8] focus-visible:ring-[#2563EB]",
  secondary:
    "border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-slate-50 focus-visible:ring-slate-300",
  ghost: "text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-300",
  danger: "bg-[#DC2626] text-white hover:bg-[#B91C1C] focus-visible:ring-[#DC2626]",
  success: "bg-[#16A34A] text-white hover:bg-[#15803D] focus-visible:ring-[#16A34A]",
};

const sizes: Record<Size, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3.5 py-2",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", className = "", loading, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
    </button>
  );
});
