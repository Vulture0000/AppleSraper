import React from 'react';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Minus, 
  Sliders, 
  ChevronRight, 
  CheckCircle2, 
  ExternalLink,
  Trash2
} from 'lucide-react';
import Badge from '../common/Badge';
import { formatCurrency, formatPercent, timeAgo, extractSpecs } from '../../utils/formatters';

export default function ProductTable({
  products = [],
  onSelect,
  onOpenThreshold,
  onDelete,
}) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-surface-border bg-surface/80 backdrop-blur-xl">
      <table className="w-full text-left text-xs">
        <thead className="bg-surface-subtle/80 text-text-muted uppercase tracking-wider border-b border-surface-border font-semibold">
          <tr>
            <th className="py-3.5 px-4">Product / Specs</th>
            <th className="py-3.5 px-4">Store</th>
            <th className="py-3.5 px-4">Current Price</th>
            <th className="py-3.5 px-4">Change</th>
            <th className="py-3.5 px-4">Target Price</th>
            <th className="py-3.5 px-4">All-Time Low</th>
            <th className="py-3.5 px-4">Last Sync</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-surface-border/40 font-medium">
          {products.map((product) => {
            const isEdu = product.store.toLowerCase().includes('edu');
            const diff = product.priceChange;
            const percent = product.priceChangePercent;
            const hasDropped = diff && diff < 0;
            const hasIncreased = diff && diff > 0;
            const specs = extractSpecs(product.name, product.url);

            return (
              <tr
                key={product.id}
                onClick={() => onSelect(product.id)}
                className="hover:bg-surface-hover/60 cursor-pointer transition-colors group"
              >
                {/* Product Name & Specs */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-subtle border border-surface-border flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt=""
                          className="w-full h-full object-contain"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span>💻</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-text-primary group-hover:text-brand-cyan transition-colors max-w-xs truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-text-muted mt-0.5">
                        <span>{specs.chip}</span>
                        <span>•</span>
                        <span>{specs.memory} / {specs.storage}</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Store */}
                <td className="py-3.5 px-4">
                  <Badge variant={isEdu ? 'edu' : 'cyan'} size="sm">
                    {isEdu ? 'Edu Store' : 'Retail'}
                  </Badge>
                </td>

                {/* Current Price */}
                <td className="py-3.5 px-4 font-mono font-bold text-text-primary text-sm">
                  {formatCurrency(product.currentPrice, product.currency)}
                </td>

                {/* Change */}
                <td className="py-3.5 px-4">
                  {hasDropped ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <ArrowDownRight className="w-3 h-3" />
                      {formatCurrency(Math.abs(diff), product.currency)} ({formatPercent(percent)})
                    </span>
                  ) : hasIncreased ? (
                    <span className="inline-flex items-center gap-1 text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      <ArrowUpRight className="w-3 h-3" />
                      +{formatCurrency(diff, product.currency)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-text-dim">
                      <Minus className="w-3 h-3" />
                      0%
                    </span>
                  )}
                </td>

                {/* Target Price */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-text-secondary">
                      {formatCurrency(product.thresholdPrice, product.currency)}
                    </span>
                    {product.thresholdReached && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" title="Target reached!" />
                    )}
                  </div>
                </td>

                {/* All-time Low */}
                <td className="py-3.5 px-4 font-mono text-emerald-400 font-semibold">
                  {formatCurrency(product.lowestPrice, product.currency)}
                </td>

                {/* Last Sync */}
                <td className="py-3.5 px-4 text-text-muted">
                  {timeAgo(product.lastCheckedAt)}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onOpenThreshold(product)}
                      className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-subtle transition-colors"
                      title="Set Price Target"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-text-muted hover:text-brand-cyan rounded-lg hover:bg-surface-subtle transition-colors"
                      title="View on Apple Store"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {onDelete && (
                      <button
                        onClick={() => onDelete(product.id)}
                        className="p-1.5 text-text-muted hover:text-rose-400 rounded-lg hover:bg-surface-subtle transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
