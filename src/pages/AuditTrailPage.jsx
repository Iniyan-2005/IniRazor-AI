import React, { useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import AuditTimeline from '../components/AuditTimeline';
import KPICard from '../components/KPICard';
import { Search, Filter, ScrollText, Monitor, Bot, User } from 'lucide-react';
import { EVENT_TYPES } from '../utils/constants';

const AuditTrailPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  
  const store = useStore();
  // Ensure we format it identically to how getAuditLogs does it (reverse chronological)
  const allLogs = useMemo(() => {
    return [...store.auditLogs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [store.auditLogs]);

  const filteredLogs = useMemo(() => {
    return allLogs.filter((log) => {
      const matchesSearch =
        !searchTerm ||
        (log.reconciliation_id && log.reconciliation_id.includes(searchTerm)) ||
        (log.action && log.action.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = typeFilter === 'ALL' || log.event_type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [allLogs, searchTerm, typeFilter]);

  const stats = useMemo(() => ({
    total:  allLogs.length,
    system: allLogs.filter((l) => l.actor === 'SYSTEM').length,
    ai:     allLogs.filter((l) => l.actor === 'AI_AGENT').length,
    human:  allLogs.filter((l) => l.actor === 'HUMAN').length,
  }), [allLogs]);

  return (
    <div className="space-y-5 page-enter">
      <div>
        <h1 className="page-title">Audit Trail</h1>
        <p className="page-subtitle">Comprehensive chronological log of all system and user actions.</p>
      </div>

      {allLogs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-enter">
          <KPICard title="Total Events"        value={stats.total}  icon={ScrollText} color="blue"   />
          <KPICard title="System Events"       value={stats.system} icon={Monitor}    color="slate"  />
          <KPICard title="AI Actions"          value={stats.ai}     icon={Bot}        color="purple" />
          <KPICard title="Human Interventions" value={stats.human}  icon={User}       color="amber"  />
        </div>
      )}

      <div className="card">
        {/* Filters */}
        <div className="card-header flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="input-icon-wrapper w-full sm:flex-1">
            <Search className="input-icon" />
            <input
              type="text"
              placeholder="Search by ID or description…"
              className="input-with-icon w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="input-icon-wrapper w-full sm:w-56">
            <Filter className="input-icon" />
            <select
              className="input-with-icon w-full"
              style={{ appearance: 'none' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">All Event Types</option>
              {Object.values(EVENT_TYPES).map((type) => (
                <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Timeline */}
        <div className="card-body">
          {filteredLogs.length > 0 ? (
            <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              <AuditTimeline events={filteredLogs} />
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 1rem',
                color: 'var(--text-muted)',
              }}
            >
              <ScrollText style={{ width: '2.5rem', height: '2.5rem', marginBottom: '0.75rem', opacity: 0.3 }} />
              <p style={{ fontSize: '0.875rem' }}>No audit logs found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditTrailPage;
