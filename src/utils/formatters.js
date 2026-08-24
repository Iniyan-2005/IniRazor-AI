// ============================================================
// IniRazorAI — Formatting Utilities
// ============================================================

/**
 * Format amount as Indian Rupees
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format a number with commas (Indian numbering)
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '—'
  return new Intl.NumberFormat('en-IN').format(num)
}

/**
 * Format percentage
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) return '—'
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Format confidence as percentage
 */
export function formatConfidence(confidence) {
  if (confidence === null || confidence === undefined) return '—'
  return `${(confidence * 100).toFixed(0)}%`
}

/**
 * Format date for display
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

/**
 * Format datetime for display
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date)
}

/**
 * Format time only
 */
export function formatTime(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date)
}

/**
 * Format duration in ms to human readable
 */
export function formatDuration(ms) {
  if (ms === null || ms === undefined) return '—'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(0)
  return `${minutes}m ${seconds}s`
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str, maxLength = 50) {
  if (!str) return '—'
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

/**
 * Human-readable status label
 */
export function statusLabel(status) {
  if (!status) return '—'
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

/**
 * Generate a unique ID
 */
export function generateId() {
  return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9)
}

/**
 * Generate a payment-style ID
 */
export function generatePaymentId(index) {
  return `pay_${String(index).padStart(5, '0')}_${Math.random().toString(36).slice(2, 6)}`
}

/**
 * Generate an order-style ID
 */
export function generateOrderId(index) {
  return `order_${String(index).padStart(5, '0')}_${Math.random().toString(36).slice(2, 6)}`
}

/**
 * Generate a settlement-style ID
 */
export function generateSettlementId(index) {
  return `setl_${String(index).padStart(5, '0')}_${Math.random().toString(36).slice(2, 6)}`
}

/**
 * Clamp a number between min and max
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}
