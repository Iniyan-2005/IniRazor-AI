import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { getConfig, updateConfig } from '../services/dataService';
import { getEnvironmentLabel, isSupabaseConfigured } from '../services/supabase';
import { getAIMode } from '../services/aiService';
import { Settings, Save, Shield, Database, Brain, CreditCard, CheckCircle2, XCircle, Zap } from 'lucide-react';

const SettingsPage = () => {
  const [config, setConfig] = useState(getConfig());

  const handleSave = () => {
    updateConfig(config);
    toast.success('Settings saved successfully');
  };

  const integrations = [
    {
      name: 'Supabase (PostgreSQL)',
      icon: Database,
      connected: isSupabaseConfigured,
      status: isSupabaseConfigured ? 'Connected' : 'Not Configured (Using In-Memory)',
      detail: isSupabaseConfigured ? import.meta.env.VITE_SUPABASE_URL : 'Add VITE_SUPABASE_URL to .env',
      color: 'blue',
    },
    {
      name: 'AI Provider (Gemini)',
      icon: Brain,
      connected: isSupabaseConfigured, // AI uses Edge Function which needs Supabase
      status: getAIMode(),
      detail: isSupabaseConfigured ? 'Edge Function → Gemini API' : 'Using rule-based mock responses',
      color: 'purple',
    },
    {
      name: 'Razorpay',
      icon: CreditCard,
      connected: isSupabaseConfigured, // Razorpay uses Edge Function
      status: isSupabaseConfigured ? 'Razorpay Test Mode' : 'Demo Mode (Synthetic Data)',
      detail: isSupabaseConfigured ? 'Edge Function → Razorpay Test API' : 'Using 500 synthetic records',
      color: 'green',
    },
  ];
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Configuration</h1>
        <p className="text-slate-500 mt-1">Manage reconciliation parameters and view integration status.</p>
      </div>

      {/* Current Mode Banner */}
      <div className={`rounded-lg p-4 flex items-center gap-3 ${isSupabaseConfigured ? 'bg-blue-50 border border-blue-200' : 'bg-amber-50 border border-amber-200'}`}>
        <Zap className={`w-5 h-5 ${isSupabaseConfigured ? 'text-blue-600' : 'text-amber-600'}`} />
        <div>
          <p className={`font-semibold ${isSupabaseConfigured ? 'text-blue-800' : 'text-amber-800'}`}>{getEnvironmentLabel()}</p>
          <p className={`text-sm ${isSupabaseConfigured ? 'text-blue-600' : 'text-amber-600'}`}>
            {isSupabaseConfigured 
              ? 'Connected to Supabase + Gemini AI + Razorpay Test Mode'
              : 'All features work locally with synthetic data and mock AI'
            }
          </p>
        </div>
      </div>

      {/* Reconciliation Settings */}
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900">Reconciliation Engine Settings</h2>
        </div>
        <div className="card-body space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              AI Confidence Threshold: <span className="text-primary-600 font-semibold">{(config.confidenceThreshold * 100).toFixed(0)}%</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.01"
              value={config.confidenceThreshold}
              onChange={(e) => setConfig({ ...config, confidenceThreshold: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>50% (More auto-resolve)</span>
              <span>100% (All human review)</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              AI recommendations with confidence below this threshold require human approval. Higher = safer but more manual work.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tolerance Amount (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={config.toleranceAmount}
              onChange={(e) => setConfig({ ...config, toleranceAmount: parseFloat(e.target.value) })}
              className="input w-48"
            />
            <p className="text-xs text-slate-500 mt-2">
              Maximum allowed rounding difference (in ₹) for a transaction to be considered matched.
            </p>
          </div>

          <button onClick={handleSave} className="btn-primary">
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {/* Integration Status */}
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <Shield className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900">Integration Status</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {integrations.map((item) => (
              <div key={item.name} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-${item.color}-50`}>
                    <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-900">{item.name}</h3>
                  </div>
                  {item.connected 
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    : <XCircle className="w-5 h-5 text-slate-300" />
                  }
                </div>
                <p className={`text-sm font-medium ${item.connected ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {item.status}
                </p>
                <p className="text-xs text-slate-400 mt-1">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Demo Credentials */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-slate-900">Demo Credentials</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm font-semibold text-slate-700 mb-1">Finance Admin</p>
              <p className="text-xs text-slate-500 font-mono">admin@inirazor.ai / admin123</p>
              <p className="text-xs text-slate-400 mt-1">Full access: reconciliation, approvals, settings</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm font-semibold text-slate-700 mb-1">Finance Reviewer</p>
              <p className="text-xs text-slate-500 font-mono">reviewer@inirazor.ai / review123</p>
              <p className="text-xs text-slate-400 mt-1">View transactions, review exceptions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
