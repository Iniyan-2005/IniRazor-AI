import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { generateSyntheticData } from '../utils/syntheticDataGenerator';
import { reconcileBatch } from '../services/reconciliationEngine';
import { investigateException, getAIMode } from '../services/aiService';
import { syncRazorpayData } from '../services/razorpayService';
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
  formatCurrency,
  formatNumber,
  formatDuration,
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

      const { payments, settlements } = generateSyntheticData(500);
      clearInterval(progressInterval);
      setGenProgress(100);

      setPayments(payments);
      setSettlements(settlements);
      markDataGenerated();

      addAuditLog({
        id: generateId(),
        reconciliation_id: null,
        event_type: EVENT_TYPES.DATA_GENERATED,
        actor: ACTORS.SYSTEM,
        action: 'Generated 500 synthetic payment and settlement records',
        input_snapshot: { count: 500 },
        reasoning: 'Synthetic data generated for reconciliation testing',
        decision: 'DATA_READY',
        confidence: 1.0,
        created_at: new Date().toISOString(),
      });

      setDataGenerated(true);
      toast.success('500 synthetic records generated successfully');
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

    try {
      const store = getStore();
      const payments = store.payments;
      const settlements = store.settlements;
      const config = store.config;
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
          };

          const aiResult = await investigateException(evidence);
          recon.ai_analysis = aiResult;

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
    } catch (error) {
      console.error(error);
      toast.error('Reconciliation failed: ' + error.message);
    } finally {
      setIsReconciling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reconciliation Engine</h1>
            <p className="text-slate-500 mt-1">Generate synthetic data, run the deterministic engine, and investigate exceptions with AI.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* AI Mode indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium border border-purple-200">
              <Bot className="w-3.5 h-3.5" />
              {getAIMode()}
            </div>
            {/* Razorpay Sync button */}
            {isSupabaseConfigured && (
              <button
                onClick={async () => {
                  try {
                    toast.loading('Syncing with Razorpay...', { id: 'rzp-sync' });
                    const result = await syncRazorpayData();
                    toast.dismiss('rzp-sync');
                    if (result.success) {
                      toast.success(`${result.message}`);
                    } else {
                      toast.error(result.message || 'Razorpay sync returned no data');
                    }
                  } catch (err) {
                    toast.dismiss('rzp-sync');
                    toast.error('Razorpay sync failed: ' + err.message);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Sync Razorpay Data
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Generate Data */}
        <div className="card p-6 border-t-4 border-primary-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary-100 p-2.5 rounded-lg">
              <Database className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">1. Generate Data</h2>
              <p className="text-xs text-slate-500">500 synthetic records</p>
            </div>
          </div>
          <p className="text-slate-600 mb-4 text-sm">
            Create realistic payment and settlement records with known ground truth for testing.
          </p>
          <button
            onClick={handleGenerateData}
            disabled={isGenerating || isReconciling}
            className="btn-primary w-full justify-center"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>{isGenerating ? 'Generating...' : dataGenerated ? 'Regenerate Data' : 'Generate 500 Records'}</span>
          </button>
          {isGenerating && (
            <div className="mt-4">
              <ProgressBar current={genProgress} total={100} label="Generating records..." />
            </div>
          )}
          {dataGenerated && !isGenerating && (
            <div className="mt-4 flex items-center text-sm text-emerald-600 font-medium">
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> 500 records ready
            </div>
          )}
        </div>

        {/* Step 2: Run Reconciliation */}
        <div className={`card p-6 border-t-4 ${dataGenerated ? 'border-purple-500' : 'border-slate-200 opacity-60'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2.5 rounded-lg ${dataGenerated ? 'bg-purple-100' : 'bg-slate-100'}`}>
              <Zap className={`w-5 h-5 ${dataGenerated ? 'text-purple-600' : 'text-slate-400'}`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">2. Run Reconciliation</h2>
              <p className="text-xs text-slate-500">Deterministic + AI</p>
            </div>
          </div>
          <p className="text-slate-600 mb-4 text-sm">
            Execute rule-based matching, then invoke AI for ambiguous discrepancies.
          </p>
          <button
            onClick={handleRunReconciliation}
            disabled={!dataGenerated || isReconciling}
            className={`w-full justify-center ${dataGenerated ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'} font-medium px-4 py-2 rounded-lg transition-colors duration-150 flex items-center gap-2`}
          >
            {isReconciling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{isReconciling ? 'Processing...' : 'Run Reconciliation'}</span>
          </button>
          {isReconciling && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{reconStep}</span>
                <span>{Math.round((reconProgress / 100) * totalRecords)}/{totalRecords}</span>
              </div>
              <ProgressBar current={reconProgress} total={100} label={reconStep} />
            </div>
          )}
        </div>

        {/* Step 3: View Results */}
        <div className={`card p-6 border-t-4 ${results ? 'border-emerald-500' : 'border-slate-200 opacity-60'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2.5 rounded-lg ${results ? 'bg-emerald-100' : 'bg-slate-100'}`}>
              <BarChart3 className={`w-5 h-5 ${results ? 'text-emerald-600' : 'text-slate-400'}`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">3. View Results</h2>
              <p className="text-xs text-slate-500">Metrics & analysis</p>
            </div>
          </div>
          {results ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Records:</span>
                <span className="font-semibold">{formatNumber(results.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Match Rate:</span>
                <span className="font-semibold text-emerald-600">{results.matchRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">AI Resolved:</span>
                <span className="font-semibold text-blue-600">{formatNumber(results.aiResolved)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Needs Review:</span>
                <span className="font-semibold text-amber-600">{formatNumber(results.needsReview)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Duration:</span>
                <span className="font-medium">{formatDuration(results.duration)}</span>
              </div>
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
            <p className="text-sm text-slate-400 italic">Run reconciliation to see results.</p>
          )}
        </div>
      </div>

      {/* Results Summary */}
      {results && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-slate-900">Reconciliation Summary</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <KPICard title="Total" value={formatNumber(results.total)} icon={Database} color="blue" />
              <KPICard title="Matched" value={formatNumber(results.matched)} icon={CheckCircle2} color="green" />
              <KPICard title="AI Resolved" value={formatNumber(results.aiResolved)} icon={Brain} color="purple" />
              <KPICard title="Needs Review" value={formatNumber(results.needsReview)} icon={AlertTriangle} color="amber" />
              <KPICard title="Unresolved" value={formatNumber(results.unresolved || 0)} icon={AlertTriangle} color="red" />
              <KPICard title="Processing" value={formatDuration(results.duration)} icon={Zap} color="slate" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReconciliationPage;
