import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, HelpCircle, AlertTriangle, Eye } from 'lucide-react';
import { getStore, updateReconciliation, addAuditLog } from '../services/dataService';
import StatusBadge from '../components/StatusBadge';
import ConfidenceMeter from '../components/ConfidenceMeter';
import { formatCurrency, formatConfidence, generateId } from '../utils/formatters';
import { RECON_STATUS, EVENT_TYPES, ACTORS } from '../utils/constants';

const ExceptionsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('NEEDS_REVIEW');
  const [refreshKey, setRefreshKey] = useState(0);
  const { reconciliations } = getStore();

  const handleAction = (reconId, action) => {
    let newStatus, eventType, toastMsg, actionType;
    
    if (action === 'approve') {
      newStatus = RECON_STATUS.AI_RESOLVED;
      eventType = EVENT_TYPES.HUMAN_APPROVED;
      toastMsg = 'Transaction approved';
      actionType = 'Approved AI resolution';
    } else if (action === 'reject') {
      newStatus = RECON_STATUS.UNRESOLVED;
      eventType = EVENT_TYPES.HUMAN_REJECTED;
      toastMsg = 'Transaction rejected';
      actionType = 'Rejected AI resolution';
    } else if (action === 'mark_unresolved') {
      newStatus = RECON_STATUS.UNRESOLVED;
      eventType = EVENT_TYPES.HUMAN_UNRESOLVED;
      toastMsg = 'Transaction marked as unresolved';
      actionType = 'Marked as unresolved';
    }

    updateReconciliation(reconId, { status: newStatus });
    
    addAuditLog({
      id: generateId(),
      reconciliation_id: reconId,
      event_type: eventType,
      actor: ACTORS.HUMAN,
      action: actionType,
      input_snapshot: null,
      reasoning: `Human ${action} action on exception`,
      decision: newStatus,
      confidence: null,
      created_at: new Date().toISOString(),
    });

    setRefreshKey(prev => prev + 1);
    toast.success(toastMsg);
  };

  const exceptions = useMemo(() => {
    return reconciliations.filter(r => 
      r.status === RECON_STATUS.NEEDS_REVIEW || 
      r.status === RECON_STATUS.UNRESOLVED
    );
  }, [reconciliations, refreshKey]);

  const filteredExceptions = useMemo(() => {
    if (activeTab === 'ALL') return exceptions;
    return exceptions.filter(e => e.status === activeTab);
  }, [exceptions, activeTab]);

  const counts = {
    ALL: exceptions.length,
    NEEDS_REVIEW: exceptions.filter(e => e.status === RECON_STATUS.NEEDS_REVIEW).length,
    UNRESOLVED: exceptions.filter(e => e.status === RECON_STATUS.UNRESOLVED).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Exceptions Queue</h1>
        <p className="text-gray-500">Review and resolve transactions that require human intervention.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200">
        {[
          { id: 'NEEDS_REVIEW', label: 'Needs Review', icon: HelpCircle },
          { id: 'UNRESOLVED', label: 'Unresolved', icon: XCircle },
          { id: 'ALL', label: 'All Exceptions', icon: AlertTriangle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
              activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {counts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      {filteredExceptions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
          <p className="text-gray-500 mt-1">No exceptions require your attention at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExceptions.map(exception => (
            <div key={exception.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex space-x-4 text-sm">
                  <div>
                    <span className="text-gray-500">Payment: </span>
                    <span className="font-mono font-medium">{exception.payment_id}</span>
                  </div>
                  {exception.settlement_id && (
                    <div>
                      <span className="text-gray-500">Settlement: </span>
                      <span className="font-mono font-medium">{exception.settlement_id}</span>
                    </div>
                  )}
                </div>
                <StatusBadge status={exception.status} />
              </div>
              
              <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3 space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Amounts</div>
                    <div className="flex items-end space-x-2">
                      <span className="text-xl font-medium">{formatCurrency(exception.expected_amount)}</span>
                      <span className="text-sm text-gray-400 mb-0.5">expected</span>
                    </div>
                    <div className="flex items-end space-x-2">
                      <span className="text-xl font-medium">{formatCurrency(exception.actual_amount)}</span>
                      <span className="text-sm text-gray-400 mb-0.5">actual</span>
                    </div>
                    <div className="mt-2 text-sm text-red-600 font-medium bg-red-50 p-1.5 rounded inline-block">
                      Diff: {formatCurrency(exception.difference)}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-purple-50 rounded-lg p-4 border border-purple-100">
                  {exception.ai_analysis ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-1 block">AI Analysis</span>
                          <span className="font-medium text-gray-900">{exception.ai_analysis.likelyCause || exception.reason}</span>
                        </div>
                        <div className="w-32">
                          <ConfidenceMeter confidence={exception.ai_analysis.confidence} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{exception.ai_analysis.explanation}</p>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 flex items-center h-full">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      AI analysis not available. {exception.reason}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-3 flex flex-col space-y-2 justify-center">
                  {exception.status === RECON_STATUS.NEEDS_REVIEW && exception.ai_analysis ? (
                    <>
                      <button
                        onClick={() => handleAction(exception.id, 'approve')}
                        className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
                      >
                        Approve Resolution
                      </button>
                      <button
                        onClick={() => handleAction(exception.id, 'reject')}
                        className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium py-2 px-4 rounded transition-colors"
                      >
                        Reject & Flag
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleAction(exception.id, 'mark_unresolved')}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
                    >
                      Investigate Manually
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/transactions/${exception.payment_id}`)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-4 rounded transition-colors flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Full Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExceptionsPage;
