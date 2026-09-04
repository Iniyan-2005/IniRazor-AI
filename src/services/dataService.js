import { generateId } from '../utils/formatters.js';
import { RECON_STATUS } from '../utils/constants.js';

let store = {
  payments: [],
  settlements: [],
  reconciliations: [],
  auditLogs: [],
  evaluationResults: [],
  config: { confidenceThreshold: 0.90, toleranceAmount: 1.00 },
  isDataGenerated: false,
  activeDataset: null, // 'SYNTHETIC' | 'RAZORPAY'
  dataMode: null, // 'RAZORPAY' | 'DEMO'
  modeSource: null, // 'MANUAL' | 'AUTO_FALLBACK'
  aiProvider: 'NVIDIA', // 'NVIDIA' | 'GEMINI' | 'FALLBACK'
  lastReconciliationTime: null,
};

try {
  const persisted = localStorage.getItem('inirazor_store');
  if (persisted) {
    const parsed = JSON.parse(persisted);
    store = { ...store, ...parsed };
  }
} catch (e) {
  console.warn('Could not restore state from localStorage', e);
}

const saveStore = () => {
  try {
    localStorage.setItem('inirazor_store', JSON.stringify(store));
  } catch (e) {
    console.warn('Could not save state to localStorage', e);
  }
};

export const getStore = () => store;

export const getActiveDataset = () => store.activeDataset;

export const setActiveDataset = (dataset) => {
  if (store.activeDataset !== dataset) {
    store.auditLogs = [];
    store.reconciliations = [];
  }
  store.activeDataset = dataset;
  saveStore();
};

export const getDataMode = () => store.dataMode;

export const getModeSource = () => store.modeSource;

export const setDataMode = (mode, source) => {
  store.dataMode = mode;
  store.modeSource = source;
  saveStore();
};

export const getAiProvider = () => store.aiProvider;

export const setAiProvider = (provider) => {
  store.aiProvider = provider;
  saveStore();
};

export const setPayments = (payments) => {
  store.payments = payments;
  saveStore();
};

export const setSettlements = (settlements) => {
  store.settlements = settlements;
  saveStore();
};

export const setReconciliations = (reconciliations) => {
  store.reconciliations = reconciliations;
  saveStore();
};

export const setAuditLogs = (logs) => {
  store.auditLogs = logs;
  saveStore();
};

export const fetchPersistedReconciledData = async () => {
  if (store.dataMode !== 'RAZORPAY') return;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const { getAuthToken } = await import('./supabase.js');
  const token = await getAuthToken();
  if (!supabaseUrl || !token) {
    console.warn('Supabase not configured or user not authenticated');
    return;
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/fetch-reconciled-data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Edge Function error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    if (result.success) {
      setReconciliations(result.reconciliations);
      setAuditLogs(result.auditLogs);
    } else {
      console.error('Failed to fetch reconciled data:', result.message);
    }
  } catch (error) {
    console.error('Error fetching reconciled data:', error);
  }
};

export const addAuditLog = (log) => {
  store.auditLogs.push({
    id: log.id || generateId(),
    created_at: log.created_at || new Date().toISOString(),
    ...log
  });
  saveStore();
};

export const getAuditLogs = () => {
  return [...store.auditLogs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export const getAuditLogsForReconciliation = (reconciliationId) => {
  return getAuditLogs().filter(log => log.reconciliation_id === reconciliationId);
};

export const setEvaluationResults = (results) => {
  store.evaluationResults = results;
  saveStore();
};

export const getConfig = () => store.config;

export const updateConfig = (newConfig) => {
  store.config = { ...store.config, ...newConfig };
  saveStore();
};

export const getReconciliationById = (id) => {
  return store.reconciliations.find(r => r.id === id);
};

export const getReconciliationByPaymentId = (paymentId) => {
  return store.reconciliations.find(r => r.payment_id === paymentId);
};

export const updateReconciliation = (id, updates) => {
  const index = store.reconciliations.findIndex(r => r.id === id);
  if (index !== -1) {
    store.reconciliations[index] = { ...store.reconciliations[index], ...updates };
    saveStore();
  }
};

export const getPaymentById = (paymentId) => {
  return store.payments.find(p => p.payment_id === paymentId);
};

export const getSettlementByPaymentId = (paymentId) => {
  return store.settlements.filter(s => s.payment_id === paymentId);
};

export const getDashboardStats = () => {
  const total = store.reconciliations.length;
  let matched = 0;
  let aiResolved = 0;
  let needsReview = 0;
  let unresolved = 0;

  const byStatus = {
    [RECON_STATUS.MATCHED]: 0,
    [RECON_STATUS.AI_RESOLVED]: 0,
    [RECON_STATUS.NEEDS_REVIEW]: 0,
    [RECON_STATUS.UNRESOLVED]: 0,
  };

  const byCategory = {
    missingSettlement: 0,
    amountMismatch: 0,
    duplicate: 0,
    refund: 0,
    adjustment: 0,
    feeOrTax: 0,
    invalid: 0,
  };

  store.reconciliations.forEach(r => {
    if (r.status === RECON_STATUS.MATCHED) matched++;
    else if (r.status === RECON_STATUS.AI_RESOLVED) aiResolved++;
    else if (r.status === RECON_STATUS.NEEDS_REVIEW || r.status === RECON_STATUS.AI_UNAVAILABLE
          || r.status === RECON_STATUS.MISSING_SETTLEMENT || r.status === RECON_STATUS.DUPLICATE) needsReview++;
    else if (r.status === RECON_STATUS.UNRESOLVED) unresolved++;

    // Count by high-level status
    if (byStatus[r.status] !== undefined) {
      byStatus[r.status]++;
    }

    // Compute exception categories from status
    switch (r.status) {
      case RECON_STATUS.MISSING_SETTLEMENT:
        byCategory.missingSettlement++;
        break;
      case RECON_STATUS.AMOUNT_MISMATCH:
      case RECON_STATUS.UNEXPLAINED_DISCREPANCY:
        byCategory.amountMismatch++;
        break;
      case RECON_STATUS.DUPLICATE:
        byCategory.duplicate++;
        break;
      case RECON_STATUS.REFUND_DISCREPANCY:
        byCategory.refund++;
        break;
      case RECON_STATUS.ADJUSTMENT_DISCREPANCY:
        byCategory.adjustment++;
        break;
      case RECON_STATUS.FEE_DISCREPANCY:
      case RECON_STATUS.TAX_DISCREPANCY:
        byCategory.feeOrTax++;
        break;
      case RECON_STATUS.INVALID:
        byCategory.invalid++;
        break;
    }
  });

  const exceptions = total - matched - aiResolved;

  return {
    total,
    matched,
    aiResolved,
    needsReview,
    unresolved,
    matchRate: total ? matched / total : 0,
    aiResolutionRate: total ? aiResolved / total : 0,
    exceptions,
    processingTime: store.lastReconciliationTime,
    byStatus,
    byCategory,
  };
};

export const resetWorkflowState = () => {
  store.payments = [];
  store.settlements = [];
  store.reconciliations = [];
  store.auditLogs = [];
  store.evaluationResults = [];
  store.lastReconciliationTime = null;
  store.activeDataset = null;
  store.isDataGenerated = false;
  saveStore();
};

export const clearAll = () => {
  store = {
    payments: [],
    settlements: [],
    reconciliations: [],
    auditLogs: [],
    evaluationResults: [],
    config: { confidenceThreshold: 0.90, toleranceAmount: 1.00 },
    isDataGenerated: false,
    activeDataset: null,
    dataMode: null,
    modeSource: null,
    aiProvider: 'NVIDIA',
    lastReconciliationTime: null,
  };
  saveStore();
};

export const markDataGenerated = () => {
  store.isDataGenerated = true;
  saveStore();
};

export const isReady = () => {
  return store.isDataGenerated;
};

export const persistReconciliationsToDB = async (reconciliations) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const { getAuthToken } = await import('./supabase.js');
  const token = await getAuthToken();
  if (!supabaseUrl || !token) {
    throw new Error('Supabase not configured or user not authenticated');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/persist-reconciliations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reconciliations }),
  });

  if (!response.ok) {
    throw new Error(`Edge Function error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Failed to persist reconciliations');
  }
  return result;
};

export const persistAuditLogsToDB = async (logs) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const { getAuthToken } = await import('./supabase.js');
  const token = await getAuthToken();
  if (!supabaseUrl || !token) {
    throw new Error('Supabase not configured or user not authenticated');
  }

  // Filter out any logs that belong to Demo mode just in case
  const logsToPersist = logs.filter(log => store.dataMode === 'RAZORPAY');

  if (logsToPersist.length === 0) return { success: true, count: 0 };

  const response = await fetch(`${supabaseUrl}/functions/v1/persist-audit-logs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ logs: logsToPersist }),
  });

  if (!response.ok) {
    throw new Error(`Edge Function error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Failed to persist audit logs');
  }
  return result;
};
