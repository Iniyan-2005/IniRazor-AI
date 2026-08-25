import React from 'react';
import { formatDuration } from '../utils/formatters';

const StatBlock = ({ label, value, color }) => (
  <div
    style={{
      backgroundColor: 'var(--bg-surface-2)',
      padding: '1rem',
      borderRadius: '0.625rem',
      border: '1px solid var(--border-subtle)',
    }}
  >
    <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
      {label}
    </p>
    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: color || 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
      {value}
    </p>
  </div>
);

const ProcessingPerformanceChart = ({ stats }) => {
  if (!stats) return null;

  const timeSeconds = (stats.processingTime || 0) / 1000;
  const recordsPerSec = timeSeconds > 0 ? (stats.total / timeSeconds).toFixed(1) : '—';
  const aiInvestigations = (stats.aiResolved || 0) + (stats.needsReview || 0) + (stats.unresolved || 0);

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
        Processing Performance
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatBlock label="Records Processed"     value={stats.total || 0} />
        <StatBlock label="Processing Time"       value={formatDuration(stats.processingTime)} />
        <StatBlock label="Throughput"            value={`${recordsPerSec}/s`} />
        <StatBlock label="Deterministic Matches" value={stats.matched || 0} color="var(--success)" />
        <StatBlock label="AI Investigations"     value={aiInvestigations}   color="var(--ai)" />
      </div>
    </div>
  );
};

export default ProcessingPerformanceChart;
