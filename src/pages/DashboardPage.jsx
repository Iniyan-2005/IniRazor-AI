import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FileText, CheckCircle2, Brain, AlertTriangle, XCircle, AlertOctagon, Clock } from 'lucide-react';

import KPICard from '../components/KPICard';
import StatusBadge from '../components/StatusBadge';
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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-md">
          <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">No reconciliation data yet</h2>
          <p className="text-slate-600 mb-6">Generate data and run reconciliation to see results.</p>
          <button 
            onClick={() => navigate('/reconciliation')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Go to Reconciliation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">AI Finance Controller</h1>
          <p className="text-slate-600">Reconcile payments, investigate exceptions, and know exactly where your money stands.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => navigate('/evaluation')}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            View Evaluation
          </button>
          <button 
            onClick={() => navigate('/reconciliation')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Run Reconciliation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <KPICard 
          title="Total Records" 
          value={formatNumber(stats.total)} 
          icon={FileText} 
          color="blue"
        />
        <KPICard 
          title="Match Rate" 
          value={formatPercent(stats.matchRate)} 
          icon={CheckCircle2} 
          color="green"
        />
        <KPICard 
          title="AI Resolved" 
          value={formatNumber(stats.aiResolved)} 
          icon={Brain} 
          color="purple"
        />
        <KPICard 
          title="Needs Review" 
          value={formatNumber(stats.needsReview)} 
          icon={AlertTriangle} 
          color="amber"
        />
        <KPICard 
          title="Unresolved" 
          value={formatNumber(stats.unresolved)} 
          icon={XCircle} 
          color="red"
        />
        <KPICard 
          title="Exceptions" 
          value={formatNumber(stats.exceptions)} 
          icon={AlertOctagon} 
          color="red"
        />
        <KPICard 
          title="Processing Time" 
          value={formatDuration(stats.processingTime)} 
          icon={Clock} 
          color="slate"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReconciliationStatusChart stats={stats} />
        <ExceptionBreakdownChart stats={stats} />
      </div>

      <div className="w-full">
        <ProcessingPerformanceChart stats={stats} />
      </div>
    </div>
  );
};

export default DashboardPage;
