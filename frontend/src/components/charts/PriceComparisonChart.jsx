import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/95 border border-surface-border p-3 rounded-xl shadow-2xl backdrop-blur-xl text-xs space-y-1.5">
        <p className="font-bold text-text-primary">{label}</p>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-text-secondary">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}:
            </span>
            <span className="font-bold font-mono text-text-primary">
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function PriceComparisonChart({ products = [], height = 340 }) {
  // Format comparative data (Retail vs Edu Store if available)
  const chartData = products.map((p) => {
    const isEdu = p.store.toLowerCase().includes('edu');
    const shortName = p.name.replace('MacBook Air 13"', 'MBA 13"').replace('[Edu Store]', '(Edu)').slice(0, 24);
    
    return {
      name: shortName,
      Current: p.currentPrice ? parseFloat(p.currentPrice) : 0,
      Lowest: p.lowestPrice ? parseFloat(p.lowestPrice) : 0,
      Target: p.thresholdPrice ? parseFloat(p.thresholdPrice) : 0,
      isEdu,
    };
  });

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 10, left: 10, bottom: 40 }}
          barSize={18}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#232A3B" opacity={0.5} vertical={false} />
          
          <XAxis
            dataKey="name"
            stroke="#64748B"
            fontSize={10}
            interval={0}
            angle={-25}
            textAnchor="end"
            tickLine={false}
            axisLine={{ stroke: '#232A3B' }}
          />

          <YAxis
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#232A3B' }}
            tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
            width={55}
          />

          <Tooltip content={<CustomBarTooltip />} />

          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
          />

          <Bar
            dataKey="Current"
            fill="#00F0FF"
            radius={[4, 4, 0, 0]}
            name="Current Price"
          />

          <Bar
            dataKey="Lowest"
            fill="#10B981"
            radius={[4, 4, 0, 0]}
            name="All-Time Low"
          />

          <Bar
            dataKey="Target"
            fill="#8B5CF6"
            radius={[4, 4, 0, 0]}
            name="Configured Target"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
