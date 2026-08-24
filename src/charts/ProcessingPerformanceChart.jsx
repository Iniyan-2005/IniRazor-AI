import React from 'react';
import { formatDuration } from '../utils/formatters';

const ProcessingPerformanceChart = ({ stats }) => {
  if (!stats) return null;

  const timeSeconds = (stats.processingTime || 0) / 1000;
  const recordsPerSec = timeSeconds > 0 ? (stats.total / timeSeconds).toFixed(1) : 0;
  const aiInvestigations = stats.aiResolved + stats.needsReview + stats.unresolved;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Processing Performance</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="text-sm text-slate-500 font-medium">Records Processed</p>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="text-sm text-slate-500 font-medium">Processing Time</p>
          <p className="text-2xl font-bold text-slate-800">{formatDuration(stats.processingTime)}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="text-sm text-slate-500 font-medium">Records/Second</p>
          <p className="text-2xl font-bold text-slate-800">{recordsPerSec}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="text-sm text-slate-500 font-medium">Deterministic Matches</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.matched}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="text-sm text-slate-500 font-medium">AI Investigations</p>
          <p className="text-2xl font-bold text-indigo-600">{aiInvestigations}</p>
        </div>
      </div>
    </div>
  );
};

export default ProcessingPerformanceChart;
