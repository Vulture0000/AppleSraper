import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Sparkline({
  data = [],
  isDrop = true,
  height = 36,
  width = '100%',
}) {
  if (!data || data.length < 2) {
    return (
      <div className="h-9 flex items-center justify-center text-[10px] text-text-dim border border-dashed border-surface-border/40 rounded-lg">
        Trend building...
      </div>
    );
  }

  const strokeColor = isDrop ? '#10B981' : '#00F0FF';

  return (
    <div style={{ height, width }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={1.8}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
