import React from 'react';

interface Option {
  value: string;
  label: string;
  sublabel?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  placeholder?: string;
  helperText?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      placeholder,
      helperText,
      error,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 transition-all focus-within:border-[#065F46] dark:focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-[#065F46] dark:focus-within:ring-emerald-500 shadow-xs">
          <select
            ref={ref}
            id={selectId}
            className={`w-full px-3 py-2 text-[14px] font-normal text-slate-900 dark:text-white bg-transparent rounded-lg focus:outline-none appearance-none cursor-pointer pr-9 ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="dark:bg-slate-800 dark:text-slate-400">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="dark:bg-slate-800 dark:text-white">
                {opt.label} {opt.sublabel ? `(${opt.sublabel})` : ''}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 dark:text-slate-400">
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        {helperText && !error && (
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-normal">{helperText}</p>
        )}
        {error && (
          <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
