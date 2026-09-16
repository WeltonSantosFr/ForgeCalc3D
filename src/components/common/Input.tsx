import React from 'react';
import { sanitizeNumericString } from '../../utils/inputs';

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
      type,
      onKeyDown,
      onPaste,
      onFocus,
      onChange,
      inputMode,
      min,
      step,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const isNumber = type === 'number';
    const isInteger = step === '1';
    const isNonNegative = min === undefined || Number(min) >= 0;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (isNumber) {
        // Permitir teclas de navegação, edição e atalhos
        const allowedKeys = [
          'Backspace',
          'Delete',
          'Tab',
          'Escape',
          'Enter',
          'ArrowLeft',
          'ArrowRight',
          'ArrowUp',
          'ArrowDown',
          'Home',
          'End',
        ];

        if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey || e.altKey) {
          onKeyDown?.(e);
          return;
        }

        // Bloquear especificamente caracteres como 'e', 'E', '*', '~' e especiais
        if (
          e.key === 'e' ||
          e.key === 'E' ||
          ['*', '~', '/', '^', '#', '$', '%', '&', '(', ')', '=', '?', '!', ';', ':', '<', '>', '\\', '|', '`', '"', "'"].includes(e.key)
        ) {
          e.preventDefault();
          return;
        }

        // Bloquear sinal negativo e positivo se for não-negativo
        if (isNonNegative && (e.key === '-' || e.key === '+')) {
          e.preventDefault();
          return;
        }

        // Bloquear ponto e vírgula se for campo estritamente inteiro
        if (isInteger && (e.key === '.' || e.key === ',')) {
          e.preventDefault();
          return;
        }

        // Bloquear mais de um separador decimal
        if ((e.key === '.' || e.key === ',') && (e.currentTarget.value.includes('.') || e.currentTarget.value.includes(','))) {
          e.preventDefault();
          return;
        }

        // Bloquear qualquer caractere que não seja dígito ou separador decimal permitido
        if (!/[\d.,-]/.test(e.key)) {
          e.preventDefault();
          return;
        }
      }

      onKeyDown?.(e);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (isNumber) {
        const text = e.clipboardData.getData('text');
        const sanitized = sanitizeNumericString(text, !isInteger, !isNonNegative);
        if (text !== sanitized) {
          e.preventDefault();
          // Insere o texto limpo na posição do cursor
          const target = e.currentTarget;
          const start = target.selectionStart || 0;
          const end = target.selectionEnd || 0;
          const current = target.value;
          const nextVal = current.substring(0, start) + sanitized + current.substring(end);
          target.value = sanitizeNumericString(nextVal, !isInteger, !isNonNegative);

          // Dispara evento onChange sintetizado
          const event = new Event('input', { bubbles: true });
          target.dispatchEvent(event);
        }
      }
      onPaste?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Se o valor for '0', seleciona todo o texto para que a digitação substitua imediatamente o zero
      if (isNumber && e.currentTarget.value === '0') {
        e.currentTarget.select();
      }
      onFocus?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isNumber) {
        let val = e.target.value;
        if (val) {
          val = sanitizeNumericString(val, !isInteger, !isNonNegative);
          e.target.value = val;
        }
      }
      onChange?.(e);
    };

    // Define o melhor teclado virtual para dispositivos móveis
    const computedInputMode =
      inputMode || (isNumber ? (isInteger ? 'numeric' : 'decimal') : undefined);

    const borderStyle = error
      ? 'border-rose-400 focus-within:border-rose-600 focus-within:ring-1 focus-within:ring-rose-500'
      : 'border-slate-200 focus-within:border-[#065F46] focus-within:ring-1 focus-within:ring-[#065F46]';

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
        <div
          className={`relative flex items-center rounded-lg border bg-white transition-all shadow-xs ${borderStyle}`}
        >
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
            type={type}
            min={min}
            step={step}
            inputMode={computedInputMode}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onFocus={handleFocus}
            onChange={handleChange}
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
