import {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

type BaseProps = {
  label: string;
  className?: string;
};

type Option = {
  label: string;
  value: string;
};

function hasAnyValue(value: unknown) {
  if (typeof value === "number") return value !== 0;
  if (Array.isArray(value)) return value.length > 0;
  return String(value ?? "").length > 0;
}

export function FloatingInput({
  label,
  className = "",
  value,
  ...props
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const filled = hasAnyValue(value);

  return (
    <label className={`relative block ${className}`.trim()}>
      <input
        {...props}
        value={value}
        placeholder=" "
        className="peer w-full rounded-xl border border-white/40 bg-slate-900/35 px-3 pb-2 pt-6 text-sm text-white outline-none transition focus:border-cyan-200 focus:bg-slate-900/45"
      />
      <span
        className={`pointer-events-none absolute left-3 text-white/90 transition-all duration-200 ${
          filled
            ? "top-2 text-[11px]"
            : "top-1/2 -translate-y-1/2 text-sm peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px]"
        }`}
      >
        {label}
      </span>
    </label>
  );
}

export function FloatingTextarea({
  label,
  className = "",
  value,
  ...props
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const filled = hasAnyValue(value);

  return (
    <label className={`relative block ${className}`.trim()}>
      <textarea
        {...props}
        value={value}
        placeholder=" "
        className="peer w-full rounded-xl border border-white/40 bg-slate-900/35 px-3 pb-2 pt-6 text-sm text-white outline-none transition focus:border-cyan-200 focus:bg-slate-900/45"
      />
      <span
        className={`pointer-events-none absolute left-3 text-white/90 transition-all duration-200 ${
          filled
            ? "top-2 text-[11px]"
            : "top-6 -translate-y-1/2 text-sm peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px]"
        }`}
      >
        {label}
      </span>
    </label>
  );
}

export function FloatingSelect({
  label,
  className = "",
  value,
  options,
  placeholder = "Pilih opsi",
  ...props
}: BaseProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    options: Option[];
    placeholder?: string;
  }) {
  const filled = hasAnyValue(value);

  return (
    <label className={`relative block ${className}`.trim()}>
      <select
        {...props}
        value={value}
        className="w-full rounded-xl border border-white/40 bg-slate-900/35 px-3 pb-2 pt-6 text-sm text-white outline-none transition focus:border-cyan-200 focus:bg-slate-900/45"
      >
        <option value="" disabled className="text-slate-900">
          {placeholder}
        </option>
        {options.map((item) => (
          <option
            key={item.value}
            value={item.value}
            className="text-slate-900"
          >
            {item.label}
          </option>
        ))}
      </select>
      <span
        className={`pointer-events-none absolute left-3 text-white/90 transition-all duration-200 ${filled ? "top-2 text-[11px]" : "top-1/2 -translate-y-1/2 text-sm"}`}
      >
        {label}
      </span>
    </label>
  );
}
