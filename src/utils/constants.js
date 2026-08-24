// ============================================================
// IniRazorAI — Constants & Configuration
// ============================================================

// Reconciliation statuses
export const RECON_STATUS = {
  MATCHED: 'MATCHED',
  FEE_DISCREPANCY: 'FEE_DISCREPANCY',
  TAX_DISCREPANCY: 'TAX_DISCREPANCY',
  REFUND_DISCREPANCY: 'REFUND_DISCREPANCY',
  ADJUSTMENT_DISCREPANCY: 'ADJUSTMENT_DISCREPANCY',
  MISSING_SETTLEMENT: 'MISSING_SETTLEMENT',
  DUPLICATE: 'DUPLICATE',
  AMOUNT_MISMATCH: 'AMOUNT_MISMATCH',
  UNEXPLAINED_DISCREPANCY: 'UNEXPLAINED_DISCREPANCY',
  INVALID: 'INVALID',
  PENDING: 'PENDING',
  AI_RESOLVED: 'AI_RESOLVED',
  NEEDS_REVIEW: 'NEEDS_REVIEW',
  UNRESOLVED: 'UNRESOLVED',
  AI_UNAVAILABLE: 'AI_UNAVAILABLE',
}

// AI recommended actions
export const AI_ACTIONS = {
  AUTO_RESOLVE: 'AUTO_RESOLVE',
  NEEDS_REVIEW: 'NEEDS_REVIEW',
  UNRESOLVED: 'UNRESOLVED',
}

// Ground truth statuses (for evaluation)
export const GROUND_TRUTH = {
  MATCHED: 'MATCHED',
  FEE_DISCREPANCY: 'FEE_DISCREPANCY',
  TAX_DISCREPANCY: 'TAX_DISCREPANCY',
  REFUND_DISCREPANCY: 'REFUND_DISCREPANCY',
  ADJUSTMENT_DISCREPANCY: 'ADJUSTMENT_DISCREPANCY',
  MISSING_SETTLEMENT: 'MISSING_SETTLEMENT',
  DUPLICATE: 'DUPLICATE',
  UNKNOWN: 'UNKNOWN',
  INVALID: 'INVALID',
}

// Actors for audit logs
export const ACTORS = {
  SYSTEM: 'SYSTEM',
  AI_AGENT: 'AI_AGENT',
  HUMAN: 'HUMAN',
}

// Event types for audit
export const EVENT_TYPES = {
  DETERMINISTIC_MATCH: 'DETERMINISTIC_MATCH',
  EXCEPTION_DETECTED: 'EXCEPTION_DETECTED',
  AI_INVESTIGATION: 'AI_INVESTIGATION',
  AI_RESOLUTION: 'AI_RESOLUTION',
  AI_FAILURE: 'AI_FAILURE',
  HUMAN_APPROVED: 'HUMAN_APPROVED',
  HUMAN_REJECTED: 'HUMAN_REJECTED',
  HUMAN_UNRESOLVED: 'HUMAN_UNRESOLVED',
  BATCH_STARTED: 'BATCH_STARTED',
  BATCH_COMPLETED: 'BATCH_COMPLETED',
  DATA_GENERATED: 'DATA_GENERATED',
}

// Payment methods
export const PAYMENT_METHODS = ['upi', 'card', 'netbanking', 'wallet', 'emi']

// Payment statuses
export const PAYMENT_STATUSES = ['captured', 'authorized', 'refunded', 'failed']

// Default configuration
export const DEFAULT_CONFIG = {
  CONFIDENCE_THRESHOLD: 0.90,
  TOLERANCE_AMOUNT: 1.00, // ₹1 tolerance for rounding
  BATCH_SIZE: 50,
  TOTAL_RECORDS: 500,
}

// Status colors for UI
export const STATUS_COLORS = {
  MATCHED: { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  AI_RESOLVED: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  NEEDS_REVIEW: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
  UNRESOLVED: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  PENDING: { bg: 'bg-slate-100', text: 'text-slate-800', dot: 'bg-slate-500' },
  FEE_DISCREPANCY: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
  TAX_DISCREPANCY: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
  REFUND_DISCREPANCY: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
  ADJUSTMENT_DISCREPANCY: { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500' },
  MISSING_SETTLEMENT: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  DUPLICATE: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  AMOUNT_MISMATCH: { bg: 'bg-rose-100', text: 'text-rose-800', dot: 'bg-rose-500' },
  UNEXPLAINED_DISCREPANCY: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  INVALID: { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' },
  AI_UNAVAILABLE: { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' },
}

// Method labels for display
export const METHOD_LABELS = {
  DETERMINISTIC_MATCH: 'Deterministic Match',
  AI_INVESTIGATION: 'AI Investigation',
  HUMAN_REVIEW: 'Human Review',
}
