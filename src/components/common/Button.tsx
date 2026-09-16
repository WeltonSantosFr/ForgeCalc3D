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
    'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 select-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-[14px] px-4 py-2 gap-2 h-10',
    lg: 'text-[15px] px-5 py-2.5 gap-2.5 h-12',
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-[#065F46] text-white hover:bg-[#047857] active:bg-[#064E3B] focus:ring-[#065F46] shadow-sm',
    secondary:
      'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 border border-slate-200 focus:ring-slate-400',
    outline:
      'bg-transparent text-[#065F46] border border-[#065F46] hover:bg-emerald-50 focus:ring-[#065F46]',
    ghost:
      'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus:ring-slate-300',
    danger:
      'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 active:bg-rose-200 focus:ring-rose-500',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
};
