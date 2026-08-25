import React from 'react';

const ProgressBar = ({ current, total, label, color }) => {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  const barColor = color ?? 'var(--primary)';

  return (
    <div style={{ width: '100%' }}>
      <div className="flex justify-between items-center mb-1.5">
        {label && (
          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {label}
          </span>
        )}
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', marginLeft: '0.5rem', flexShrink: 0 }}>
          {percentage}%
        </span>
      </div>
      <div
        style={{
          width: '100%',
          height: '0.5rem',
          borderRadius: '9999px',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-surface-3)',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            borderRadius: '9999px',
            backgroundColor: barColor,
            transition: 'width 500ms ease-out',
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
