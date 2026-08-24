import React, { useState, useMemo } from 'react';
import { getAuditLogs } from '../services/dataService';
import AuditTimeline from '../components/AuditTimeline';
import { Search, Filter, ScrollText } from 'lucide-react';
import { EVENT_TYPES } from '../utils/constants';

const AuditTrailPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const allLogs = getAuditLogs();

  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      const matchesSearch = 
        !searchTerm || 
        (log.reconciliation_id && log.reconciliation_id.includes(searchTerm)) ||
        (log.action && log.action.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = typeFilter === 'ALL' || log.event_type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [allLogs, searchTerm, typeFilter]);

  const stats = useMemo(() => {
    return {
      total: allLogs.length,
      system: allLogs.filter(l => l.actor === 'SYSTEM').length,
      ai: allLogs.filter(l => l.actor === 'AI_AGENT').length,
      human: allLogs.filter(l => l.actor === 'HUMAN').length,
    };
  }, [allLogs]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
        <p className="text-gray-500">Comprehensive chronological log of all system and user actions.</p>
      </div>

      {allLogs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500">Total Events</div>
            <div className="text-2xl font-semibold">{stats.total}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500">System Events</div>
            <div className="text-2xl font-semibold text-blue-600">{stats.system}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500">AI Actions</div>
            <div className="text-2xl font-semibold text-purple-600">{stats.ai}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500">Human Interventions</div>
            <div className="text-2xl font-semibold text-orange-600">{stats.human}</div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-1/2">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID or description..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-64">
            <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">All Event Types</option>
              {Object.values(EVENT_TYPES).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredLogs.length > 0 ? (
          <div className="max-h-[600px] overflow-y-auto pr-4">
            <AuditTimeline events={filteredLogs} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <ScrollText className="w-12 h-12 mb-4 text-gray-300" />
            <p>No audit logs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditTrailPage;
