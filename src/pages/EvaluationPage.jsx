import React, { useMemo } from 'react';
import { getStore } from '../services/dataService';
import KPICard from '../components/KPICard';
import { formatNumber } from '../utils/formatters';
import { RECON_STATUS, GROUND_TRUTH } from '../utils/constants';
import { BarChart, CheckCircle, XCircle, AlertCircle, Percent } from 'lucide-react';

const EvaluationPage = () => {
  const { payments, reconciliations } = getStore();

  const metrics = useMemo(() => {
    if (reconciliations.length === 0) return null;

    let correct = 0;
    let incorrect = 0;
    let unresolvedCount = 0;
    
    let tp = 0; // True Positive: System Resolved, Ground Truth Resolved
    let fp = 0; // False Positive: System Resolved, Ground Truth Unresolved
    let tn = 0; // True Negative: System Unresolved, Ground Truth Unresolved
    let fn = 0; // False Negative: System Unresolved, Ground Truth Resolved

    reconciliations.forEach(recon => {
      const payment = payments.find(p => p.payment_id === recon.payment_id);
      if (!payment) return;

      const isSystemResolved = recon.status === RECON_STATUS.MATCHED || recon.status === RECON_STATUS.AI_RESOLVED;
      const isGroundTruthResolved = payment.ground_truth_status === GROUND_TRUTH.SHOULD_MATCH;

      if (isSystemResolved && isGroundTruthResolved) {
        tp++;
        correct++;
      } else if (isSystemResolved && !isGroundTruthResolved) {
        fp++;
        incorrect++;
      } else if (!isSystemResolved && !isGroundTruthResolved) {
        tn++;
        correct++;
        unresolvedCount++;
      } else if (!isSystemResolved && isGroundTruthResolved) {
        fn++;
        incorrect++;
        unresolvedCount++;
      }
    });

    const total = reconciliations.length;
    const accuracy = total > 0 ? correct / total : 0;
    const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
    const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
    const f1 = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;

    return {
      total,
      correct,
      incorrect,
      unresolved: unresolvedCount,
      accuracy,
      precision,
      recall,
      f1,
      matrix: { tp, fp, tn, fn }
    };
  }, [payments, reconciliations]);

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow border border-gray-200">
        <BarChart className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">No Evaluation Data</h2>
        <p className="text-gray-500 mt-2">Run reconciliation first to view performance metrics.</p>
      </div>
    );
  }

  const formatPercent = (val) => `${(val * 100).toFixed(2)}%`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Evaluation Dashboard</h1>
        <p className="text-gray-500">System performance measured against ground truth data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Accuracy" value={formatPercent(metrics.accuracy)} icon={Percent} />
        <KPICard title="Precision" value={formatPercent(metrics.precision)} icon={Percent} />
        <KPICard title="Recall" value={formatPercent(metrics.recall)} icon={Percent} />
        <KPICard title="F1 Score" value={formatPercent(metrics.f1)} icon={Percent} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <BarChart className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Total Evaluated</div>
            <div className="text-2xl font-semibold">{formatNumber(metrics.total)}</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-full">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Correctly Classified</div>
            <div className="text-2xl font-semibold">{formatNumber(metrics.correct)}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 bg-red-100 rounded-full">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Incorrectly Classified</div>
            <div className="text-2xl font-semibold">{formatNumber(metrics.incorrect)}</div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-800">Confusion Matrix</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-1 text-center max-w-2xl mx-auto">
            <div className="p-4"></div>
            <div className="p-4 font-semibold text-gray-700 border-b border-gray-300">Actual: Resolved</div>
            <div className="p-4 font-semibold text-gray-700 border-b border-gray-300">Actual: Problematic</div>
            
            <div className="p-4 font-semibold text-gray-700 border-r border-gray-300 flex items-center justify-end">System: Resolved</div>
            <div className="p-6 bg-green-50 border border-green-200 rounded text-green-900">
              <div className="text-2xl font-bold">{metrics.matrix.tp}</div>
              <div className="text-xs mt-1">True Positive</div>
            </div>
            <div className="p-6 bg-red-50 border border-red-200 rounded text-red-900">
              <div className="text-2xl font-bold">{metrics.matrix.fp}</div>
              <div className="text-xs mt-1">False Positive</div>
            </div>
            
            <div className="p-4 font-semibold text-gray-700 border-r border-gray-300 flex items-center justify-end">System: Review</div>
            <div className="p-6 bg-red-50 border border-red-200 rounded text-red-900">
              <div className="text-2xl font-bold">{metrics.matrix.fn}</div>
              <div className="text-xs mt-1">False Negative</div>
            </div>
            <div className="p-6 bg-green-50 border border-green-200 rounded text-green-900">
              <div className="text-2xl font-bold">{metrics.matrix.tn}</div>
              <div className="text-xs mt-1">True Negative</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationPage;
