import React from 'react';
import Button from './Button';
import { Sparkles, PlusCircle } from 'lucide-react';

export default function EmptyState({
  title = 'No items found',
  description = 'There are currently no items matching your criteria.',
  icon: Icon = Sparkles,
  actionLabel = 'Add New',
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-surface-border/50 bg-surface/40 backdrop-blur-md">
      <div className="p-4 rounded-2xl bg-surface-subtle text-brand-cyan border border-brand-cyan/20 shadow-glow-cyan/20 mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-lg font-bold text-text-primary">{title}</h4>
      <p className="text-sm text-text-secondary max-w-sm mt-1 mb-6">
        {description}
      </p>
      {onAction && (
        <Button
          variant="primary"
          onClick={onAction}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
