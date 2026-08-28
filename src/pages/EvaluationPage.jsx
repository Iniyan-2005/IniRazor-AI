import React, { useMemo } from 'react';
import { getStore } from '../services/dataService';
import KPICard from '../components/KPICard';
import { formatNumber } from '../utils/formatters';
import { RECON_STATUS, GROUND_TRUTH } from '../utils/constants';
import { BarChart2, CheckCircle2, XCircle, Percent, Target } from 'lucide-react';

const MatrixCell = ({ value, label, positive }) => (
  <div
    style={{
      padding: '1.25rem',
      textAlign: 'center',
      borderRadius: '0.75rem',
      backgroundColor: positive ? 'var(--success-subtle)' : 'var(--danger-subtle)',
      border: `1px solid color-mix(in srgb, ${positive ? 'var(--success)' : 'var(--danger)'} 25%, transparent)`,
      display: 'inline-block',
      minWidth: '5.5rem',
    }}
  >
    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: positive ? 'var(--success)' : 'var(--danger)', fontVariantNumeric: 'tabular-nums' }}>
      {value}
    </div>
    <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: positive ? 'var(--success)' : 'var(--danger)', marginTop: '0.25rem', opacity: 0.8 }}>
      {label}
    </div>
  </div>
);

const EvaluationPage = () => {
  const { payments, reconciliations } = getStore();

  const metrics = useMemo(() => {
    if (reconciliations.length === 0) return null;

    let correct = 0, incorrect = 0, unresolvedCount = 0;
    let tp = 0, fp = 0, tn = 0, fn = 0;

    reconciliations.forEach((recon) => {
      const payment = payments.find((p) => p.payment_id === recon.payment_id);
      if (!payment) return;

      const isSystemResolved =
        recon.status === RECON_STATUS.MATCHED || recon.status === RECON_STATUS.AI_RESOLVED;
      const isGroundTruthResolved = payment.ground_truth_status === GROUND_TRUTH.SHOULD_MATCH;

      if (isSystemResolved && isGroundTruthResolved)       { tp++; correct++; }
      else if (isSystemResolved && !isGroundTruthResolved) { fp++; incorrect++; }
      else if (!isSystemResolved && !isGroundTruthResolved){ tn++; correct++; unresolvedCount++; }
      else if (!isSystemResolved && isGroundTruthResolved) { fn++; incorrect++; unresolvedCount++; }
    });

    const total     = reconciliations.length;
    const accuracy  = total > 0 ? correct / total : 0;
    const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
    const recall    = (tp + fn) > 0 ? tp / (tp + fn) : 0;
    const f1        = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;

    return { total, correct, incorrect, unresolved: unresolvedCount, accuracy, precision, recall, f1, matrix: { tp, fp, tn, fn } };
  }, [payments, reconciliations]);

  const pct = (val) => `${(val * 100).toFixed(2)}%`;

  if (!metrics) {
    return (
      <div className="empty-state min-h-[40vh] flex flex-col items-center justify-center">
        <div className="empty-state-icon">
          <BarChart2 style={{ width: '1.75rem', height: '1.75rem' }} />
        </div>
        <div>
          <p className="empty-state-title">No Evaluation Data</p>
          <p className="empty-state-desc">Run reconciliation first to view performance metrics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="page-title">Evaluation Dashboard</h1>
        <p className="page-subtitle">System performance measured against ground truth data.</p>
      </div>

      {/* ML Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-enter">
        <KPICard title="Accuracy"  value={pct(metrics.accuracy)}  icon={Target}    color="green"  />
        <KPICard title="Precision" value={pct(metrics.precision)} icon={Percent}   color="blue"   />
        <KPICard title="Recall"    value={pct(metrics.recall)}    icon={Percent}   color="purple" />
        <KPICard title="F1 Score"  value={pct(metrics.f1)}        icon={BarChart2} color="amber"  />
      </div>

      {/* Summary counts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard title="Total Evaluated"         value={formatNumber(metrics.total)}     icon={BarChart2}    color="blue"  />
        <KPICard title="Correctly Classified"    value={formatNumber(metrics.correct)}   icon={CheckCircle2} color="green" />
        <KPICard title="Incorrectly Classified"  value={formatNumber(metrics.incorrect)} icon={XCircle}      color="red"   />
      </div>

      {/* Confusion Matrix */}
      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>Confusion Matrix</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
            Predicted vs. ground truth classification
          </p>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table style={{ width: '100%', minWidth: '32rem', maxWidth: '40rem', margin: '0 auto', fontSize: '0.875rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'right' }} />
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                    Actual: Resolved
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                    Actual: Problematic
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', borderRight: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                    System: Resolved
                  </td>
                  <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                    <MatrixCell value={metrics.matrix.tp} label="True Positive"  positive={true} />
                  </td>
                  <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                    <MatrixCell value={metrics.matrix.fp} label="False Positive" positive={false} />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', borderRight: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                    System: Review
                  </td>
                  <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                    <MatrixCell value={metrics.matrix.fn} label="False Negative" positive={false} />
                  </td>
                  <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                    <MatrixCell value={metrics.matrix.tn} label="True Negative"  positive={true} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationPage;
