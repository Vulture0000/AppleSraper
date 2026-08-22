import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-medium tracking-wide',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  };

  const variantStyles = {
    default: 'bg-surface-subtle text-text-secondary border border-surface-border',
    cyan: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
    edu: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30',
  };

  const dotColors = {
    default: 'bg-slate-400',
    cyan: 'bg-cyan-400 shadow-[0_0_8px_#00F0FF]',
    emerald: 'bg-emerald-400 shadow-[0_0_8px_#10B981]',
    rose: 'bg-rose-400 shadow-[0_0_8px_#F43F5E]',
    amber: 'bg-amber-400 shadow-[0_0_8px_#F59E0B]',
    purple: 'bg-purple-400 shadow-[0_0_8px_#A855F7]',
    edu: 'bg-indigo-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full uppercase select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || 'bg-current'} animate-pulse`} />
      )}
      {children}
    </span>
  );
}
