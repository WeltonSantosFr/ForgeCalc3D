import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 transition-shadow ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between mb-4 gap-2">
          <div>
            {title && (
              <h2 className="font-heading text-[18px] font-bold text-slate-900 tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-slate-500 text-xs mt-0.5 font-normal">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
