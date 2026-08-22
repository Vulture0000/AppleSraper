import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label, currency = 'INR' }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-surface/95 border border-surface-border p-3 rounded-xl shadow-2xl backdrop-blur-xl text-xs space-y-1">
        <p className="text-text-muted font-medium">{formatDateTime(data.recordedAt)}</p>
        <p className="text-base font-extrabold text-brand-cyan">
          {formatCurrency(data.price, currency)}
        </p>
        {data.diffFromStart !== undefined && (
          <p className={`text-[11px] font-semibold ${data.diffFromStart < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {data.diffFromStart < 0 ? '↓' : '↑'} {formatCurrency(Math.abs(data.diffFromStart), currency)} from baseline
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function PriceTrendChart({
  history = [],
  thresholdPrice = null,
  currency = 'INR',
  activeRange = 'all',
  onRangeChange,
  isLoading = false,
  height = 320,
}) {
  const ranges = ['24h', '7d', '30d', 'all'];

  // Format data for Recharts
  const chartData = history.map((item, idx) => ({
    ...item,
    formattedDate: new Date(item.recordedAt).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
    }),
    diffFromStart: idx > 0 ? item.price - history[0].price : 0,
  }));

  // Calculate dynamic Y min and max
  const prices = history.map((h) => h.price);
  if (thresholdPrice) prices.push(parseFloat(thresholdPrice));
  
  const minPrice = prices.length ? Math.floor(Math.min(...prices) * 0.96) : 0;
  const maxPrice = prices.length ? Math.ceil(Math.max(...prices) * 1.04) : 150000;

  return (
    <div className="space-y-4">
      {/* Time Range Selector Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Price Trend Timeline
          </span>
          {thresholdPrice && (
            <span className="text-[11px] text-brand-cyan bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
              Target: {formatCurrency(thresholdPrice, currency)}
            </span>
          )}
        </div>

        {onRangeChange && (
          <div className="flex items-center bg-surface-subtle p-1 rounded-xl border border-surface-border">
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => onRangeChange(r)}
                className={`text-xs font-bold px-3 py-1 rounded-lg uppercase transition-all duration-200 ${
                  activeRange === r
                    ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 shadow-sm'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-card'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div style={{ width: '100%', height }} className="relative">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-surface-subtle/30 rounded-2xl animate-pulse">
            <span className="text-xs text-text-muted">Loading price data...</span>
          </div>
        ) : chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center bg-surface-subtle/30 rounded-2xl border border-dashed border-surface-border">
            <span className="text-xs text-text-muted">No price history points for selected range</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="targetGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#00F0FF" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#232A3B" opacity={0.5} vertical={false} />

              <XAxis
                dataKey="formattedDate"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#232A3B' }}
              />

              <YAxis
                domain={[minPrice, maxPrice]}
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#232A3B' }}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                width={55}
              />

              <Tooltip content={<CustomTooltip currency={currency} />} />

              {thresholdPrice && (
                <ReferenceLine
                  y={parseFloat(thresholdPrice)}
                  stroke="#10B981"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Target: ₹${(parseFloat(thresholdPrice)/1000).toFixed(0)}k`,
                    fill: '#10B981',
                    fontSize: 10,
                    position: 'insideTopLeft',
                  }}
                />
              )}

              <Area
                type="monotone"
                dataKey="price"
                stroke="#00F0FF"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#priceGradient)"
                activeDot={{ r: 6, fill: '#00F0FF', stroke: '#08090D', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
