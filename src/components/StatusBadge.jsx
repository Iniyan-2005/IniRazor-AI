import React from 'react';
import { STATUS_COLORS } from '../utils/constants.js';
import { statusLabel } from '../utils/formatters.js';

const StatusBadge = ({ status, size = 'md' }) => {
  const colors = STATUS_COLORS[status] || { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500' };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  };
  
  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full ${colors.bg} ${colors.text} ${sizeClasses[size]}`}>
      <span className={`rounded-full ${colors.dot} ${dotSizes[size]}`}></span>
      {statusLabel(status)}
    </span>
  );
};

export default StatusBadge;
