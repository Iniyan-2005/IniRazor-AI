import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getPaymentById,
  getSettlementByPaymentId,
  getReconciliationByPaymentId,
  getAuditLogsForReconciliation,
} from '../services/dataService';
import StatusBadge from '../components/StatusBadge';
import ConfidenceMeter from '../components/ConfidenceMeter';
import AuditTimeline from '../components/AuditTimeline';
import { formatCurrency, formatDate, formatDateTime, statusLabel } from '../utils/formatters';
import { ArrowLeft, CreditCard, Building2, FileCheck, BrainCircuit, Activity } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabase';

const DetailRow = ({ label, children }) => (
  <>
    <dt style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{label}</dt>
    <dd style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{children}</dd>
  </>
);

const TransactionDetailPage = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();

  const payment = getPaymentById(paymentId);
  const settlements = getSettlementByPaymentId(paymentId);
  const settlement = settlements && settlements.length > 0 ? settlements[0] : null;
  const recon = getReconciliationByPaymentId(paymentId);
  const auditLogs = recon ? getAuditLogsForReconciliation(recon.id) : [];

  if (!payment) {
    return (
      <div className="page-enter" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Transaction Not Found</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Payment ID: {paymentId}</p>
        <button onClick={() => navigate('/transactions')} className="btn-primary" style={{ marginTop: '1.5rem' }}>
          <ArrowLeft className="w-4 h-4" /> Back to Transactions
        </button>
      </div>
    );
  }

  const getMethodLabel = () => {
    if (!recon) return null;
    if (recon.ai_analysis) return 'AI Investigation';
    if (recon.final_action === 'AI_RESOLVED') return 'AI Resolved';
    if (recon._isDeterministic !== false) return 'Deterministic Match';
    return 'Human Review';
  };

  const sectionTitle = { fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' };
  const mono = { fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)' };

  return (
    <div className="space-y-6 max-w-5xl mx-auto page-enter">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)', background: 'none', cursor: 'pointer', transition: 'color 150ms ease' }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Transaction Details</h1>
          <p style={mono}>{payment.payment_id}</p>
        </div>
        {recon && <StatusBadge status={recon.status} size="md" />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Details */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard style={{ width: '1.125rem', height: '1.125rem', color: 'var(--text-muted)' }} />
            <h2 style={sectionTitle}>Payment Details</h2>
          </div>
          <div className="card-body">
            <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <DetailRow label="Payment ID">
                <span style={mono}>{payment.payment_id}</span>
              </DetailRow>
              <DetailRow label="Order ID">
                <span style={mono}>{payment.order_id}</span>
              </DetailRow>
              <DetailRow label="Customer">{payment.customer_name}</DetailRow>
              <DetailRow label="Method">
                <span style={{ textTransform: 'capitalize' }}>{payment.payment_method}</span>
              </DetailRow>
              <DetailRow label="Amount">
                <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(payment.amount)}
                </span>
              </DetailRow>
              <DetailRow label="Status">
                <span style={{ textTransform: 'capitalize' }}>{payment.status}</span>
              </DetailRow>
              <DetailRow label="Date">{formatDateTime(payment.created_at)}</DetailRow>
            </dl>
          </div>
        </div>

        {/* Settlement Details */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 style={{ width: '1.125rem', height: '1.125rem', color: 'var(--text-muted)' }} />
            <h2 style={sectionTitle}>Settlement Details</h2>
          </div>
          <div className="card-body">
            {settlement ? (
              <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <DetailRow label="Settlement ID">
                  <span style={mono}>{settlement.settlement_id}</span>
                </DetailRow>
                <DetailRow label="Gross Amount">{formatCurrency(settlement.gross_amount)}</DetailRow>
                <DetailRow label="Fee">
                  <span style={{ color: 'var(--danger)' }}>-{formatCurrency(settlement.fee)}</span>
                </DetailRow>
                <DetailRow label="Tax (GST)">
                  <span style={{ color: 'var(--danger)' }}>-{formatCurrency(settlement.tax)}</span>
                </DetailRow>
                {settlement.refund > 0 && (
                  <DetailRow label="Refund">
                    <span style={{ color: 'var(--danger)' }}>-{formatCurrency(settlement.refund)}</span>
                  </DetailRow>
                )}
                {settlement.adjustment !== 0 && (
                  <DetailRow label="Adjustment">
                    <span style={{ color: settlement.adjustment > 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {settlement.adjustment > 0 ? '+' : ''}{formatCurrency(settlement.adjustment)}
                    </span>
                  </DetailRow>
                )}
                <dt style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                  Net Amount
                </dt>
                <dd style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(settlement.net_amount)}
                </dd>
                <DetailRow label="Settled On">{formatDate(settlement.settled_at)}</DetailRow>
              </dl>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', backgroundColor: 'var(--warning)' }}></div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Settlement Pending
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Settlement information is currently unavailable.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reconciliation Result */}
      {recon && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCheck style={{ width: '1.125rem', height: '1.125rem', color: 'var(--text-muted)' }} />
              <h2 style={sectionTitle}>Reconciliation Result</h2>
            </div>
            {getMethodLabel() && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  padding: '0.25rem 0.625rem',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--bg-surface-2)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                }}
              >
                {getMethodLabel()}
              </span>
            )}
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-around', gap: '1.5rem', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Expected Net</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(recon.expected_amount)}
                </div>
              </div>
              <div style={{ fontSize: '1.5rem', color: 'var(--border-strong)' }}>→</div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Actual Net</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(recon.actual_amount)}
                </div>
              </div>
              <div style={{ fontSize: '1.5rem', color: 'var(--border-strong)' }}>→</div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Difference</div>
                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                    color: recon.difference && recon.difference !== 0 ? 'var(--danger)' : 'var(--success)',
                  }}
                >
                  {recon.difference === 0 || !recon.difference ? '₹0.00 ✓' : formatCurrency(recon.difference)}
                </div>
              </div>
            </div>
            {recon.reason && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-surface-2)',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontWeight: 600 }}>Reason:</span> {recon.reason}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Investigation */}
      {recon?.ai_analysis && recon.ai_analysis.classification !== 'AI_UNAVAILABLE' && (
        <div
          className="card"
          style={{ borderColor: 'color-mix(in srgb, var(--ai) 30%, var(--border))' }}
        >
          <div
            className="card-header"
            style={{
              backgroundColor: 'var(--ai-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BrainCircuit style={{ width: '1.125rem', height: '1.125rem', color: 'var(--ai)' }} />
              <h2 style={{ ...sectionTitle, color: 'var(--ai-text)' }}>
                AI Investigation Report
                {isSupabaseConfigured && (
                  <span style={{ fontSize: '0.6875rem', fontWeight: 400, color: 'var(--ai)', marginLeft: '0.5rem' }}>(Gemini)</span>
                )}
              </h2>
            </div>
          </div>
          <div className="card-body space-y-4">
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Classification
                </h3>
                <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {statusLabel(recon.ai_analysis.classification)}
                </p>
              </div>
              <div style={{ width: '100%', maxWidth: '16rem' }}>
                <h3 style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                  Confidence
                </h3>
                <ConfidenceMeter confidence={recon.ai_analysis.confidence} />
              </div>
            </div>

            {recon.ai_analysis.likelyCause && (
              <div style={{ backgroundColor: 'var(--bg-surface-2)', borderRadius: '0.5rem', padding: '1rem', border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Likely Cause
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{recon.ai_analysis.likelyCause}</p>
              </div>
            )}

            <div>
              <h3 style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Explanation
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {recon.ai_analysis.explanation}
              </p>
            </div>

            {recon.ai_analysis.evidence && recon.ai_analysis.evidence.length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Evidence
                </h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  {recon.ai_analysis.evidence.map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--success)', marginTop: '0.125rem' }}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recon.ai_analysis.recommendedAction && (
              <div
                style={{
                  borderRadius: '0.5rem',
                  padding: '0.875rem 1rem',
                  fontSize: '0.875rem',
                  backgroundColor:
                    recon.ai_analysis.recommendedAction === 'AUTO_RESOLVE' ? 'var(--success-subtle)' :
                    recon.ai_analysis.recommendedAction === 'NEEDS_REVIEW' ? 'var(--warning-subtle)' :
                    'var(--danger-subtle)',
                  color:
                    recon.ai_analysis.recommendedAction === 'AUTO_RESOLVE' ? 'var(--success-text)' :
                    recon.ai_analysis.recommendedAction === 'NEEDS_REVIEW' ? 'var(--warning-text)' :
                    'var(--danger-text)',
                  border: `1px solid color-mix(in srgb, ${
                    recon.ai_analysis.recommendedAction === 'AUTO_RESOLVE' ? 'var(--success)' :
                    recon.ai_analysis.recommendedAction === 'NEEDS_REVIEW' ? 'var(--warning)' :
                    'var(--danger)'
                  } 30%, transparent)`,
                }}
              >
                <strong>Recommendation:</strong> {statusLabel(recon.ai_analysis.recommendedAction)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audit Trail */}
      {auditLogs.length > 0 && (
        <div className="card" style={{ marginBottom: '3rem' }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity style={{ width: '1.125rem', height: '1.125rem', color: 'var(--text-muted)' }} />
            <h2 style={sectionTitle}>Audit Trail</h2>
          </div>
          <div className="card-body">
            <AuditTimeline events={auditLogs} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionDetailPage;
