import React from 'react';
import { getEnvironmentLabel, isSupabaseConfigured } from '../services/supabase.js';
import { FlaskConical, Zap } from 'lucide-react';

const EnvironmentBadge = () => {
  const label = getEnvironmentLabel();
  const isLive = isSupabaseConfigured;

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
      style={
        isLive
          ? {
              backgroundColor: 'var(--primary-subtle)',
              color: 'var(--primary-text)',
              borderColor: 'color-mix(in srgb, var(--primary) 30%, transparent)',
            }
          : {
              backgroundColor: 'var(--warning-subtle)',
              color: 'var(--warning-text)',
              borderColor: 'color-mix(in srgb, var(--warning) 30%, transparent)',
            }
      }
    >
      {isLive ? <Zap className="w-3 h-3" /> : <FlaskConical className="w-3 h-3" />}
      {label}
    </div>
  );
};

export default EnvironmentBadge;
