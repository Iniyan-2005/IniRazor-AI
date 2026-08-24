import React from 'react';

const ConfidenceMeter = ({ confidence, size = 'md' }) => {
  const percentage = Math.round(confidence * 100);
  let color = 'bg-red-500';
  if (confidence >= 0.9) color = 'bg-green-500';
  else if (confidence >= 0.7) color = 'bg-amber-500';

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  };

  const textClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-slate-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div 
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`font-medium text-slate-700 ${textClasses[size]}`}>
        {percentage}%
      </span>
    </div>
  );
};

export default ConfidenceMeter;
