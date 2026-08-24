import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RECON_STATUS } from '../utils/constants';

const COLORS = {
  [RECON_STATUS.MATCHED || 'MATCHED']: '#10b981',
  [RECON_STATUS.AI_RESOLVED || 'AI_RESOLVED']: '#3b82f6',
  [RECON_STATUS.NEEDS_REVIEW || 'NEEDS_REVIEW']: '#f59e0b',
  [RECON_STATUS.UNRESOLVED || 'UNRESOLVED']: '#ef4444',
  Other: '#94a3b8'
};

const ReconciliationStatusChart = ({ stats }) => {
  if (!stats) return null;
  
  const data = Object.keys(stats.byStatus).map(key => ({
    name: key,
    value: stats.byStatus[key]
  })).filter(d => d.value > 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Reconciliation Status Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.Other} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReconciliationStatusChart;
