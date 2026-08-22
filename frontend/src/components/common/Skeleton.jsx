import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-surface-subtle/80 rounded-xl ${className}`}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface/80 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
      <div className="pt-4 border-t border-surface-border/40 space-y-3">
        <div className="flex justify-between items-baseline">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
