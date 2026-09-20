import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 select-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-center leading-tight';

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'text-xs px-2.5 sm:px-3 py-1.5 gap-1.5 min-h-8 h-auto',
    md: 'text-[14px] px-3 sm:px-4 py-2 gap-1.5 sm:gap-2 min-h-10 h-auto',
    lg: 'text-[15px] px-4 sm:px-5 py-2.5 gap-2 sm:gap-2.5 min-h-12 h-auto',
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-[#065F46] text-white hover:bg-[#047857] active:bg-[#064E3B] focus:ring-[#065F46] dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:active:bg-emerald-700 dark:focus:ring-emerald-500 shadow-sm',
    secondary:
      'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600 border border-slate-200 dark:border-slate-700 focus:ring-slate-400 dark:focus:ring-slate-500',
    outline:
      'bg-transparent text-[#065F46] dark:text-emerald-400 border border-[#065F46] dark:border-emerald-500/70 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 focus:ring-[#065F46] dark:focus:ring-emerald-500',
    ghost:
      'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 focus:ring-slate-300 dark:focus:ring-slate-600',
    danger:
      'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-950/70 active:bg-rose-200 dark:active:bg-rose-900 focus:ring-rose-500',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      <span className="leading-tight text-center">{children}</span>
      {iconRight && <span className="shrink-0 flex items-center">{iconRight}</span>}
    </button>
  );
};
