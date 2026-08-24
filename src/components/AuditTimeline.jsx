import React, { useState } from 'react';
import { formatDateTime } from '../utils/formatters.js';
import { EVENT_TYPES, ACTORS } from '../utils/constants.js';
import { ChevronDown, ChevronUp, Bot, User, Monitor } from 'lucide-react';

const AuditTimeline = ({ events = [] }) => {
  const [expandedId, setExpandedId] = useState(null);

  const getEventColor = (eventType) => {
    switch (eventType) {
      case EVENT_TYPES.DETERMINISTIC_MATCH: return 'bg-emerald-500';
      case EVENT_TYPES.AI_INVESTIGATION: return 'bg-purple-500';
      case EVENT_TYPES.AI_RESOLUTION: return 'bg-blue-500';
      case EVENT_TYPES.AI_FAILURE: return 'bg-red-500';
      case EVENT_TYPES.EXCEPTION_DETECTED: return 'bg-amber-500';
      case EVENT_TYPES.HUMAN_APPROVED: return 'bg-green-600';
      case EVENT_TYPES.HUMAN_REJECTED: return 'bg-red-600';
      case EVENT_TYPES.HUMAN_UNRESOLVED: return 'bg-orange-500';
      case EVENT_TYPES.BATCH_STARTED: return 'bg-blue-400';
      case EVENT_TYPES.BATCH_COMPLETED: return 'bg-blue-600';
      case EVENT_TYPES.DATA_GENERATED: return 'bg-slate-500';
      default: return 'bg-slate-400';
    }
  };

  const getActorIcon = (actor) => {
    switch (actor) {
      case ACTORS.AI_AGENT: return <Bot className="w-3.5 h-3.5" />;
      case ACTORS.HUMAN: return <User className="w-3.5 h-3.5" />;
      default: return <Monitor className="w-3.5 h-3.5" />;
    }
  };

  const getActorLabel = (actor) => {
    switch (actor) {
      case ACTORS.AI_AGENT: return 'AI Agent';
      case ACTORS.HUMAN: return 'Human';
      case ACTORS.SYSTEM: return 'System';
      default: return actor || 'Unknown';
    }
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p className="text-sm">No audit events recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-slate-200 ml-3 space-y-4 pb-4">
      {events.map((event, index) => {
        const isExpanded = expandedId === (event.id || index);
        const color = getEventColor(event.event_type);
        
        return (
          <div key={event.id || index} className="relative pl-6">
            <span className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white ${color}`}></span>
            
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
              <div 
                className="flex justify-between items-start cursor-pointer" 
                onClick={() => setExpandedId(isExpanded ? null : (event.id || index))}
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {event.action || event.event_type?.replace(/_/g, ' ')}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500">
                      {formatDateTime(event.created_at)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      {getActorIcon(event.actor)} {getActorLabel(event.actor)}
                    </span>
                    {event.confidence != null && event.confidence > 0 && (
                      <span className="text-xs text-slate-500">
                        Confidence: {(event.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600 ml-2">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
              
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                  {event.reasoning && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Reasoning</p>
                      <p className="text-sm text-slate-700">{event.reasoning}</p>
                    </div>
                  )}
                  {event.decision && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Decision</p>
                      <p className="text-sm text-slate-700">{event.decision}</p>
                    </div>
                  )}
                  {event.reconciliation_id && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Reconciliation ID</p>
                      <p className="text-xs font-mono text-slate-600">{event.reconciliation_id}</p>
                    </div>
                  )}
                  {event.input_snapshot && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Input Snapshot</p>
                      <pre className="text-xs bg-slate-50 p-2 rounded border border-slate-200 overflow-x-auto text-slate-700">
                        {JSON.stringify(event.input_snapshot, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AuditTimeline;
