import React from 'react';

const ConfidenceMeter = ({ confidence, size = 'md' }) => {
  const percentage = Math.round(confidence * 100);

  // Semantic color — works on both light/dark via rgba
  let barColor, textColor;
  if (confidence >= 0.9) {
    barColor = 'var(--success)';
    textColor = 'var(--success)';
  } else if (confidence >= 0.7) {
    barColor = 'var(--warning)';
    textColor = 'var(--warning)';
  } else {
    barColor = 'var(--danger)';
    textColor = 'var(--danger)';
  }

  const heights = { sm: '0.375rem', md: '0.5rem', lg: '0.75rem' };
  const fontSizes = { sm: '0.6875rem', md: '0.75rem', lg: '0.875rem' };

  return (
    <div className="flex items-center gap-2">
      <div
        style={{
          flex: 1,
          height: heights[size],
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
      <span
        style={{
          fontSize: fontSizes[size],
          fontWeight: 600,
          color: textColor,
          fontVariantNumeric: 'tabular-nums',
          flexShrink: 0,
        }}
      >
        {percentage}%
      </span>
    </div>
  );
};

export default ConfidenceMeter;
