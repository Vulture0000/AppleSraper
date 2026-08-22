import React from 'react';
import Card from './Card';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = null, // { value: -4.8, isPositive: true }
  variant = 'default', // 'cyan', 'emerald', 'purple', 'amber'
  onClick,
}) {
  const borderAccents = {
    default: 'hover:border-surface-border',
    cyan: 'hover:border-brand-cyan/40 before:from-cyan-500/10',
    emerald: 'hover:border-brand-emerald/40 before:from-emerald-500/10',
    purple: 'hover:border-brand-purple/40 before:from-purple-500/10',
    amber: 'hover:border-brand-amber/40 before:from-amber-500/10',
  };

  const iconBg = {
    default: 'bg-surface-subtle text-text-secondary',
    cyan: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-glow-cyan/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-glow-emerald/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  };

  return (
    <Card
      hover={!!onClick}
      onClick={onClick}
      className={`relative group ${onClick ? 'cursor-pointer' : ''} ${borderAccents[variant] || ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-text-secondary tracking-wider uppercase">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-extrabold text-text-primary mt-2 tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-text-muted mt-1 font-medium">{subtitle}</p>
          )}
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-110 ${iconBg[variant] || iconBg.default}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {trend !== null && (
        <div className="mt-4 pt-3 border-t border-surface-border/40 flex items-center gap-2">
          {trend.type === 'down' ? (
            <span className="flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              {trend.label}
            </span>
          ) : trend.type === 'up' ? (
            <span className="flex items-center text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              {trend.label}
            </span>
          ) : (
            <span className="flex items-center text-xs font-semibold text-text-muted bg-surface-subtle px-2 py-0.5 rounded-full border border-surface-border">
              <Minus className="w-3.5 h-3.5 mr-0.5" />
              {trend.label || 'Stable'}
            </span>
          )}
          <span className="text-[11px] text-text-dim">{trend.subtext || 'vs yesterday'}</span>
        </div>
      )}
    </Card>
  );
}
