import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { getConfig, updateConfig, getActiveDataset } from '../services/dataService';
import { getInfrastructureLabel, isSupabaseConfigured } from '../services/supabase';
import { useAuth } from '../hooks/useAuth.jsx';
import { getAIMode } from '../services/aiService';
import { Settings, Save, Shield, Database, Brain, CreditCard, CheckCircle2, XCircle, Zap, MousePointer2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCursorContext } from '../contexts/CursorContext.jsx';

const SettingsPage = () => {
  const [config, setConfig] = useState(getConfig());
  const { preference, updatePreference } = useCursorContext();
  const { userProfile } = useAuth();

  const handleSave = () => {
    updateConfig(config);
    toast.success('Settings saved successfully');
  };

  const integrations = [
    {
      name: 'Supabase Database',
      icon: Database,
      connected: isSupabaseConfigured,
      status: isSupabaseConfigured ? 'Connected' : 'Not Configured',
      detail: isSupabaseConfigured ? 'Managed backend' : 'Backend not configured',
    },
    {
      name: 'AI Provider (NVIDIA)',
      icon: Brain,
      connected: isSupabaseConfigured,
      status: isSupabaseConfigured ? 'Connected' : 'Not Configured',
      detail: isSupabaseConfigured ? 'Edge Function → NVIDIA NIM (Nemotron)' : 'Using rule-based mock responses',
    },
    {
      name: 'Razorpay',
      icon: CreditCard,
      connected: isSupabaseConfigured,
      status: isSupabaseConfigured ? 'Connected — Test Mode' : 'Not Configured',
      detail: isSupabaseConfigured ? 'Edge Function → Razorpay Test API' : 'No connection available',
    },
  ];

  const navigate = useNavigate();
  const dataset = getActiveDataset();
  let datasetLabel = 'No Data Loaded';
  let datasetDetail = 'Go to Reconciliation to load data.';
  if (dataset === 'SYNTHETIC') {
    datasetLabel = 'Synthetic Demo Data';
    datasetDetail = 'Using generated 100 records.';
  } else if (dataset === 'RAZORPAY') {
    datasetLabel = 'Razorpay Test Data';
    datasetDetail = 'Live records synced from Razorpay Test API.';
  }

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    marginBottom: '0.5rem',
  };

  const hintStyle = {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.5rem',
  };

  const cardTitleStyle = {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto page-enter">
      <div>
        <h1 className="page-title">System Configuration</h1>
        <p className="page-subtitle">Manage reconciliation parameters and view integration status.</p>
      </div>

      {/* Current Mode Banner */}
      <div
        style={{
          borderRadius: '0.75rem',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: isSupabaseConfigured ? 'var(--primary-subtle)' : 'var(--warning-subtle)',
          border: `1px solid color-mix(in srgb, ${isSupabaseConfigured ? 'var(--primary)' : 'var(--warning)'} 30%, transparent)`,
        }}
      >
        <Zap
          style={{
            width: '1.25rem',
            height: '1.25rem',
            color: isSupabaseConfigured ? 'var(--primary-text)' : 'var(--warning)',
            flexShrink: 0,
          }}
        />
        <div>
          <p style={{ fontWeight: 600, color: isSupabaseConfigured ? 'var(--primary-text)' : 'var(--warning-text)' }}>
            System Integration: {getInfrastructureLabel()}
          </p>
          <p style={{ fontSize: '0.875rem', color: isSupabaseConfigured ? 'var(--primary-text)' : 'var(--warning-text)', opacity: 0.8, marginTop: '0.125rem' }}>
            {isSupabaseConfigured
              ? 'Connected to Supabase + NVIDIA AI (Nemotron) + Razorpay Test Mode'
              : 'Integrations not configured. Core engine will work offline.'}
          </p>
        </div>
      </div>

      {/* Current Data Source */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database style={{ width: '1.125rem', height: '1.125rem', color: 'var(--text-muted)' }} />
            <h2 style={cardTitleStyle}>Current Dataset</h2>
          </div>
          <button onClick={() => navigate('/reconciliation')} className="btn-primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
            Go to Data Loading
          </button>
        </div>
        <div className="card-body">
          <div
            style={{
              padding: '1rem',
              border: '1px solid var(--border)',
              borderRadius: '0.75rem',
              backgroundColor: 'var(--bg-surface-2)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <div
              style={{
                padding: '0.5rem',
                borderRadius: '0.5rem',
                backgroundColor: dataset ? (dataset === 'SYNTHETIC' ? 'var(--warning-subtle)' : 'var(--success-subtle)') : 'var(--bg-surface-3)',
              }}
            >
              <Database style={{ width: '1.125rem', height: '1.125rem', color: dataset ? (dataset === 'SYNTHETIC' ? 'var(--warning)' : 'var(--success)') : 'var(--text-muted)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {datasetLabel}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                {datasetDetail}
              </p>
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => {
                navigate('/reconciliation');
                // The actual switch is performed in ReconciliationPage manually, but we can provide a shortcut here later.
              }}
              className="btn-secondary" 
              style={{ fontSize: '0.75rem' }}
            >
              Data controls are available in the Reconciliation Engine
            </button>
          </div>
        </div>
      </div>

      {/* Reconciliation Settings */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings style={{ width: '1.125rem', height: '1.125rem', color: 'var(--text-muted)' }} />
          <h2 style={cardTitleStyle}>Reconciliation Engine Settings</h2>
        </div>
        <div className="card-body space-y-6">
          <div>
            <label style={labelStyle}>
              AI Confidence Threshold:{' '}
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                {(config.confidenceThreshold * 100).toFixed(0)}%
              </span>
            </label>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.01"
              value={config.confidenceThreshold}
              onChange={(e) => setConfig({ ...config, confidenceThreshold: parseFloat(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', ...hintStyle, marginTop: '0.25rem' }}>
              <span>50% (More auto-resolve)</span>
              <span>100% (All human review)</span>
            </div>
            <p style={hintStyle}>
              AI recommendations with confidence below this threshold require human approval.
            </p>
          </div>

          <div>
            <label style={labelStyle}>Tolerance Amount (₹)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={config.toleranceAmount}
              onChange={(e) => setConfig({ ...config, toleranceAmount: parseFloat(e.target.value) })}
              className="input"
              style={{ width: '12rem' }}
            />
            <p style={hintStyle}>
              Maximum allowed rounding difference (in ₹) for a transaction to be considered matched.
            </p>
          </div>

          <button onClick={handleSave} className="btn-primary">
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </div>

      {/* Cursor Settings */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MousePointer2 style={{ width: '1.125rem', height: '1.125rem', color: 'var(--text-muted)' }} />
          <h2 style={cardTitleStyle}>Cursor Experience</h2>
        </div>
        <div className="card-body">
          <p style={hintStyle} className="mb-4">
            Personalize how you interact with IniRazorAI. The custom ₹ cursor provides a premium fintech experience.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => updatePreference('rupee')}
              className={`flex flex-col items-center text-center p-4 rounded-xl border transition-all ${preference === 'rupee' ? 'border-[var(--primary)] bg-[var(--primary-subtle)]' : 'border-[var(--border)] hover:border-[var(--primary)] bg-[var(--bg-surface-2)]'} focus:outline-none focus:ring-2 focus:ring-[var(--primary)]`}
            >
              <div className="w-12 h-12 rounded-full border border-[var(--primary)] flex items-center justify-center mb-3 bg-[var(--bg-surface)]">
                 <span className="font-extrabold text-[var(--text-primary)] text-lg" style={{ textShadow: '0 0 2px var(--bg-surface), -1px -1px 0 var(--bg-surface), 1px -1px 0 var(--bg-surface), -1px 1px 0 var(--bg-surface), 1px 1px 0 var(--bg-surface)' }}>₹</span>
              </div>
              <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-1">₹ Rupee Cursor</h3>
              <p className="text-xs text-[var(--text-muted)]">A custom cursor designed for the IniRazorAI experience.</p>
            </button>

            <button 
              onClick={() => updatePreference('default')}
              className={`flex flex-col items-center text-center p-4 rounded-xl border transition-all ${preference === 'default' ? 'border-[var(--text-primary)] bg-[var(--bg-surface-2)] shadow-sm' : 'border-[var(--border)] hover:border-[var(--text-primary)] bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface)]'} focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]`}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                 <MousePointer2 className="w-5 h-5 text-[var(--text-secondary)]" />
              </div>
              <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-1">Normal Cursor</h3>
              <p className="text-xs text-[var(--text-muted)]">Use your device's default cursor.</p>
            </button>
          </div>
        </div>
      </div>

      {/* Integration Status */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield style={{ width: '1.125rem', height: '1.125rem', color: 'var(--text-muted)' }} />
          <h2 style={cardTitleStyle}>Integration Status</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {integrations.map((item) => (
              <div
                key={item.name}
                style={{
                  padding: '1rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.75rem',
                  backgroundColor: 'var(--bg-surface-2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      backgroundColor: 'var(--primary-subtle)',
                    }}
                  >
                    <item.icon style={{ width: '1.125rem', height: '1.125rem', color: 'var(--primary-text)' }} />
                  </div>
                  <h3 style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.name}
                  </h3>
                  {item.connected
                    ? <CheckCircle2 style={{ width: '1.125rem', height: '1.125rem', color: 'var(--success)', flexShrink: 0 }} />
                    : <XCircle style={{ width: '1.125rem', height: '1.125rem', color: 'var(--text-muted)', flexShrink: 0 }} />
                  }
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: item.connected ? 'var(--success)' : 'var(--text-muted)' }}>
                  {item.status}
                </p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Account / Demo Credentials */}
      <div className="card">
        <div className="card-header">
          <h2 style={cardTitleStyle}>
            {isSupabaseConfigured ? 'Authenticated Account' : 'Demo Credentials'}
          </h2>
        </div>
        <div className="card-body">
          {isSupabaseConfigured && userProfile ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                backgroundColor: 'var(--bg-surface-2)',
                borderRadius: '0.625rem',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt="Avatar"
                  style={{ width: '3rem', height: '3rem', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-subtle)',
                    color: 'var(--primary-text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                  }}
                >
                  {(userProfile.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {userProfile.name}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {userProfile.email}
                </p>
                <div
                  style={{
                    marginTop: '0.375rem',
                    display: 'inline-block',
                    padding: '0.125rem 0.5rem',
                    backgroundColor: 'var(--bg-surface-3)',
                    borderRadius: '1rem',
                    fontSize: '0.6875rem',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {userProfile.providerLabel}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { role: 'Finance Admin', email: 'admin@inirazor.ai', pass: 'admin123', desc: 'Full access: reconciliation, approvals, settings' },
                { role: 'Finance Reviewer', email: 'reviewer@inirazor.ai', pass: 'review123', desc: 'View transactions, review exceptions' },
              ].map((cred) => (
                <div
                  key={cred.role}
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--bg-surface-2)',
                    borderRadius: '0.625rem',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {cred.role}
                  </p>
                  <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                    {cred.email} / {cred.pass}
                  </p>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {cred.desc}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
