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

const TransactionDetailPage = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();

  const payment = getPaymentById(paymentId);
  const settlements = getSettlementByPaymentId(paymentId); // Returns array
  const settlement = settlements && settlements.length > 0 ? settlements[0] : null;
  const recon = getReconciliationByPaymentId(paymentId);
  const auditLogs = recon ? getAuditLogsForReconciliation(recon.id) : [];

  if (!payment) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-slate-700">Transaction Not Found</h2>
        <p className="text-slate-500 mt-2 text-sm">Payment ID: {paymentId}</p>
        <button onClick={() => navigate('/transactions')} className="mt-4 btn-primary">
          <ArrowLeft className="w-4 h-4" /> Back to Transactions
        </button>
      </div>
    );
  }

  // Determine the method label
  const getMethodLabel = () => {
    if (!recon) return null;
    if (recon.ai_analysis) return 'AI Investigation';
    if (recon.final_action === 'AI_RESOLVED') return 'AI Resolved';
    if (recon._isDeterministic !== false) return 'Deterministic Match';
    return 'Human Review';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </button>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transaction Details</h1>
          <p className="text-sm font-mono text-slate-500 mt-1">{payment.payment_id}</p>
        </div>
        {recon && <StatusBadge status={recon.status} size="md" />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Details */}
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-900">Payment Details</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div className="text-slate-500">Payment ID</div>
              <div className="font-mono text-slate-900 text-xs">{payment.payment_id}</div>
              
              <div className="text-slate-500">Order ID</div>
              <div className="font-mono text-slate-900 text-xs">{payment.order_id}</div>
              
              <div className="text-slate-500">Customer</div>
              <div className="text-slate-900">{payment.customer_name}</div>
              
              <div className="text-slate-500">Payment Method</div>
              <div className="text-slate-900 capitalize">{payment.payment_method}</div>
              
              <div className="text-slate-500">Amount</div>
              <div className="font-semibold text-slate-900">{formatCurrency(payment.amount)}</div>
              
              <div className="text-slate-500">Status</div>
              <div className="capitalize text-slate-900">{payment.status}</div>
              
              <div className="text-slate-500">Date</div>
              <div className="text-slate-900">{formatDateTime(payment.created_at)}</div>
            </div>
          </div>
        </div>

        {/* Settlement Details */}
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-900">Settlement Details</h2>
          </div>
          <div className="card-body">
            {settlement ? (
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div className="text-slate-500">Settlement ID</div>
                <div className="font-mono text-slate-900 text-xs">{settlement.settlement_id}</div>
                
                <div className="text-slate-500">Gross Amount</div>
                <div className="text-slate-900">{formatCurrency(settlement.gross_amount)}</div>
                
                <div className="text-slate-500">Fee</div>
                <div className="text-red-600">-{formatCurrency(settlement.fee)}</div>
                
                <div className="text-slate-500">Tax (GST)</div>
                <div className="text-red-600">-{formatCurrency(settlement.tax)}</div>
                
                {settlement.refund > 0 && (
                  <>
                    <div className="text-slate-500">Refund</div>
                    <div className="text-red-600">-{formatCurrency(settlement.refund)}</div>
                  </>
                )}
                
                {settlement.adjustment !== 0 && (
                  <>
                    <div className="text-slate-500">Adjustment</div>
                    <div className={settlement.adjustment > 0 ? 'text-emerald-600' : 'text-red-600'}>
                      {settlement.adjustment > 0 ? '+' : ''}{formatCurrency(settlement.adjustment)}
                    </div>
                  </>
                )}
                
                <div className="text-slate-500 font-semibold pt-2 border-t">Net Amount</div>
                <div className="font-semibold text-slate-900 pt-2 border-t">{formatCurrency(settlement.net_amount)}</div>
                
                <div className="text-slate-500">Settled On</div>
                <div className="text-slate-900">{formatDate(settlement.settled_at)}</div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500 italic text-sm">No settlement record found for this payment.</p>
                <p className="text-red-500 text-xs mt-1">This payment is missing a settlement.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reconciliation Result */}
      {recon && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-900">Reconciliation Result</h2>
            </div>
            {getMethodLabel() && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                {getMethodLabel()}
              </span>
            )}
          </div>
          <div className="card-body">
            <div className="flex flex-col md:flex-row items-center justify-around gap-6 text-center">
              <div>
                <div className="text-sm text-slate-500 mb-1">Expected Net</div>
                <div className="text-xl font-semibold">{formatCurrency(recon.expected_amount)}</div>
              </div>
              <div className="hidden md:block text-2xl text-slate-300">→</div>
              <div>
                <div className="text-sm text-slate-500 mb-1">Actual Net</div>
                <div className="text-xl font-semibold">{formatCurrency(recon.actual_amount)}</div>
              </div>
              <div className="hidden md:block text-2xl text-slate-300">→</div>
              <div>
                <div className="text-sm text-slate-500 mb-1">Difference</div>
                <div className={`text-xl font-semibold ${recon.difference && recon.difference !== 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {recon.difference === 0 || !recon.difference ? '₹0.00 ✓' : formatCurrency(recon.difference)}
                </div>
              </div>
            </div>
            {recon.reason && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-700">
                <span className="font-medium">Reason:</span> {recon.reason}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Investigation */}
      {recon?.ai_analysis && recon.ai_analysis.classification !== 'AI_UNAVAILABLE' && (
        <div className="card border border-purple-200">
          <div className="card-header bg-purple-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-purple-900">
                AI Investigation Report
                {isSupabaseConfigured && <span className="text-xs font-normal text-purple-500 ml-2">(Gemini)</span>}
              </h2>
            </div>
          </div>
          <div className="card-body space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h3 className="text-xs text-slate-500 font-medium uppercase tracking-wide">Classification</h3>
                <p className="mt-1 text-lg font-semibold text-slate-900">{statusLabel(recon.ai_analysis.classification)}</p>
              </div>
              <div className="w-full md:w-64">
                <h3 className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Confidence</h3>
                <ConfidenceMeter confidence={recon.ai_analysis.confidence} />
              </div>
            </div>
            
            {recon.ai_analysis.likelyCause && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Likely Cause</h3>
                <p className="text-slate-800 text-sm">{recon.ai_analysis.likelyCause}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Explanation</h3>
              <p className="text-slate-700 text-sm leading-relaxed">{recon.ai_analysis.explanation}</p>
            </div>
            
            {recon.ai_analysis.evidence && recon.ai_analysis.evidence.length > 0 && (
              <div>
                <h3 className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">Evidence</h3>
                <ul className="space-y-1.5">
                  {recon.ai_analysis.evidence.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {recon.ai_analysis.recommendedAction && (
              <div className={`rounded-lg p-4 text-sm ${
                recon.ai_analysis.recommendedAction === 'AUTO_RESOLVE' 
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : recon.ai_analysis.recommendedAction === 'NEEDS_REVIEW'
                    ? 'bg-amber-50 border border-amber-200 text-amber-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <strong>Recommendation:</strong> {statusLabel(recon.ai_analysis.recommendedAction)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audit Trail */}
      {auditLogs.length > 0 && (
        <div className="card mb-12">
          <div className="card-header flex items-center gap-2">
            <Activity className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-900">Audit Trail</h2>
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
