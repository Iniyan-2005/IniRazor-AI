import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { generateSyntheticData } from '../utils/syntheticDataGenerator';
import { reconcileBatch } from '../services/reconciliationEngine';
import { investigateException, getAIMode } from '../services/aiService';
import { syncRazorpayData, fetchPersistedPayments } from '../services/razorpayService';
import { isSupabaseConfigured } from '../services/supabase';
import {
  getStore,
  setPayments,
  setSettlements,
  setReconciliations,
  addAuditLog,
  markDataGenerated,
  isReady,
  getDashboardStats,
  getActiveDataset,
  setActiveDataset,
  setDataMode,
  setAiProvider,
  persistReconciliationsToDB,
  persistAuditLogsToDB,
  getDataMode,
  fetchPersistedReconciledData
} from '../services/dataService';
import {
  RECON_STATUS,
  EVENT_TYPES,
  ACTORS,
  DEFAULT_CONFIG,
  AI_ACTIONS,
} from '../utils/constants';
import {
  generateId,
  formatDuration,
  formatNumber,
} from '../utils/formatters';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';
import KPICard from '../components/KPICard';
import { Play, Database, RefreshCw, CheckCircle2, AlertTriangle, Brain, Loader2, Zap, BarChart3, CreditCard, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReconciliationPage = () => {
  const navigate = useNavigate();
  const [dataGenerated, setDataGenerated] = useState(isReady());
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);

  const [isReconciling, setIsReconciling] = useState(false);
  const [reconProgress, setReconProgress] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [reconStep, setReconStep] = useState('');
  
  const [results, setResults] = useState(null);

  const handleGenerateData = async () => {
    setIsGenerating(true);
    setGenProgress(0);
    setResults(null);
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenProgress((prev) => Math.min(prev + 10, 90));
      }, 150);

      const { payments, settlements } = generateSyntheticData(100);
      clearInterval(progressInterval);
      setGenProgress(100);

      setPayments(payments);
      setSettlements(settlements);
      setActiveDataset('SYNTHETIC');
      setDataMode('DEMO', 'MANUAL');
      markDataGenerated();

      addAuditLog({
        id: generateId(),
        reconciliation_id: null,
        event_type: EVENT_TYPES.DATA_GENERATED,
        actor: ACTORS.SYSTEM,
        action: 'Generated 100 synthetic payment and settlement records',
        input_snapshot: { count: 100 },
        reasoning: 'Synthetic data generated for reconciliation testing',
        decision: 'DATA_READY',
        confidence: 1.0,
        created_at: new Date().toISOString(),
      });

      setDataGenerated(true);
      toast.success('100 synthetic records generated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate data: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRunReconciliation = async () => {
    setIsReconciling(true);
    setReconProgress(0);
    const startTime = Date.now();

    // Reset AI provider to try real AI again for a new run
    if (isSupabaseConfigured) {
      setAiProvider('NVIDIA');
    }

    try {
      const store = getStore();
      const payments = store.payments;
      const settlements = store.settlements;
      const config = store.config;
      let hasShownQuotaToast = false;
      let hasShownFallbackToast = false;
      let hasShownAISuccessToast = false;
      let hasShownMissingSettlementToast = false;
      let hasShownAINotRequiredToast = false;
      const count = payments.length;
      setTotalRecords(count);

      // Step 1: Deterministic reconciliation
      setReconStep('Running deterministic matching...');
      const { reconciliations: reconResults, stats } = reconcileBatch(payments, settlements, config);
      
      addAuditLog({
        id: generateId(),
        reconciliation_id: null,
        event_type: EVENT_TYPES.BATCH_STARTED,
        actor: ACTORS.SYSTEM,
        action: `Batch reconciliation started for ${count} records`,
        input_snapshot: { total: count },
        reasoning: 'Deterministic matching completed',
        decision: `Matched: ${stats.matched}, Needs AI: ${stats.needsAI}`,
        confidence: 1.0,
        created_at: new Date().toISOString(),
      });

      let processed = stats.total - stats.needsAI;
      setReconProgress(Math.round((processed / count) * 100));

      // Inform user once per batch if any payments have no settlement data
      if (stats.missingSettlement > 0 && !hasShownMissingSettlementToast) {
        toast('Settlement information unavailable — payment requires review.', {
          icon: '⚠️',
          duration: 5000,
        });
        hasShownMissingSettlementToast = true;
      }

      // Step 2: AI investigation for ambiguous cases
      setReconStep('Investigating exceptions with AI...');
      for (let i = 0; i < reconResults.length; i++) {
        const recon = reconResults[i];
        if (recon.status === RECON_STATUS.AMOUNT_MISMATCH && !recon._isDeterministic) {
          const payment = payments.find((p) => p.payment_id === recon.payment_id);
          const settlement = settlements.find((s) => s.payment_id === recon.payment_id);
          
          // Build structured evidence for AI
          const evidence = {
            payment,
            settlement,
            expectedAmount: recon.expected_amount,
            actualAmount: recon.actual_amount,
            difference: recon.difference,
            knownFees: settlement?.fee || 0,
            knownTax: settlement?.tax || 0,
            knownRefund: settlement?.refund || 0,
            knownAdjustment: settlement?.adjustment || 0,
            isDemoData: getActiveDataset() === 'SYNTHETIC'
          };

          const aiResult = await investigateException(evidence);
          recon.ai_analysis = aiResult;

          if (aiResult._isFallback) {
            setAiProvider('FALLBACK');
            if (aiResult._quotaExhausted) {
              if (!hasShownQuotaToast) {
                toast.error('NVIDIA AI quota/rate limit reached — using Demo AI fallback.');
                hasShownQuotaToast = true;
              }
            } else {
              if (!hasShownFallbackToast) {
                toast.error('NVIDIA AI unavailable — using Demo AI fallback.');
                hasShownFallbackToast = true;
              }
            }
          } else {
            setAiProvider(aiResult.ai_provider || 'NVIDIA');
            if (!hasShownAISuccessToast) {
              const aiName = (aiResult.ai_provider === 'GEMINI') ? 'NVIDIA AI' : (aiResult.ai_provider === 'NVIDIA' ? 'NVIDIA AI' : 'AI');
              if (aiResult._recovered) {
                toast.success(`NVIDIA AI response recovered — using live AI analysis.`);
              } else if (getActiveDataset() === 'SYNTHETIC') {
                toast.success(`${aiName} connected — using live AI analysis on Demo Data.`);
              } else {
                toast.success(`${aiName} connected — using live AI analysis.`);
              }
              hasShownAISuccessToast = true;
            }
          }

          if (aiResult.confidence >= (config.confidenceThreshold || DEFAULT_CONFIG.CONFIDENCE_THRESHOLD) 
              && aiResult.recommendedAction === AI_ACTIONS.AUTO_RESOLVE) {
            recon.status = RECON_STATUS.AI_RESOLVED;
            recon.confidence = aiResult.confidence;
            recon.reason = aiResult.explanation;
            recon.recommended_action = AI_ACTIONS.AUTO_RESOLVE;
            recon.final_action = 'AI_RESOLVED';

            addAuditLog({
              id: generateId(),
              reconciliation_id: recon.id,
              event_type: EVENT_TYPES.AI_RESOLUTION,
              actor: ACTORS.AI_AGENT,
              action: `AI resolved: ${aiResult.classification}`,
              input_snapshot: evidence,
              reasoning: aiResult.explanation,
              decision: 'AI_RESOLVED',
              confidence: aiResult.confidence,
              created_at: new Date().toISOString(),
            });
          } else {
            recon.status = RECON_STATUS.NEEDS_REVIEW;
            recon.confidence = aiResult.confidence;
            recon.reason = aiResult.explanation;
            recon.recommended_action = AI_ACTIONS.NEEDS_REVIEW;

            addAuditLog({
              id: generateId(),
              reconciliation_id: recon.id,
              event_type: EVENT_TYPES.AI_INVESTIGATION,
              actor: ACTORS.AI_AGENT,
              action: `AI investigation: ${aiResult.classification} (${(aiResult.confidence * 100).toFixed(0)}% confidence)`,
              input_snapshot: evidence,
              reasoning: aiResult.explanation,
              decision: 'NEEDS_REVIEW',
              confidence: aiResult.confidence,
              created_at: new Date().toISOString(),
            });
          }

          processed++;
          setReconProgress(Math.round((processed / count) * 100));
        }
      }

      // Inform user if the entire batch was resolved deterministically (no AI calls needed)
      if (stats.needsAI === 0 && !hasShownAINotRequiredToast) {
        toast('NVIDIA AI not required — deterministic reconciliation result.', {
          icon: 'ℹ️',
          duration: 5000,
        });
        hasShownAINotRequiredToast = true;
      }

      // Store results
      setReconciliations(reconResults);
      store.lastReconciliationTime = Date.now() - startTime;

      const dashStats = getDashboardStats();
      const matchRate = dashStats.total > 0 
        ? (((dashStats.matched + dashStats.aiResolved) / dashStats.total) * 100).toFixed(1)
        : '0.0';
      
      const duration = Date.now() - startTime;

      addAuditLog({
        id: generateId(),
        reconciliation_id: null,
        event_type: EVENT_TYPES.BATCH_COMPLETED,
        actor: ACTORS.SYSTEM,
        action: `Batch reconciliation completed in ${formatDuration(duration)}`,
        input_snapshot: { total: count, duration },
        reasoning: `Match rate: ${matchRate}%`,
        decision: 'BATCH_COMPLETE',
        confidence: 1.0,
        created_at: new Date().toISOString(),
      });

      setResults({
        total: count,
        matched: dashStats.matched,
        aiResolved: dashStats.aiResolved,
        needsReview: dashStats.needsReview,
        unresolved: dashStats.unresolved,
        exceptions: dashStats.exceptions,
        duration,
        matchRate,
      });

      setReconStep('');
      toast.success(`Reconciliation completed. Match rate: ${matchRate}%`);
      
      // Phase 5 & 7: Persist only Razorpay data
      if (getDataMode() === 'RAZORPAY') {
        try {
          toast.loading('Persisting results to database...', { id: 'persist-recon' });
          await Promise.all([
            persistReconciliationsToDB(reconResults),
            persistAuditLogsToDB(store.auditLogs)
          ]);
          toast.success('Reconciliation results and audit logs saved to database.', { id: 'persist-recon' });
        } catch (err) {
          toast.error('Failed to save to database: ' + err.message, { id: 'persist-recon' });
        }
      }
      
    } catch (error) {
      console.error(error);
      toast.error('Reconciliation failed: ' + error.message);
    } finally {
      setIsReconciling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="page-title">Reconciliation Engine</h1>
            <p className="page-subtitle">Generate synthetic data, run the deterministic engine, and investigate exceptions with AI.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* AI Mode indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg text-xs font-semibold border border-violet-200">
              <Bot className="w-3.5 h-3.5" />
              {getAIMode()}
            </div>
            {/* Data Source Indicator */}
            {getActiveDataset() && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                getActiveDataset() === 'SYNTHETIC' 
                  ? 'bg-amber-50 text-amber-700 border-amber-200' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                <Database className="w-3.5 h-3.5" />
                Data: {getActiveDataset() === 'SYNTHETIC' ? 'Synthetic' : 'Razorpay (Live)'}
              </div>
            )}
            {/* Razorpay Sync button */}
            {isSupabaseConfigured && (
              <button
                onClick={async () => {
                  try {
                    toast.loading('Syncing with Razorpay...', { id: 'rzp-sync' });
                    
                    // 1. Razorpay API Sync
                    let result;
                    try {
                      result = await syncRazorpayData();
                      if (!result.success) {
                        throw new Error(result.message || 'Razorpay sync returned no data');
                      }
                    } catch (rzpErr) {
                      console.error("Razorpay API failure:", rzpErr);
                      // Automatic Demo Fallback
                      const { payments, settlements } = generateSyntheticData(100);
                      setPayments(payments);
                      setSettlements(settlements);
                      setActiveDataset('SYNTHETIC');
                      setDataMode('DEMO', 'AUTO_FALLBACK');
                      markDataGenerated();
                      setDataGenerated(true);
                      toast.error('Razorpay API unavailable — switched to Demo Mode.', { id: 'rzp-sync' });
                      return; // Exit early, do not attempt database fetch
                    }

                    // 2. Database Fetch (Must NOT trigger Demo Mode fallback)
                    toast.loading('Loading persisted records from database...', { id: 'rzp-sync' });
                    const fetchResult = await fetchPersistedPayments();
                    
                    if (fetchResult.success) {
                      setPayments(fetchResult.data.payments || []);
                      setSettlements(fetchResult.data.settlements || []);
                      setActiveDataset('RAZORPAY');
                      setDataMode('RAZORPAY', 'MANUAL');
                      markDataGenerated();
                      setDataGenerated(true);
                      
                      // Phase 8: Hydrate Dashboard state from Supabase
                      await fetchPersistedReconciledData();

                      toast.success(`Razorpay Test Mode connected — data synchronized.`, { id: 'rzp-sync' });
                    } else {
                      throw new Error(fetchResult.message || 'Failed to fetch persisted data');
                    }
                  } catch (dbErr) {
                    console.error("Database/Supabase failure:", dbErr);
                    toast.error('Database error: ' + dbErr.message, { id: 'rzp-sync' });
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Sync Razorpay
              </button>
            )}
          </div>
        </div>
      </div>


      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Generate Data */}
        <div className="card p-6" style={{ borderTop: '4px solid var(--primary)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div style={{ backgroundColor: 'var(--primary-subtle)', padding: '0.625rem', borderRadius: '0.5rem' }}>
              <Database style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary-text)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>1. Generate Data</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {getActiveDataset() === 'SYNTHETIC' && dataGenerated 
                  ? `${getStore().payments.length} synthetic records` 
                  : '100 synthetic records'}
              </p>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            Create realistic payment and settlement records with known ground truth for testing.
          </p>
          <button
            onClick={handleGenerateData}
            disabled={isGenerating || isReconciling}
            className="btn-primary w-full justify-center"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>{isGenerating ? 'Generating...' : dataGenerated ? 'Regenerate Data' : 'Generate 100 Records'}</span>
          </button>
          {isGenerating && (
            <div className="mt-4">
              <ProgressBar current={genProgress} total={100} label="Generating records..." />
            </div>
          )}
          {dataGenerated && !isGenerating && (
            <div className="mt-4 flex items-center text-sm font-medium" style={{ color: 'var(--success)' }}>
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> 
              {getActiveDataset() === 'SYNTHETIC' 
                ? `${getStore().payments.length} synthetic record${getStore().payments.length === 1 ? '' : 's'} ready` 
                : `${getStore().payments.length} Razorpay payment${getStore().payments.length === 1 ? '' : 's'} ready`}
            </div>
          )}
        </div>

        {/* Step 2: Run Reconciliation */}
        <div
          className="card p-6"
          style={{
            borderTop: `4px solid ${dataGenerated ? 'var(--ai)' : 'var(--border)'}`,
            opacity: dataGenerated ? 1 : 0.6,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              style={{
                padding: '0.625rem',
                borderRadius: '0.5rem',
                backgroundColor: dataGenerated ? 'var(--ai-subtle)' : 'var(--bg-surface-2)',
              }}
            >
              <Zap style={{ width: '1.25rem', height: '1.25rem', color: dataGenerated ? 'var(--ai)' : 'var(--text-muted)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>2. Run Reconciliation</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deterministic + AI</p>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            Execute rule-based matching, then invoke AI for ambiguous discrepancies.
          </p>
          <button
            onClick={handleRunReconciliation}
            disabled={!dataGenerated || isReconciling}
            className={`w-full justify-center font-medium px-4 py-2 rounded-lg transition-all duration-150 flex items-center gap-2 text-sm disabled:cursor-not-allowed disabled:opacity-50`}
            style={
              dataGenerated
                ? { backgroundColor: 'var(--ai)', color: '#fff' }
                : { backgroundColor: 'var(--bg-surface-3)', color: 'var(--text-muted)' }
            }
          >
            {isReconciling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{isReconciling ? 'Processing...' : 'Run Reconciliation'}</span>
          </button>
          {isReconciling && (
            <div className="mt-4">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                <span>{reconStep}</span>
                <span>{Math.round((reconProgress / 100) * totalRecords)}/{totalRecords}</span>
              </div>
              <ProgressBar current={reconProgress} total={100} label={reconStep} />
            </div>
          )}
        </div>

        {/* Step 3: View Results */}
        <div
          className="card p-6"
          style={{
            borderTop: `4px solid ${results ? 'var(--success)' : 'var(--border)'}`,
            opacity: results ? 1 : 0.6,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              style={{
                padding: '0.625rem',
                borderRadius: '0.5rem',
                backgroundColor: results ? 'var(--success-subtle)' : 'var(--bg-surface-2)',
              }}
            >
              <BarChart3 style={{ width: '1.25rem', height: '1.25rem', color: results ? 'var(--success)' : 'var(--text-muted)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>3. View Results</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Metrics & analysis</p>
            </div>
          </div>
          {results ? (
            <div className="space-y-2.5">
              {[
                { label: 'Total Records',  value: formatNumber(results.total),       color: 'var(--text-primary)'   },
                { label: 'Match Rate',     value: `${results.matchRate}%`,            color: 'var(--success)'        },
                { label: 'AI Resolved',    value: formatNumber(results.aiResolved),   color: 'var(--primary)'        },
                { label: 'Needs Review',   value: formatNumber(results.needsReview),  color: 'var(--warning)'        },
                { label: 'Duration',       value: formatDuration(results.duration),   color: 'var(--text-secondary)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}:</span>
                  <span style={{ fontWeight: 600, color }}>{value}</span>
                </div>
              ))}
              <div className="pt-3 space-y-2">
                <button onClick={() => navigate('/')} className="btn-primary w-full justify-center text-sm">
                  <BarChart3 className="w-4 h-4" /> View Dashboard
                </button>
                <button onClick={() => navigate('/exceptions')} className="btn-warning w-full justify-center text-sm">
                  <AlertTriangle className="w-4 h-4" /> View Exceptions ({results.needsReview})
                </button>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Run reconciliation to see results.
            </p>
          )}
        </div>
      </div>

      {/* Results Summary */}
      {results && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Reconciliation Summary</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 stagger-enter">
              <KPICard title="Total"        value={formatNumber(results.total)}           icon={Database}       color="blue"   />
              <KPICard title="Matched"      value={formatNumber(results.matched)}         icon={CheckCircle2}   color="green"  />
              <KPICard title="AI Resolved"  value={formatNumber(results.aiResolved)}      icon={Brain}          color="purple" />
              <KPICard title="Needs Review" value={formatNumber(results.needsReview)}     icon={AlertTriangle}  color="amber"  />
              <KPICard title="Unresolved"   value={formatNumber(results.unresolved || 0)} icon={AlertTriangle}  color="red"    />
              <KPICard title="Processing"   value={formatDuration(results.duration)}      icon={Zap}            color="slate"  />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReconciliationPage;

