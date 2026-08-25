import React, { useState } from 'react';
import { formatDateTime } from '../utils/formatters.js';
import { EVENT_TYPES, ACTORS } from '../utils/constants.js';
import { ChevronDown, ChevronUp, Bot, User, Monitor } from 'lucide-react';

const AuditTimeline = ({ events = [] }) => {
  const [expandedId, setExpandedId] = useState(null);

  const getEventColor = (eventType) => {
    switch (eventType) {
      case EVENT_TYPES.DETERMINISTIC_MATCH: return 'var(--success)';
      case EVENT_TYPES.AI_INVESTIGATION:    return 'var(--ai)';
      case EVENT_TYPES.AI_RESOLUTION:       return 'var(--primary)';
      case EVENT_TYPES.AI_FAILURE:          return 'var(--danger)';
      case EVENT_TYPES.EXCEPTION_DETECTED:  return 'var(--warning)';
      case EVENT_TYPES.HUMAN_APPROVED:      return 'var(--success)';
      case EVENT_TYPES.HUMAN_REJECTED:      return 'var(--danger)';
      case EVENT_TYPES.HUMAN_UNRESOLVED:    return 'var(--warning)';
      case EVENT_TYPES.BATCH_STARTED:       return 'var(--primary)';
      case EVENT_TYPES.BATCH_COMPLETED:     return 'var(--primary)';
      case EVENT_TYPES.DATA_GENERATED:      return 'var(--text-muted)';
      default: return 'var(--text-muted)';
    }
  };

  const getActorIcon = (actor) => {
    switch (actor) {
      case ACTORS.AI_AGENT: return <Bot className="w-3.5 h-3.5" />;
      case ACTORS.HUMAN:    return <User className="w-3.5 h-3.5" />;
      default:              return <Monitor className="w-3.5 h-3.5" />;
    }
  };

  const getActorLabel = (actor) => {
    switch (actor) {
      case ACTORS.AI_AGENT: return 'AI Agent';
      case ACTORS.HUMAN:    return 'Human';
      case ACTORS.SYSTEM:   return 'System';
      default: return actor || 'Unknown';
    }
  };

  if (events.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        No audit events recorded yet.
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', paddingLeft: '1.25rem', borderLeft: '2px solid var(--border)' }}>
      {events.map((event, index) => {
        const isExpanded = expandedId === (event.id || index);
        const dotColor = getEventColor(event.event_type);

        return (
          <div key={event.id || index} style={{ position: 'relative', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            {/* Timeline dot */}
            <span
              style={{
                position: 'absolute',
                left: '-0.5625rem',
                top: '0.4rem',
                width: '0.875rem',
                height: '0.875rem',
                borderRadius: '9999px',
                backgroundColor: dotColor,
                border: '2px solid var(--bg-surface)',
                flexShrink: 0,
              }}
            />

            {/* Event card */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                boxShadow: 'var(--shadow-card)',
                padding: '0.875rem 1rem',
                transition: 'box-shadow 150ms ease',
              }}
            >
              <div
                className="flex justify-between items-start cursor-pointer gap-2"
                onClick={() => setExpandedId(isExpanded ? null : (event.id || index))}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {event.action || event.event_type?.replace(/_/g, ' ')}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatDateTime(event.created_at)}
                    </span>
                    <span className="flex items-center gap-1" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {getActorIcon(event.actor)} {getActorLabel(event.actor)}
                    </span>
                    {event.confidence != null && event.confidence > 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {(event.confidence * 100).toFixed(0)}% confidence
                      </span>
                    )}
                  </div>
                </div>
                <button
                  style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }}
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {isExpanded && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }} className="space-y-2">
                  {event.reasoning && (
                    <div>
                      <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        Reasoning
                      </p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{event.reasoning}</p>
                    </div>
                  )}
                  {event.decision && (
                    <div>
                      <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        Decision
                      </p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{event.decision}</p>
                    </div>
                  )}
                  {event.reconciliation_id && (
                    <div>
                      <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        Reconciliation ID
                      </p>
                      <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                        {event.reconciliation_id}
                      </p>
                    </div>
                  )}
                  {event.input_snapshot && (
                    <div>
                      <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        Input Snapshot
                      </p>
                      <pre
                        style={{
                          fontSize: '0.6875rem',
                          backgroundColor: 'var(--bg-surface-2)',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '0.375rem',
                          border: '1px solid var(--border)',
                          overflowX: 'auto',
                          color: 'var(--text-secondary)',
                          fontFamily: 'monospace',
                        }}
                      >
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
