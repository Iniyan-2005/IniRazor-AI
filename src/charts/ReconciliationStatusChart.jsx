import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RECON_STATUS } from '../utils/constants';
import { useTheme } from '../hooks/useTheme.jsx';

const STATUS_COLORS = {
  [RECON_STATUS.MATCHED]:      '#10b981',
  [RECON_STATUS.AI_RESOLVED]:  '#3b82f6',
  [RECON_STATUS.NEEDS_REVIEW]: '#f59e0b',
  [RECON_STATUS.UNRESOLVED]:   '#ef4444',
  Other: '#64748b',
};

const ReconciliationStatusChart = ({ stats }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!stats) return null;

  const data = Object.keys(stats.byStatus)
    .map((key) => ({ name: key, value: stats.byStatus[key] }))
    .filter((d) => d.value > 0);

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
        Reconciliation Status Distribution
      </h3>
      <div style={{ height: '16rem' }}>
        <ResponsiveContainer key={theme} width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name.replace(/_/g, ' ')} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={STATUS_COLORS[entry.name] || STATUS_COLORS.Other}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend
              formatter={(value) => (
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                  {value.replace(/_/g, ' ')}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReconciliationStatusChart;
