import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, HelpCircle, AlertTriangle, Eye, Brain } from 'lucide-react';
import { 
  getStore, updateReconciliation, addAuditLog, 
  persistReconciliationsToDB, persistAuditLogsToDB, getDataMode
} from '../services/dataService';
import StatusBadge from '../components/StatusBadge';
import ConfidenceMeter from '../components/ConfidenceMeter';
import { formatCurrency, generateId } from '../utils/formatters';
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
      toastMsg = 'Marked as unresolved';
      actionType = 'Marked as unresolved';
    }
    updateReconciliation(reconId, { status: newStatus });
    
    const auditLog = {
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
    };
    addAuditLog(auditLog);

    setRefreshKey((prev) => prev + 1);

    // Phase 7: Persist Human Approval & Audit to DB
    if (getDataMode() === 'RAZORPAY') {
      const updatedRecon = getStore().reconciliations.find(r => r.id === reconId);
      if (updatedRecon) {
        Promise.all([
          persistReconciliationsToDB([updatedRecon]),
          persistAuditLogsToDB([auditLog])
        ]).catch(err => {
          console.error("Failed to persist manual resolution to DB:", err);
          toast.error("Database update failed");
        });
      }
    }

    toast.success(toastMsg);
  };

  const exceptions = useMemo(
    () => reconciliations.filter(
      (r) => r.status === RECON_STATUS.NEEDS_REVIEW || r.status === RECON_STATUS.UNRESOLVED
    ),
    [reconciliations, refreshKey]
  );

  const filteredExceptions = useMemo(
    () => activeTab === 'ALL' ? exceptions : exceptions.filter((e) => e.status === activeTab),
    [exceptions, activeTab]
  );

  const counts = {
    ALL: exceptions.length,
    NEEDS_REVIEW: exceptions.filter((e) => e.status === RECON_STATUS.NEEDS_REVIEW).length,
    UNRESOLVED: exceptions.filter((e) => e.status === RECON_STATUS.UNRESOLVED).length,
  };

  const TABS = [
    { id: 'NEEDS_REVIEW', label: 'Needs Review', icon: HelpCircle },
    { id: 'UNRESOLVED',   label: 'Unresolved',   icon: XCircle },
    { id: 'ALL',          label: 'All',           icon: AlertTriangle },
  ];

  return (
    <div className="space-y-5 page-enter">
      {/* Page header */}
      <div>
        <h1 className="page-title">Exceptions Queue</h1>
        <p className="page-subtitle">Review and resolve transactions that require human intervention.</p>
      </div>

      {/* Tabs */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.25rem', 
          borderBottom: '1px solid var(--border)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        className="hide-scrollbar"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.625rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                borderBottom: `2px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                marginBottom: '-1px',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'color 150ms ease, border-color 150ms ease',
                background: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <tab.icon style={{ width: '0.875rem', height: '0.875rem' }} />
              {tab.label}
              <span
                style={{
                  marginLeft: '0.25rem',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '9999px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  backgroundColor: isActive ? 'var(--primary-subtle)' : 'var(--bg-surface-2)',
                  color: isActive ? 'var(--primary-text)' : 'var(--text-muted)',
                }}
              >
                {counts[tab.id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredExceptions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon" style={{ backgroundColor: 'var(--success-subtle)', color: 'var(--success)' }}>
            <CheckCircle2 style={{ width: '1.5rem', height: '1.5rem' }} />
          </div>
          <div>
            <p className="empty-state-title">All caught up!</p>
            <p className="empty-state-desc">No exceptions require your attention right now.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExceptions.map((exception) => (
            <div key={exception.id} className="card overflow-hidden">
              {/* Card header */}
              <div
                style={{
                  padding: '0.75rem 1.25rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface-2)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.75rem' }}>
                  <span>
                    <span style={{ color: 'var(--text-muted)', marginRight: '0.25rem' }}>Payment</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {exception.payment_id}
                    </span>
                  </span>
                  {exception.settlement_id && (
                    <span>
                      <span style={{ color: 'var(--text-muted)', marginRight: '0.25rem' }}>Settlement</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {exception.settlement_id}
                      </span>
                    </span>
                  )}
                </div>
                <StatusBadge status={exception.status} size="sm" />
              </div>

              {/* Card body — 3-col grid */}
              <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Amounts */}
                <div className="lg:col-span-3 space-y-3">
                  <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                    Amounts
                  </p>
                  <div>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.125rem' }}>Expected</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrency(exception.expected_amount)}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.125rem' }}>Actual</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrency(exception.actual_amount)}
                    </p>
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'var(--danger-subtle)',
                      border: '1px solid color-mix(in srgb, var(--danger) 25%, transparent)',
                      borderRadius: '0.5rem',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger)' }}>
                      Diff: {formatCurrency(exception.difference)}
                    </span>
                  </div>
                </div>

                {/* AI Analysis */}
                <div
                  className="lg:col-span-6 rounded-xl p-4"
                  style={{
                    backgroundColor: 'var(--ai-subtle)',
                    border: '1px solid color-mix(in srgb, var(--ai) 25%, transparent)',
                  }}
                >
                  {exception.ai_analysis ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
                            <Brain style={{ width: '0.875rem', height: '0.875rem', color: 'var(--ai)' }} />
                            <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ai)' }}>
                              AI Analysis
                            </span>
                          </div>
                          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {exception.ai_analysis.likelyCause || exception.reason}
                          </p>
                        </div>
                        <div style={{ width: '8rem', flexShrink: 0 }}>
                          <ConfidenceMeter confidence={exception.ai_analysis.confidence} />
                        </div>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {exception.ai_analysis.explanation}
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      <AlertTriangle style={{ width: '1rem', height: '1rem', color: 'var(--warning)', flexShrink: 0 }} />
                      AI analysis not available. {exception.reason}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="lg:col-span-3 flex flex-col gap-2 justify-center">
                  {exception.status === RECON_STATUS.NEEDS_REVIEW && exception.ai_analysis ? (
                    <>
                      <button onClick={() => handleAction(exception.id, 'approve')} className="btn-success w-full">
                        <CheckCircle2 className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(exception.id, 'reject')}
                        className="btn-base w-full"
                        style={{
                          backgroundColor: 'var(--danger-subtle)',
                          color: 'var(--danger)',
                          border: '1px solid color-mix(in srgb, var(--danger) 30%, transparent)',
                        }}
                      >
                        <XCircle className="w-4 h-4" />
                        Reject & Flag
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleAction(exception.id, 'mark_unresolved')} className="btn-warning w-full">
                      Investigate Manually
                    </button>
                  )}
                  <button onClick={() => navigate(`/transactions/${exception.payment_id}`)} className="btn-secondary w-full">
                    <Eye className="w-4 h-4" />
                    View Details
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
