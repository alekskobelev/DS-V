import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface TkpSectionCardProps {
  icon?: LucideIcon;
  iconColor?: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  isDark?: boolean;
}

export const TkpSectionCard: React.FC<TkpSectionCardProps> = ({
  icon: Icon,
  iconColor = 'text-blue-500',
  title,
  subtitle,
  badge,
  actions,
  children,
  className = '',
  isDark = false,
}) => {
  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 space-y-3.5 transition-all duration-200 ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-sm'
          : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      } ${className}`}
    >
      <div
        className={`flex flex-wrap items-center justify-between border-b pb-3 gap-2 ${
          isDark ? 'border-slate-800' : 'border-slate-200/80'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div
              className={`p-1.5 rounded-lg border flex items-center justify-center shrink-0 ${
                isDark
                  ? 'bg-slate-800/90 border-slate-700/80 text-blue-400'
                  : 'bg-blue-50 border-blue-200/70 text-blue-600'
              }`}
            >
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-xs sm:text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {title}
              </h2>
              {badge}
            </div>
            {subtitle && (
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </div>

      <div className="space-y-3">{children}</div>
    </div>
  );
};

export interface TkpFormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  isDark?: boolean;
}

export const TkpFormField: React.FC<TkpFormFieldProps> = ({
  label,
  required,
  hint,
  error,
  children,
  className = '',
  isDark = false,
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          className={`block text-[11px] sm:text-xs font-semibold ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {hint && (
          <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {hint}
          </span>
        )}
      </div>
      {children}
      {error && <p className="text-[10px] text-rose-500 font-medium">{error}</p>}
    </div>
  );
};

export interface TkpTextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  isDark?: boolean;
  isMono?: boolean;
}

export const TkpTextInput: React.FC<TkpTextInputProps> = ({
  icon: Icon,
  isDark = false,
  isMono = false,
  className = '',
  ...props
}) => {
  return (
    <div className="relative w-full">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Icon className="w-3.5 h-3.5" />
        </div>
      )}
      <input
        {...props}
        className={`w-full border rounded-xl px-3 py-1.5 sm:py-2 text-xs transition-all outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${
          Icon ? 'pl-8' : ''
        } ${isMono ? 'font-mono' : ''} ${
          isDark
            ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:bg-slate-900'
            : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-2xs focus:bg-white'
        } ${className}`}
      />
    </div>
  );
};

export interface TkpSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: LucideIcon;
  isDark?: boolean;
}

export const TkpSelect: React.FC<TkpSelectProps> = ({
  icon: Icon,
  isDark = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <div className="relative w-full">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Icon className="w-3.5 h-3.5" />
        </div>
      )}
      <select
        {...props}
        className={`w-full border rounded-xl px-3 py-1.5 sm:py-2 text-xs transition-all outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 cursor-pointer ${
          Icon ? 'pl-8' : ''
        } ${
          isDark
            ? 'bg-slate-950 border-slate-800 text-slate-200 focus:bg-slate-900'
            : 'bg-white border-slate-300 text-slate-900 shadow-2xs focus:bg-white'
        } ${className}`}
      >
        {children}
      </select>
    </div>
  );
};

export interface TkpTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  isDark?: boolean;
  isMono?: boolean;
}

export const TkpTextarea: React.FC<TkpTextareaProps> = ({
  isDark = false,
  isMono = false,
  className = '',
  ...props
}) => {
  return (
    <textarea
      {...props}
      className={`w-full border rounded-xl p-2.5 sm:p-3 text-xs transition-all outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 leading-relaxed ${
        isMono ? 'font-mono' : ''
      } ${
        isDark
          ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:bg-slate-900'
          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-2xs focus:bg-white'
      } ${className}`}
    />
  );
};

export interface TkpButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  isDark?: boolean;
}

export const TkpButton: React.FC<TkpButtonProps> = ({
  variant = 'secondary',
  size = 'sm',
  icon: Icon,
  isDark = false,
  children,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    xs: 'px-2 py-1 text-[11px] rounded-lg gap-1',
    sm: 'px-2.5 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-3.5 py-2 text-xs font-bold rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-sm font-bold rounded-xl gap-2',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 font-bold',
    accent:
      'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/20 font-bold',
    danger:
      'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900',
    outline: isDark
      ? 'border border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700'
      : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 shadow-2xs',
    secondary: isDark
      ? 'border border-slate-700/80 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white'
      : 'border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 shadow-2xs',
    ghost: isDark
      ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
  };

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {children}
    </button>
  );
};
