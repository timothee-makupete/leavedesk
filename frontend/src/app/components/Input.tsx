import { forwardRef, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, hint, className = "", id, ...rest },
  ref,
) {
  const inputId = id || rest.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-xs font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`block w-full rounded-md border bg-white px-3 py-2 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 ${
          error ? "border-[#DC2626]" : "border-[#E2E8F0] focus:border-[#2563EB]"
        } ${className}`}
        {...rest}
      />
      {error ? (
        <p className="mt-1 text-xs text-[#DC2626]">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
});
