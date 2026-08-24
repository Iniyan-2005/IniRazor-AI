import React from 'react';
import { getEnvironmentLabel, isSupabaseConfigured } from '../services/supabase.js';
import { FlaskConical, Zap } from 'lucide-react';

const EnvironmentBadge = () => {
  const label = getEnvironmentLabel();
  const isLive = isSupabaseConfigured;
  
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
      isLive 
        ? 'bg-blue-100 text-blue-800 border-blue-200' 
        : 'bg-amber-100 text-amber-800 border-amber-200'
    }`}>
      {isLive ? <Zap className="w-3.5 h-3.5" /> : <FlaskConical className="w-3.5 h-3.5" />}
      {label}
    </div>
  );
};

export default EnvironmentBadge;
