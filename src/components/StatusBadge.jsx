import React from 'react';
import { statusLabel } from '../utils/formatters.js';

/**
 * StatusBadge — themed status pill.
 * Uses hardcoded semantic colors that work in both light & dark mode
 * by using semi-transparent backgrounds and bold text.
 */

// Each status gets: bg (with opacity for dark mode adaptability), text, dot
const STATUS_STYLE = {
  MATCHED:                { bg: 'rgba(16,185,129,0.12)',  text: '#059669', dark: { bg: 'rgba(52,211,153,0.2)',  text: '#34d399' }, dot: '#10b981' },
  AI_RESOLVED:            { bg: 'rgba(59,130,246,0.12)',  text: '#2563eb', dark: { bg: 'rgba(96,165,250,0.2)',  text: '#60a5fa' }, dot: '#3b82f6' },
  NEEDS_REVIEW:           { bg: 'rgba(245,158,11,0.12)',  text: '#d97706', dark: { bg: 'rgba(251,191,36,0.2)',  text: '#fbbf24' }, dot: '#f59e0b' },
  UNRESOLVED:             { bg: 'rgba(239,68,68,0.12)',   text: '#dc2626', dark: { bg: 'rgba(248,113,113,0.2)', text: '#f87171' }, dot: '#ef4444' },
  PENDING:                { bg: 'rgba(100,116,139,0.12)', text: '#475569', dark: { bg: 'rgba(148,163,184,0.2)', text: '#94a3b8' }, dot: '#64748b' },
  FEE_DISCREPANCY:        { bg: 'rgba(249,115,22,0.12)',  text: '#ea580c', dark: { bg: 'rgba(251,146,60,0.2)',  text: '#fb923c' }, dot: '#f97316' },
  TAX_DISCREPANCY:        { bg: 'rgba(249,115,22,0.12)',  text: '#ea580c', dark: { bg: 'rgba(251,146,60,0.2)',  text: '#fb923c' }, dot: '#f97316' },
  REFUND_DISCREPANCY:     { bg: 'rgba(139,92,246,0.12)',  text: '#7c3aed', dark: { bg: 'rgba(167,139,250,0.2)', text: '#a78bfa' }, dot: '#8b5cf6' },
  ADJUSTMENT_DISCREPANCY: { bg: 'rgba(99,102,241,0.12)',  text: '#4f46e5', dark: { bg: 'rgba(129,140,248,0.2)', text: '#818cf8' }, dot: '#6366f1' },
  MISSING_SETTLEMENT:     { bg: 'rgba(239,68,68,0.12)',   text: '#dc2626', dark: { bg: 'rgba(248,113,113,0.2)', text: '#f87171' }, dot: '#ef4444' },
  DUPLICATE:              { bg: 'rgba(234,179,8,0.12)',   text: '#a16207', dark: { bg: 'rgba(250,204,21,0.2)',  text: '#facc15' }, dot: '#eab308' },
  AMOUNT_MISMATCH:        { bg: 'rgba(225,29,72,0.12)',   text: '#be123c', dark: { bg: 'rgba(251,113,133,0.2)', text: '#fb7185' }, dot: '#f43f5e' },
  UNEXPLAINED_DISCREPANCY:{ bg: 'rgba(239,68,68,0.12)',   text: '#dc2626', dark: { bg: 'rgba(248,113,113,0.2)', text: '#f87171' }, dot: '#ef4444' },
  INVALID:                { bg: 'rgba(100,116,139,0.12)', text: '#475569', dark: { bg: 'rgba(148,163,184,0.2)', text: '#94a3b8' }, dot: '#64748b' },
  AI_UNAVAILABLE:         { bg: 'rgba(100,116,139,0.12)', text: '#475569', dark: { bg: 'rgba(148,163,184,0.2)', text: '#94a3b8' }, dot: '#64748b' },
};

const StatusBadge = ({ status, size = 'md' }) => {
  const isDark =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark');

  const styles = STATUS_STYLE[status] ?? STATUS_STYLE.PENDING;
  const theme = isDark ? styles.dark : styles;

  const sizeMap = {
    sm: { padding: '0.25rem 0.5rem', fontSize: '0.6875rem', gap: '0.25rem', dotSize: '0.375rem' },
    md: { padding: '0.25rem 0.625rem', fontSize: '0.75rem', gap: '0.375rem', dotSize: '0.5rem' },
  };
  const sz = sizeMap[size] ?? sizeMap.md;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: sz.gap,
        padding: sz.padding,
        borderRadius: '9999px',
        fontSize: sz.fontSize,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        backgroundColor: theme.bg,
        color: theme.text,
        transition: 'background-color 200ms ease, color 200ms ease',
      }}
    >
      <span
        style={{
          width: sz.dotSize,
          height: sz.dotSize,
          borderRadius: '9999px',
          flexShrink: 0,
          backgroundColor: styles.dot,
        }}
      />
      {statusLabel(status)}
    </span>
  );
};

export default StatusBadge;
