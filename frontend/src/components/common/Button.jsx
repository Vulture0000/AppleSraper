import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 focus:ring-cyan-400 border border-cyan-400/30',
    secondary: 'bg-surface-subtle hover:bg-surface-hover text-text-primary border border-surface-border hover:border-surface-border/80 shadow-md focus:ring-surface-border',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle/60 focus:ring-surface-border',
    danger: 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 focus:ring-rose-500',
    emerald: 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 focus:ring-emerald-400 shadow-lg shadow-emerald-500/10',
    glow: 'bg-surface-card hover:bg-surface-hover text-brand-cyan border border-brand-cyan/40 shadow-glow-cyan focus:ring-brand-cyan',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
