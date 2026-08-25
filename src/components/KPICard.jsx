import React from 'react';

/**
 * KPICard — A metric card with a colored icon + value.
 * Uses CSS var-based card surface for automatic dark mode.
 * Left border accent uses semantic color tokens.
 */

// All accent colors are semantic — they use appropriate dark-mode variants
// via the CSS vars defined in index.css
const COLOR_MAP = {
  blue:    { border: '#3b82f6', iconBg: 'rgba(59,130,246,0.12)',  iconColor: '#3b82f6'  },
  green:   { border: '#10b981', iconBg: 'rgba(16,185,129,0.12)', iconColor: '#10b981' },
  emerald: { border: '#10b981', iconBg: 'rgba(16,185,129,0.12)', iconColor: '#10b981' },
  amber:   { border: '#f59e0b', iconBg: 'rgba(245,158,11,0.12)', iconColor: '#f59e0b' },
  red:     { border: '#ef4444', iconBg: 'rgba(239,68,68,0.12)',  iconColor: '#ef4444'  },
  purple:  { border: '#8b5cf6', iconBg: 'rgba(139,92,246,0.12)', iconColor: '#8b5cf6' },
  violet:  { border: '#7c3aed', iconBg: 'rgba(124,58,237,0.12)', iconColor: '#7c3aed' },
  slate:   { border: '#64748b', iconBg: 'rgba(100,116,139,0.12)',iconColor: '#64748b'  },
};

// In dark mode we use brighter variants so they're visible on dark surface
const COLOR_MAP_DARK = {
  blue:    { border: '#60a5fa', iconBg: 'rgba(96,165,250,0.15)',  iconColor: '#93c5fd' },
  green:   { border: '#34d399', iconBg: 'rgba(52,211,153,0.15)',  iconColor: '#6ee7b7' },
  emerald: { border: '#34d399', iconBg: 'rgba(52,211,153,0.15)',  iconColor: '#6ee7b7' },
  amber:   { border: '#fbbf24', iconBg: 'rgba(251,191,36,0.15)',  iconColor: '#fcd34d' },
  red:     { border: '#f87171', iconBg: 'rgba(248,113,113,0.15)', iconColor: '#fca5a5' },
  purple:  { border: '#a78bfa', iconBg: 'rgba(167,139,250,0.15)', iconColor: '#c4b5fd' },
  violet:  { border: '#a78bfa', iconBg: 'rgba(167,139,250,0.15)', iconColor: '#c4b5fd' },
  slate:   { border: '#64748b', iconBg: 'rgba(100,116,139,0.15)', iconColor: '#94a3b8' },
};

const KPICard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) => {
  // Detect dark mode via the html element class (synced by useTheme)
  const isDark =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark');

  const palette = (isDark ? COLOR_MAP_DARK : COLOR_MAP)[color] ?? COLOR_MAP.blue;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: `1px solid var(--border)`,
        borderLeft: `4px solid ${palette.border}`,
        borderRadius: '0.75rem',
        boxShadow: 'var(--shadow-card)',
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        transition: 'box-shadow 200ms ease, background-color 200ms ease, border-color 200ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
      }}
    >
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </p>
        <div className="flex items-end gap-2 mt-1.5">
          <p
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {value}
          </p>
          {trend !== undefined && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                paddingBottom: '0.125rem',
                color: trend >= 0 ? 'var(--success)' : 'var(--danger)',
              }}
            >
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
        {subtitle && (
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginTop: '0.25rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {Icon && (
        <div
          style={{
            width: '2.75rem',
            height: '2.75rem',
            borderRadius: '0.625rem',
            backgroundColor: palette.iconBg,
            color: palette.iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background-color 200ms ease, color 200ms ease',
          }}
        >
          <Icon style={{ width: '1.25rem', height: '1.25rem' }} />
        </div>
      )}
    </div>
  );
};

export default KPICard;
