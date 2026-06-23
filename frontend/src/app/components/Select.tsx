import { forwardRef, type SelectHTMLAttributes } from "react";

type Option = { value: string; label: string };
type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, error, options, placeholder, className = "", id, ...rest },
  ref,
) {
  const selectId = id || rest.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-xs font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`block w-full rounded-md border bg-white px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 ${
          error ? "border-[#DC2626]" : "border-[#E2E8F0] focus:border-[#2563EB]"
        } ${className}`}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-[#DC2626]">{error}</p>}
    </div>
  );
});
