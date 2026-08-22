import React, { useState } from 'react';
import { 
  TrendingDown, 
  Tag, 
  BarChart3, 
  PieChart, 
  Zap, 
  Award,
  ArrowDownRight,
  GraduationCap
} from 'lucide-react';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import PriceComparisonChart from '../components/charts/PriceComparisonChart';
import { formatCurrency, formatPercent } from '../utils/formatters';

export default function AnalyticsPage({ products = [] }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Compute analytics
  const validProducts = products.filter((p) => p.currentPrice !== null);

  const prices = validProducts.map((p) => parseFloat(p.currentPrice));
  const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

  // Cheapest product
  const cheapest = [...validProducts].sort((a, b) => parseFloat(a.currentPrice) - parseFloat(b.currentPrice))[0];

  // Largest price drop
  const biggestDrop = [...validProducts]
    .filter((p) => p.priceChange && p.priceChange < 0)
    .sort((a, b) => parseFloat(a.priceChange) - parseFloat(b.priceChange))[0];

  // Most volatile (highest difference between highestPrice and lowestPrice)
  const mostVolatile = [...validProducts].sort((a, b) => {
    const spreadA = (parseFloat(a.highestPrice) || 0) - (parseFloat(a.lowestPrice) || 0);
    const spreadB = (parseFloat(b.highestPrice) || 0) - (parseFloat(b.lowestPrice) || 0);
    return spreadB - spreadA;
  })[0];

  // Education store average savings
  const retailProducts = validProducts.filter((p) => !p.store.toLowerCase().includes('edu'));
  const eduProducts = validProducts.filter((p) => p.store.toLowerCase().includes('edu'));
  const avgRetail = retailProducts.length ? retailProducts.reduce((s, p) => s + parseFloat(p.currentPrice), 0) / retailProducts.length : 0;
  const avgEdu = eduProducts.length ? eduProducts.reduce((s, p) => s + parseFloat(p.currentPrice), 0) / eduProducts.length : 0;
  const avgEduSavings = avgRetail && avgEdu ? avgRetail - avgEdu : 10000;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-text-primary tracking-tight">
          Price Intelligence Analytics
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Market trends, store pricing divergence, and volatility metrics for MacBook Air M5
        </p>
      </div>

      {/* Top 4 Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Average Air Price"
          value={formatCurrency(avgPrice)}
          subtitle="Across all tracked configurations"
          icon={BarChart3}
          variant="cyan"
        />

        <StatCard
          title="Edu Store Savings"
          value={formatCurrency(avgEduSavings)}
          subtitle="Avg student discount benefit"
          icon={GraduationCap}
          variant="emerald"
        />

        <StatCard
          title="Cheapest Configuration"
          value={cheapest ? formatCurrency(cheapest.currentPrice) : '—'}
          subtitle={cheapest?.name.slice(0, 24) + '...'}
          icon={Tag}
          variant="purple"
        />

        <StatCard
          title="Top Discount Found"
          value={biggestDrop ? `-${formatCurrency(Math.abs(biggestDrop.priceChange))}` : '—'}
          subtitle={biggestDrop ? `${formatPercent(biggestDrop.priceChangePercent)} drop` : 'No active drop'}
          icon={Award}
          variant="amber"
        />
      </div>

      {/* Main Comparative Bar Chart */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
              Hardware Tier & Store Comparison
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Current price vs All-time low vs Target threshold across all monitored models
            </p>
          </div>
        </div>

        <PriceComparisonChart products={validProducts} height={380} />
      </Card>

      {/* Leaderboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Largest Discounts */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-surface-border">
            <TrendingDown className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
              Best Current Discounts
            </h3>
          </div>

          <div className="space-y-3">
            {validProducts
              .filter((p) => p.priceChange && p.priceChange < 0)
              .map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-subtle border border-surface-border text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-text-primary max-w-[200px] sm:max-w-xs truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-text-muted">{item.store}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-emerald-400 font-mono">
                      -{formatCurrency(Math.abs(item.priceChange))}
                    </span>
                    <span className="block text-[10px] text-emerald-500 font-bold">
                      {formatPercent(item.priceChangePercent)}
                    </span>
                  </div>
                </div>
              ))}

            {!validProducts.some((p) => p.priceChange && p.priceChange < 0) && (
              <p className="text-xs text-text-muted text-center py-6">
                No active price drops currently recorded.
              </p>
            )}
          </div>
        </Card>

        {/* Most Volatile Models */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-surface-border">
            <Zap className="w-5 h-5 text-brand-purple" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
              Price Range Spreads
            </h3>
          </div>

          <div className="space-y-3">
            {validProducts.slice(0, 4).map((item) => {
              const high = parseFloat(item.highestPrice) || parseFloat(item.currentPrice);
              const low = parseFloat(item.lowestPrice) || parseFloat(item.currentPrice);
              const spread = high - low;

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-surface-subtle border border-surface-border space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary truncate max-w-xs">{item.name}</span>
                    <span className="font-mono text-brand-purple font-bold">Spread: {formatCurrency(spread)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-text-muted">
                    <span>Low: {formatCurrency(low)}</span>
                    <span>High: {formatCurrency(high)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
