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
  fetchPersistedReconciledData,
  resetWorkflowState
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
import { motion, AnimatePresence } from 'framer-motion';

// ────────────────────────────────────────────────────────────────────────


const ReconciliationPage = () => {
  const navigate = useNavigate();
  const store = getStore();
  const hasData = isReady() || store.payments.length > 0;
  
  const [dataGenerated, setDataGenerated] = useState(hasData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(hasData ? 100 : 0);
  const [showResetModal, setShowResetModal] = useState(false);
  const [pendingActionType, setPendingActionType] = useState('DEFAULT');

  const [isReconciling, setIsReconciling] = useState(false);
  const [reconProgress, setReconProgress] = useState(0);
  const [totalRecords, setTotalRecords] = useState(store.payments.length || 0);
  const [reconStep, setReconStep] = useState('');
  
  const [results, setResults] = useState(() => {
    if (store.reconciliations && store.reconciliations.length > 0) {
      return getDashboardStats();
    }
    return null;
  });

  useEffect(() => {
    if (!showResetModal) {
      document.body.classList.remove('modal-active');
      return;
    }
    document.body.classList.add('modal-active');
    
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setShowResetModal(false);
        setPendingActionType('DEFAULT');
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.classList.remove('modal-active');
    };
  }, [showResetModal]);

  const handleDataActionClick = () => {
    if (dataGenerated) {
      setPendingActionType('DEFAULT');
      setShowResetModal(true);
    } else {
      executeDataAction();
    }
  };

  const handleForceDemoClick = () => {
    if (dataGenerated) {
      setPendingActionType('DEMO_FALLBACK');
      setShowResetModal(true);
    } else {
      executeDataGeneration();
    }
  };

  const handleConfirmReset = () => {
    setShowResetModal(false);
    resetWorkflowState();
    setDataGenerated(false);
    setResults(null);
    setTotalRecords(0);
    
    if (pendingActionType === 'DEMO_FALLBACK') {
      executeDataGeneration();
    } else {
      executeDataAction();
    }
    
    setPendingActionType('DEFAULT');
  };

  const executeDataAction = () => {
    if (isSupabaseConfigured) {
      executeRazorpaySync();
    } else {
      executeDataGeneration();
    }
  };

  const executeRazorpaySync = async () => {
    setIsGenerating(true);
    setGenProgress(0);
    setResults(null);
    try {
      toast.loading('Syncing with Razorpay...', { id: 'rzp-sync' });
      
      const progressInterval = setInterval(() => {
        setGenProgress((prev) => Math.min(prev + 10, 90));
      }, 300);

      let result;
      try {
        result = await syncRazorpayData();
        if (!result.success) throw new Error(result.message || 'Razorpay sync returned no data');
      } catch (rzpErr) {
        clearInterval(progressInterval);
        console.error("Razorpay API failure:", rzpErr);
        const { payments, settlements } = generateSyntheticData(100);
        setPayments(payments);
        setSettlements(settlements);
        setActiveDataset('SYNTHETIC');
        setDataMode('DEMO', 'AUTO_FALLBACK');
        markDataGenerated();
        setDataGenerated(true);
        setGenProgress(100);
        setIsGenerating(false);
        toast.error('Razorpay API unavailable — switched to Demo Mode.', { id: 'rzp-sync' });
        return; 
      }

      toast.loading('Loading persisted records from database...', { id: 'rzp-sync' });
      const fetchResult = await fetchPersistedPayments();
      
      clearInterval(progressInterval);
      setGenProgress(100);
      
      if (fetchResult.success) {
        setPayments(fetchResult.data.payments || []);
        setSettlements(fetchResult.data.settlements || []);
        setActiveDataset('RAZORPAY');
        setDataMode('RAZORPAY', 'MANUAL');
        markDataGenerated();
        setDataGenerated(true);
        await fetchPersistedReconciledData();
        toast.success(`Razorpay Test Mode connected — data synchronized.`, { id: 'rzp-sync' });
      } else {
        throw new Error(fetchResult.message || 'Failed to fetch persisted data');
      }
    } catch (dbErr) {
      setGenProgress(0);
      console.error("Database/Supabase failure:", dbErr);
      toast.error('Database error: ' + dbErr.message, { id: 'rzp-sync' });
    } finally {
      setIsGenerating(false);
    }
  };

  const executeDataGeneration = async () => {
    setIsGenerating(true);
    setGenProgress(0);
    setResults(null);
    try {
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

  const runGuardRef = React.useRef(false);

  const handleRunReconciliation = async () => {
    const reconciliationRunId = crypto.randomUUID();
    console.log('[RECON] Started', { reconciliationRunId, timestamp: Date.now() });

    if (runGuardRef.current) {
      console.warn('[RECON] Duplicate invocation blocked by useRef run-guard', { reconciliationRunId });
      // We return here to prevent actual duplicate execution as defensive hardening,
      // but the log proves whether multiple invocations were actually happening.
      return;
    }
    runGuardRef.current = true;

    setIsReconciling(true);
    setReconProgress(0);
    const startTime = Date.now();
    console.log('[RECON_TIMELINE]', { runId: reconciliationRunId, phase: 'RUN_STARTED', timestamp: startTime, elapsedMs: 0 });

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
      let hasShownAINotRequiredToast = false;
      let hasShownUnexplainedToast = false;
      let hasShownAIUnavailableToast = false;

      let hasShownTimeoutToast = false;
      const count = payments.length;
      setTotalRecords(count);

      console.log('[RECON_TIMELINE]', { runId: reconciliationRunId, phase: 'DETERMINISTIC_PHASE_STARTED', elapsedMs: Date.now() - startTime });
      // Step 1: Deterministic reconciliation (Fully synchronous block)
      setReconStep('Running deterministic matching...');
      const { reconciliations: reconResults, stats } = reconcileBatch(payments, settlements, config);
      
      console.log('[RECON_TIMELINE]', { runId: reconciliationRunId, phase: 'DETERMINISTIC_PHASE_COMPLETED', totalProcessed: stats.total, matchedCount: stats.matched, needsAiCount: stats.needsAI, elapsedMs: Date.now() - startTime });

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

      // Step 2: AI investigation for ambiguous cases
      setReconStep('Investigating exceptions with AI...');
      
      // Kept at 2 as an independent hardening measure for NVIDIA stability, 
      // but returning to the 'currentIndex' architecture to verify the cancellation cause.
      const CONCURRENCY_LIMIT = 2; 

      const aiTasks = reconResults.filter(
        (recon) =>
          recon.status === RECON_STATUS.AMOUNT_MISMATCH && !recon._isDeterministic
      );
      
      console.log('[RECON_TIMELINE]', { runId: reconciliationRunId, phase: 'AI_TASKS_CREATED', initialProgressCounter: processed, totalAiTasks: aiTasks.length, elapsedMs: Date.now() - startTime });

      // Reverting to the shared index architecture to instrument it and see if 
      // index races or unawaited promises actually occur during runtime.
      let currentIndex = 0;
      let taskSeq = 0; 


      const runWorker = async (workerId) => {
        while (currentIndex < aiTasks.length) {
          const recon = aiTasks[currentIndex++];
          
          if (!recon) {
            console.log(`[WORKER ${workerId}] No task found at incremented index`, { reconciliationRunId });
            break;
          }

          const requestId = `recon-${reconciliationRunId.slice(0,4)}-${++taskSeq}`;
          console.log(`[WORKER ${workerId}] Investigation task started`, { requestId, paymentId: recon.payment_id });

          const payment = payments.find((p) => p.payment_id === recon.payment_id);
          const settlement = settlements.find((s) => s.payment_id === recon.payment_id);

          // Build structured evidence for AI
          const evidence = {
            requestId,
            payment,
            settlement,
            expectedAmount: recon.expected_amount,
            actualAmount: recon.actual_amount,
            difference: recon.difference,
            knownFees: settlement?.fee || 0,
            knownTax: settlement?.tax || 0,
            knownRefund: settlement?.refund || 0,
            knownAdjustment: settlement?.adjustment || 0,
            isDemoData: getActiveDataset() === 'SYNTHETIC',
          };

          let aiResult;
          try {
            aiResult = await investigateException(evidence);
            console.log(`[WORKER ${workerId}] Investigation completed normally`, { requestId });
          } catch (workerErr) {
            console.error(`[WORKER ${workerId}] Investigation threw unexpectedly`, { requestId, error: workerErr?.message });
            
            aiResult = {
              classification: 'AI_UNAVAILABLE',
              confidence: 0,
              recommendedAction: AI_ACTIONS.NEEDS_REVIEW,
              errorType: 'GENERAL_FAILURE',
              explanation: `AI investigation error: ${
                workerErr instanceof Error ? workerErr.message : String(workerErr)
              }`,
              likelyCause: null,
              evidence: [],
              ai_provider: getStore().aiProvider,
              _recovered: false,
            };
          }

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

            if (aiResult.classification === 'AI_UNAVAILABLE') {
              if (aiResult.errorType === 'TIMEOUT' && !hasShownTimeoutToast) {
                toast.error('AI investigation timed out — payment requires manual review.');
                hasShownTimeoutToast = true;
              } else if (aiResult.errorType !== 'TIMEOUT' && !hasShownAIUnavailableToast) {
                toast.error('AI investigation unavailable — payment requires manual review.');
                hasShownAIUnavailableToast = true;
              }
            } else if (
              aiResult.classification === 'UNEXPLAINED_DISCREPANCY' &&
              !hasShownUnexplainedToast
            ) {
              toast('AI identified an unexplained discrepancy — payment requires review.', {
                icon: '⚠️',
              });
              hasShownUnexplainedToast = true;
            } else if (!hasShownAISuccessToast) {
              const aiName =
                aiResult.ai_provider === 'GEMINI'
                  ? 'NVIDIA AI'
                  : aiResult.ai_provider === 'NVIDIA'
                  ? 'NVIDIA AI'
                  : 'AI';
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

          if (
            aiResult.confidence >=
              (config.confidenceThreshold || DEFAULT_CONFIG.CONFIDENCE_THRESHOLD) &&
            aiResult.recommendedAction === AI_ACTIONS.AUTO_RESOLVE
          ) {
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
      };

      const workers = [];
      for (let i = 0; i < CONCURRENCY_LIMIT; i++) {
        workers.push(runWorker(i));
      }
      await Promise.all(workers);



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
      const resolutionRate = dashStats.total > 0 
        ? (dashStats.resolutionRate * 100).toFixed(1)
        : '0.0';
      
      const duration = Date.now() - startTime;

      addAuditLog({
        id: generateId(),
        reconciliation_id: null,
        event_type: EVENT_TYPES.BATCH_COMPLETED,
        actor: ACTORS.SYSTEM,
        action: `Batch reconciliation completed in ${formatDuration(duration)}`,
        input_snapshot: { total: count, duration },
        reasoning: `Resolution rate: ${resolutionRate}%`,
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
        resolutionRate,
      });

      setReconStep('');
      
      const aiFailureCount = reconResults.filter(
        (r) => r.ai_analysis?.classification === 'AI_UNAVAILABLE'
      ).length;

      if (aiFailureCount > 0) {
        toast.error(
          `Reconciliation completed with ${aiFailureCount} AI investigation failure${aiFailureCount > 1 ? 's' : ''}. Affected transactions were escalated for manual review. You may rerun reconciliation to retry.`,
          { duration: 8000 }
        );
      } else {
        toast.success(`Reconciliation completed. Resolution rate: ${resolutionRate}%`);
      }
      
      if (stats.missingSettlement > 0) {
        toast(`Missing settlement records: ${stats.missingSettlement} — manual review required.`, {
          icon: '⚠️',
          duration: 6000,
        });
      }

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
      runGuardRef.current = false;
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
                onClick={handleDataActionClick}
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
        {/* Step 1: Generate/Sync Data */}
        <div className="card p-6" style={{ borderTop: '4px solid var(--primary)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div style={{ backgroundColor: 'var(--primary-subtle)', padding: '0.625rem', borderRadius: '0.5rem' }}>
              <Database style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary-text)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {isSupabaseConfigured ? '1. Sync Data' : '1. Generate Data'}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {dataGenerated 
                  ? `${getStore().payments.length} ${getActiveDataset() === 'SYNTHETIC' ? 'synthetic' : 'Razorpay'} records` 
                  : (isSupabaseConfigured ? 'Fetch Razorpay records' : '100 synthetic records')}
              </p>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {isSupabaseConfigured 
              ? 'Fetch live payment and settlement records from the Razorpay API.' 
              : 'Create realistic payment and settlement records with known ground truth for testing.'}
          </p>
          <button
            onClick={handleDataActionClick}
            disabled={isGenerating || isReconciling}
            className="btn-primary w-full justify-center"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>
              {isGenerating 
                ? (isSupabaseConfigured ? 'Syncing...' : 'Generating...') 
                : dataGenerated 
                  ? (isSupabaseConfigured ? 'Sync Latest Data' : 'Regenerate Data') 
                  : (isSupabaseConfigured ? 'Sync Razorpay Records' : 'Generate 100 Records')}
            </span>
          </button>
          
          {isSupabaseConfigured && !isGenerating && (
            <button 
              onClick={handleForceDemoClick}
              className="mt-4 text-sm w-full text-center font-medium rounded-lg py-2 transition-colors border"
              style={{ 
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-surface-2)',
                borderColor: 'var(--border)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-3)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-2)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              Want to test with Demo Data instead?
            </button>
          )}

          {isGenerating && (
            <div className="mt-4">
              <ProgressBar current={genProgress} total={100} label={isSupabaseConfigured ? "Fetching from API..." : "Generating records..."} />
            </div>
          )}
          {dataGenerated && !isGenerating && (
            <div className="mt-4 flex items-center text-sm font-medium" style={{ color: 'var(--success)' }}>
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> 
              {`${getStore().payments.length} ${getActiveDataset() === 'SYNTHETIC' ? 'synthetic' : 'Razorpay'} record${getStore().payments.length === 1 ? '' : 's'} ready`}
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
                { label: 'Resolution Rate', value: `${results.resolutionRate}%`,     color: 'var(--success)'        },
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
                <button onClick={() => navigate('/dashboard')} className="btn-primary w-full justify-center text-sm">
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
              <KPICard title="Auto-Matched" value={formatNumber(results.matched)}         icon={CheckCircle2}   color="green"  />
              <KPICard title="AI Resolved"  value={formatNumber(results.aiResolved)}      icon={Brain}          color="purple" />
              <KPICard title="Needs Review" value={formatNumber(results.needsReview)}     icon={AlertTriangle}  color="amber"  />
              <KPICard title="Unresolved"   value={formatNumber(results.unresolved || 0)} icon={AlertTriangle}  color="red"    />
              <KPICard title="Processing"   value={formatDuration(results.duration)}      icon={Zap}            color="slate"  />
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowResetModal(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="reset-title"
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: 'var(--danger-subtle)',
                    color: 'var(--danger)',
                  }}
                >
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h3
                  id="reset-title"
                  className="text-lg font-bold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {pendingActionType === 'DEMO_FALLBACK' || !isSupabaseConfigured ? 'Generate New Dataset?' : 'Sync Razorpay Dataset?'}
                </h3>
                <p
                  className="text-sm mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {pendingActionType === 'DEMO_FALLBACK' || !isSupabaseConfigured 
                    ? 'You are about to generate 100 new synthetic records and start a fresh workflow.' 
                    : 'You are about to fetch live Razorpay records and start a fresh workflow.'}
                </p>
                <div className="p-3 rounded-lg mb-6 w-full text-left" style={{ backgroundColor: 'var(--danger-subtle)', border: '1px solid var(--danger-border)' }}>
                  <p className="text-xs" style={{ color: 'var(--danger)' }}>
                    <strong>Warning:</strong> All workflow data from the previous run will be cleared. Settings remain unchanged.
                  </p>
                </div>
                <div className="flex w-full gap-3">
                  <button
                    onClick={() => setShowResetModal(false)}
                    className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-surface-2)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface-3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface-2)';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmReset}
                    className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors text-white"
                    style={{ backgroundColor: 'var(--danger)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.filter = 'brightness(0.9)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.filter = 'none';
                    }}
                  >
                    {pendingActionType === 'DEMO_FALLBACK' || !isSupabaseConfigured ? 'Reset & Generate' : 'Reset & Sync'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReconciliationPage;

