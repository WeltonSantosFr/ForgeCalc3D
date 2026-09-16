import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  prefixText?: string;
  suffixText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      prefixText,
      suffixText,
      icon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-slate-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center rounded-lg border border-slate-200 bg-white transition-all focus-within:border-[#065F46] focus-within:ring-1 focus-within:ring-[#065F46] shadow-xs">
          {icon && (
            <div className="pl-3 text-slate-400 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          {prefixText && (
            <span className="pl-3 text-xs font-semibold text-slate-400 select-none">
              {prefixText}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full px-3 py-2 text-[14px] font-normal text-slate-900 bg-transparent rounded-lg focus:outline-none placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-400 ${
              prefixText ? 'pl-1.5' : ''
            } ${suffixText ? 'pr-1.5' : ''} ${className}`}
            {...props}
          />
          {suffixText && (
            <span className="pr-3 text-xs font-medium text-slate-500 select-none">
              {suffixText}
            </span>
          )}
        </div>
        {helperText && !error && (
          <p className="mt-1 text-[11px] text-slate-500 font-normal">{helperText}</p>
        )}
        {error && (
          <p className="mt-1 text-[11px] text-rose-600 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
