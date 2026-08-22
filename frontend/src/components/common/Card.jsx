import React from 'react';

export default function Card({
  children,
  className = '',
  hover = false,
  glass = true,
  glow = false,
  ...props
}) {
  const baseStyles = 'rounded-2xl border p-6 transition-all duration-300 relative overflow-hidden';
  const glassStyles = glass
    ? 'bg-surface/80 backdrop-blur-xl border-surface-border/60 shadow-glass'
    : 'bg-surface border-surface-border';
  const hoverStyles = hover ? 'glass-card-hover hover:border-cyan-500/30' : '';
  const glowStyles = glow ? 'before:absolute before:inset-0 before:bg-gradient-to-br before:from-cyan-500/5 before:to-purple-500/5 before:pointer-events-none' : '';

  return (
    <div className={`${baseStyles} ${glassStyles} ${hoverStyles} ${glowStyles} ${className}`} {...props}>
      {children}
    </div>
  );
}
