import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../hooks/useTheme.jsx';

const ExceptionBreakdownChart = ({ stats }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!stats) return null;

  const data = Object.keys(stats.byCategory)
    .map((key) => ({
      name: key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
      count: stats.byCategory[key],
    }))
    .filter((d) => d.count > 0);

  const gridColor  = isDark ? '#2d3a52' : '#e2e8f0';
  const axisColor  = isDark ? '#4d6280' : '#94a3b8';
  const tooltipStyle = {
    backgroundColor: isDark ? '#1e2536' : '#ffffff',
    border: `1px solid ${isDark ? '#2d3a52' : '#e2e8f0'}`,
    borderRadius: '8px',
    color: isDark ? '#e2e8f0' : '#0f172a',
    fontSize: '13px',
  };

  return (
    <div className="card p-5">
      <h3
        style={{
          fontSize: '0.9375rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '1rem',
        }}
      >
        Exception Breakdown
      </h3>
      <div style={{ height: '16rem' }}>
        <ResponsiveContainer key={theme} width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: axisColor }}
              axisLine={{ stroke: gridColor }}
              tickLine={{ stroke: gridColor }}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={120}
              tick={{ fontSize: 11, fill: axisColor }}
              axisLine={{ stroke: gridColor }}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)' }} />
            <Bar dataKey="count" fill={isDark ? '#60a5fa' : '#3b82f6'} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExceptionBreakdownChart;
