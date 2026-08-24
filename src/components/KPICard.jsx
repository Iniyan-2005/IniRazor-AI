import React from 'react';

const KPICard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) => {
  const colorClasses = {
    blue: 'border-blue-500 text-blue-600 bg-blue-50',
    green: 'border-green-500 text-green-600 bg-green-50',
    amber: 'border-amber-500 text-amber-600 bg-amber-50',
    red: 'border-red-500 text-red-600 bg-red-50',
    purple: 'border-purple-500 text-purple-600 bg-purple-50',
    slate: 'border-slate-500 text-slate-600 bg-slate-50',
  };

  const selectedColor = colorClasses[color] || colorClasses.blue;
  const [borderColor, textColor, bgColor] = selectedColor.split(' ');

  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 ${borderColor} p-5 flex items-center justify-between`}>
      <div>
        <h3 className="text-sm font-medium text-slate-500 mb-1">{title}</h3>
        <div className="flex items-end gap-3">
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          {trend !== undefined && (
            <div className={`flex items-center text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {Icon && (
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bgColor} ${textColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

export default KPICard;
