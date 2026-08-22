import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ExternalLink, 
  Target, 
  TrendingDown, 
  TrendingUp, 
  Clock, 
  Sliders, 
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  Minus
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import PriceTrendChart from '../components/charts/PriceTrendChart';
import { Skeleton } from '../components/common/Skeleton';
import { getProductHistory, updateProductThreshold } from '../services/api';
import { formatCurrency, formatPercent, formatDateTime, timeAgo, extractSpecs } from '../utils/formatters';

export default function ProductDetailPage({
  productId,
  onBack,
  onOpenThresholdModal,
}) {
  const [productData, setProductData] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeRange, setActiveRange] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [targetInput, setTargetInput] = useState('');
  const [isUpdatingTarget, setIsUpdatingTarget] = useState(false);
  const [targetSuccessMsg, setTargetSuccessMsg] = useState(false);

  useEffect(() => {
    loadProductHistory(activeRange);
  }, [productId, activeRange]);

  const loadProductHistory = async (range) => {
    setIsLoading(true);
    try {
      const data = await getProductHistory(productId, range);
      setProductData(data.product);
      setHistory(data.history);
      setStats(data.stats);
      if (data.product?.thresholdPrice) {
        setTargetInput(String(data.product.thresholdPrice));
      }
    } catch (err) {
      console.error('Failed to load product history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveInlineTarget = async (e) => {
    e.preventDefault();
    if (!productData) return;
    setIsUpdatingTarget(true);
    try {
      const cleanVal = targetInput ? parseFloat(targetInput.replace(/[^0-9.]/g, '')) : null;
      const updated = await updateProductThreshold(productData.id, cleanVal);
      setProductData(updated);
      setTargetSuccessMsg(true);
      setTimeout(() => setTargetSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Error saving target:', err);
    } finally {
      setIsUpdatingTarget(false);
    }
  };

  if (isLoading && !productData) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-10 w-36" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-text-secondary">Product details could not be loaded.</p>
        <Button variant="secondary" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const isEdu = productData.store.toLowerCase().includes('edu');
  const specs = extractSpecs(productData.name, productData.url);
  const diff = productData.priceChange;
  const percent = productData.priceChangePercent;
  const hasDropped = diff && diff < 0;
  const hasIncreased = diff && diff > 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-brand-cyan transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Tracked Models</span>
        </button>

        <div className="flex items-center gap-3">
          <a
            href={productData.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-subtle hover:bg-surface-hover text-xs font-semibold text-text-primary border border-surface-border transition-colors group"
          >
            <span>View on Apple Store</span>
            <ExternalLink className="w-3.5 h-3.5 text-brand-cyan group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>

      {/* Main Showcase Hero Card */}
      <Card className="p-6 sm:p-8 bg-surface/90 border-surface-border/90">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left 2 Cols: Title, Specs & Price Showcase */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={isEdu ? 'edu' : 'cyan'} dot>
                {isEdu ? 'Apple Education Store' : 'Apple Official Store'}
              </Badge>
              <span className="text-xs text-text-muted flex items-center gap-1">
                <Clock className="w-3 h-3 text-text-dim" />
                Updated {timeAgo(productData.lastCheckedAt)}
              </span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-surface-subtle border border-surface-border flex items-center justify-center p-2 shrink-0 overflow-hidden">
                {productData.imageUrl ? (
                  <img
                    src={productData.imageUrl}
                    alt=""
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span className="text-3xl">💻</span>
                )}
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-text-primary leading-tight">
                  {productData.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface-card text-brand-cyan border border-brand-cyan/20">
                    {specs.chip}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface-card text-text-secondary border border-surface-border">
                    {specs.memory} Memory
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface-card text-text-secondary border border-surface-border">
                    {specs.storage}
                  </span>
                </div>
              </div>
            </div>

            {/* Huge Price Showcase */}
            <div className="pt-6 border-t border-surface-border/50 flex flex-wrap items-baseline gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted block mb-1">
                  Current Live Price
                </span>
                <span className="text-4xl sm:text-5xl font-black font-mono text-gradient-cyan tracking-tight">
                  {formatCurrency(productData.currentPrice, productData.currency)}
                </span>
              </div>

              {hasDropped ? (
                <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-400 bg-emerald-500/15 px-3.5 py-1.5 rounded-full border border-emerald-500/30">
                  <ArrowDownRight className="w-4 h-4" />
                  <span>Dropped {formatCurrency(Math.abs(diff), productData.currency)} ({formatPercent(percent)})</span>
                </div>
              ) : hasIncreased ? (
                <div className="flex items-center gap-1.5 text-sm font-bold text-rose-400 bg-rose-500/15 px-3.5 py-1.5 rounded-full border border-rose-500/30">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Increased +{formatCurrency(diff, productData.currency)}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-text-muted bg-surface-subtle px-3 py-1.5 rounded-full border border-surface-border">
                  <Minus className="w-3.5 h-3.5" />
                  <span>Price Unchanged</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Interactive Target Configuration Box */}
          <div className="p-6 rounded-2xl bg-surface-subtle/80 border border-surface-border/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border/50">
              <span className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-text-secondary">
                <Target className="w-4 h-4 text-brand-purple" />
                Target Price Threshold
              </span>
              {productData.thresholdReached && (
                <Badge variant="emerald" size="sm">Reached</Badge>
              )}
            </div>

            <form onSubmit={handleSaveInlineTarget} className="space-y-3">
              <div>
                <label className="text-[11px] text-text-muted block mb-1">
                  Desired Price Target (₹)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    placeholder="e.g. 95000"
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-surface-card border border-surface-border text-sm font-mono text-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                  />
                  <span className="absolute left-2.5 top-3 text-text-dim font-mono text-xs">₹</span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="w-full"
                isLoading={isUpdatingTarget}
              >
                Save Target
              </Button>

              {targetSuccessMsg && (
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Target updated successfully!</span>
                </div>
              )}
            </form>

            <p className="text-[11px] text-text-muted leading-relaxed">
              Email alert will automatically trigger when price falls to or below this target.
            </p>
          </div>
        </div>
      </Card>

      {/* 4 Quick Stat KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-surface-card/60">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Current</p>
          <p className="text-xl font-bold font-mono text-text-primary mt-1">
            {formatCurrency(productData.currentPrice, productData.currency)}
          </p>
        </Card>

        <Card className="p-4 bg-surface-card/60">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">All-Time Low</p>
          <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {formatCurrency(stats?.lowestPrice || productData.lowestPrice, productData.currency)}
          </p>
        </Card>

        <Card className="p-4 bg-surface-card/60">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">All-Time High</p>
          <p className="text-xl font-bold font-mono text-text-secondary mt-1">
            {formatCurrency(stats?.highestPrice || productData.highestPrice, productData.currency)}
          </p>
        </Card>

        <Card className="p-4 bg-surface-card/60">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Average Price</p>
          <p className="text-xl font-bold font-mono text-brand-cyan mt-1">
            {formatCurrency(stats?.averagePrice || productData.currentPrice, productData.currency)}
          </p>
        </Card>
      </div>

      {/* Historical Price Chart */}
      <Card className="p-6">
        <PriceTrendChart
          history={history}
          thresholdPrice={productData.thresholdPrice}
          currency={productData.currency}
          activeRange={activeRange}
          onRangeChange={setActiveRange}
          isLoading={isLoading}
          height={340}
        />
      </Card>

      {/* Detailed Audit Log Table */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
          Price History Record ({history.length} data points)
        </h3>

        <div className="w-full overflow-x-auto rounded-2xl border border-surface-border bg-surface/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle/80 text-text-muted uppercase tracking-wider border-b border-surface-border font-semibold">
              <tr>
                <th className="py-3 px-4">Recorded Timestamp</th>
                <th className="py-3 px-4">Scraped Price</th>
                <th className="py-3 px-4">Target Comparison</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/40 font-mono font-medium">
              {history.map((item, idx) => {
                const target = productData.thresholdPrice ? parseFloat(productData.thresholdPrice) : null;
                const isBelow = target && item.price <= target;

                return (
                  <tr key={item.id || idx} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="py-3 px-4 text-text-secondary font-sans">
                      {formatDateTime(item.recordedAt)}
                    </td>
                    <td className="py-3 px-4 font-bold text-text-primary text-sm">
                      {formatCurrency(item.price, productData.currency)}
                    </td>
                    <td className="py-3 px-4">
                      {isBelow ? (
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          ✓ Below Target
                        </span>
                      ) : (
                        <span className="text-text-dim">
                          Above Target
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
