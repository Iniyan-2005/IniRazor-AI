import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { FileText, CheckCircle2, Brain, AlertTriangle, XCircle, AlertOctagon, Clock, ArrowRight } from 'lucide-react';

import KPICard from '../components/KPICard';
import ReconciliationStatusChart from '../charts/ReconciliationStatusChart';
import ExceptionBreakdownChart from '../charts/ExceptionBreakdownChart';
import ProcessingPerformanceChart from '../charts/ProcessingPerformanceChart';

import { getDashboardStats, isReady } from '../services/dataService';
import { formatCurrency, formatPercent, formatDuration, formatNumber } from '../utils/formatters';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    const ready = isReady();
    setDataReady(ready);
    if (ready) {
      setStats(getDashboardStats());
    }
  }, []);

  if (!dataReady || !stats) {
    return (
      <div className="page-enter flex flex-col items-center justify-center min-h-[60vh]">
        <div className="empty-state max-w-sm w-full">
          <div className="empty-state-icon">
            <Brain style={{ width: '1.75rem', height: '1.75rem' }} />
          </div>
          <div>
            <h2 className="empty-state-title">No reconciliation data yet</h2>
            <p className="empty-state-desc">
              Generate data and run reconciliation to see your financial overview.
            </p>
          </div>
          <button onClick={() => navigate('/reconciliation')} className="btn-primary">
            Go to Reconciliation
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const prefersReducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 4 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">AI-powered reconciliation insights for your payment operations.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button onClick={() => navigate('/evaluation')} className="btn-secondary">
            View Evaluation
          </button>
          <button onClick={() => navigate('/reconciliation')} className="btn-primary">
            Run Reconciliation
          </button>
        </div>
      </div>

      {/* KPI grid — staggered entrance */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <motion.div variants={itemVariants}>
          <KPICard
            title="Total Records"
            value={formatNumber(stats.total)}
            icon={FileText}
            color="blue"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KPICard
            title="Match Rate"
            value={formatPercent(stats.matchRate)}
            icon={CheckCircle2}
            color="green"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KPICard
            title="AI Resolved"
            value={formatNumber(stats.aiResolved)}
            icon={Brain}
            color="purple"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KPICard
            title="Needs Review"
            value={formatNumber(stats.needsReview)}
            icon={AlertTriangle}
            color="amber"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KPICard
            title="Unresolved"
            value={formatNumber(stats.unresolved)}
            icon={XCircle}
            color="red"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KPICard
            title="Exceptions"
            value={formatNumber(stats.exceptions)}
            icon={AlertOctagon}
            color="red"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KPICard
            title="Processing Time"
            value={formatDuration(stats.processingTime)}
            icon={Clock}
            color="slate"
          />
        </motion.div>
      </motion.div>

      {/* Charts row */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.div variants={itemVariants}>
          <ReconciliationStatusChart stats={stats} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <ExceptionBreakdownChart stats={stats} />
        </motion.div>
      </motion.div>

      {/* Full-width chart */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={itemVariants}
      >
        <ProcessingPerformanceChart stats={stats} />
      </motion.div>
    </div>
  );
};

export default DashboardPage;
