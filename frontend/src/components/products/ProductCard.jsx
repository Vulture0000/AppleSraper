import React from 'react';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Minus, 
  Clock, 
  Target, 
  TrendingDown, 
  ExternalLink,
  ChevronRight,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Sparkline from '../charts/Sparkline';
import { formatCurrency, formatPercent, timeAgo, extractSpecs } from '../../utils/formatters';

export default function ProductCard({
  product,
  onSelect,
  onOpenThreshold,
}) {
  const isEdu = product.store.toLowerCase().includes('edu');
  const priceDiff = product.priceChange;
  const pricePercent = product.priceChangePercent;
  const hasDropped = priceDiff && priceDiff < 0;
  const hasIncreased = priceDiff && priceDiff > 0;
  const isBelowTarget = product.thresholdReached;
  
  const specs = extractSpecs(product.name, product.url);

  // Target progress calculation
  let targetProgress = null;
  if (product.thresholdPrice && product.currentPrice) {
    const current = parseFloat(product.currentPrice);
    const target = parseFloat(product.thresholdPrice);
    if (current <= target) {
      targetProgress = 100;
    } else {
      const highest = product.highestPrice ? parseFloat(product.highestPrice) : current * 1.1;
      const totalRange = highest - target;
      const currentDistance = highest - current;
      targetProgress = Math.max(10, Math.min(95, Math.round((currentDistance / totalRange) * 100)));
    }
  }

  return (
    <Card
      hover
      className="flex flex-col justify-between group cursor-pointer border-surface-border/80 hover:border-brand-cyan/40"
      onClick={() => onSelect(product.id)}
    >
      {/* Top badges & Store */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge
            variant={isEdu ? 'edu' : 'cyan'}
            size="sm"
            dot
          >
            {isEdu ? 'Edu Store' : 'Retail Store'}
          </Badge>

          <div className="flex items-center gap-1 text-[11px] text-text-muted">
            <Clock className="w-3 h-3 text-text-dim" />
            <span>{timeAgo(product.lastCheckedAt)}</span>
          </div>
        </div>

        {/* Product Image & Specs Header */}
        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-14 h-14 rounded-xl bg-surface-subtle border border-surface-border flex items-center justify-center p-1.5 shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <span className="text-xl">💻</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-text-primary line-clamp-2 leading-snug group-hover:text-brand-cyan transition-colors">
              {product.name}
            </h4>
            
            {/* Chip specs tags */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface-card text-text-secondary border border-surface-border">
                {specs.chip}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface-card text-text-secondary border border-surface-border">
                {specs.memory}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface-card text-text-secondary border border-surface-border">
                {specs.storage}
              </span>
            </div>
          </div>
        </div>

        {/* Current Price & Trend Badge */}
        <div className="pt-3 border-t border-surface-border/40 mb-3">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Current Price
              </p>
              <div className="text-2xl font-black text-text-primary tracking-tight font-mono">
                {formatCurrency(product.currentPrice, product.currency)}
              </div>
            </div>

            {/* Price change badge */}
            <div>
              {hasDropped ? (
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>{formatCurrency(Math.abs(priceDiff), product.currency)} ({formatPercent(pricePercent)})</span>
                </div>
              ) : hasIncreased ? (
                <div className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+{formatCurrency(priceDiff, product.currency)} ({formatPercent(pricePercent)})</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs font-semibold text-text-dim bg-surface-subtle px-2.5 py-1 rounded-full border border-surface-border">
                  <Minus className="w-3 h-3" />
                  <span>No Change</span>
                </div>
              )}
            </div>
          </div>

          {/* Sparkline Graph Preview */}
          <div className="mt-3 pt-1">
            <Sparkline data={product.sparkline} isDrop={hasDropped} />
          </div>
        </div>

        {/* Target & Low Stats Bar */}
        <div className="space-y-2 py-2 px-3 rounded-xl bg-surface-subtle/50 border border-surface-border/60 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-text-secondary">
              <Target className="w-3.5 h-3.5 text-brand-purple" />
              Target:
            </span>
            <span className="font-bold text-text-primary font-mono">
              {formatCurrency(product.thresholdPrice, product.currency)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-text-secondary">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              Lowest:
            </span>
            <span className="font-bold text-emerald-400 font-mono">
              {formatCurrency(product.lowestPrice, product.currency)}
            </span>
          </div>

          {/* Threshold Reached Alert Pill */}
          {isBelowTarget && (
            <div className="mt-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Target Price Reached!
            </div>
          )}
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="mt-4 pt-3 border-t border-surface-border/50 flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenThreshold(product);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary bg-surface-subtle hover:bg-surface-hover border border-surface-border transition-colors"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Set Target</span>
        </button>

        <button
          type="button"
          onClick={() => onSelect(product.id)}
          className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-bold text-brand-cyan bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/30 transition-colors"
        >
          <span>Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>
  );
}
