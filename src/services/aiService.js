// ============================================================
// IniRazorAI — AI Service
// Uses real Gemini via Supabase Edge Function when configured,
// falls back to rule-based mock in Demo Mode.
// ============================================================

import { AI_ACTIONS, RECON_STATUS } from '../utils/constants.js';
import { isSupabaseConfigured, supabase } from './supabase.js';
import { getAiProvider } from './dataService.js';

/**
 * Validate AI response has correct structure and safe values
 */
export const validateAIResponse = (response) => {
  if (!response || !response.classification || typeof response.confidence !== 'number') {
    return {
      classification: RECON_STATUS.INVALID,
      confidence: 0,
      recommendedAction: AI_ACTIONS.NEEDS_REVIEW,
      explanation: 'Invalid AI response format received.',
      likelyCause: 'SYSTEM_ERROR',
      evidence: [],
    };
  }
  
  const validActions = Object.values(AI_ACTIONS);
  let action = response.recommendedAction;
  
  if (!validActions.includes(action)) {
    action = AI_ACTIONS.NEEDS_REVIEW;
  }

  // Safety rule: never auto-resolve with low confidence
  if (response.confidence < 0.90 && action === AI_ACTIONS.AUTO_RESOLVE) {
    action = AI_ACTIONS.NEEDS_REVIEW;
  }

  // Clamp confidence to 0-1
  const confidence = Math.max(0, Math.min(1, response.confidence));
  
  return {
    ...response,
    confidence,
    recommendedAction: action,
  };
};

/**
 * Call real AI via Supabase Edge Function
 */
const callRealAI = async (evidence) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const { getAuthToken } = await import('./supabase.js');
  const token = await getAuthToken();
  if (!supabaseUrl || !token) {
    throw new Error('Supabase not configured or user not authenticated');
  }

  const controller = new AbortController();
  // INCREASED TIMEOUT: Nemotron-3-Ultra-550b is a massive model and requires a longer time-to-first-token.
  const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/investigate-exception`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ evidence }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Edge Function error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Rule-based mock AI for Demo Mode (no Supabase/real AI configured)
 */
export const createMockAIResponse = async (evidence) => {
  // Simulate API delay
  const delay = Math.floor(Math.random() * 600) + 200;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  const { difference, knownFees, knownRefund, knownAdjustment } = evidence;
  
  // Rule-based mock
  if (Math.abs(difference) === knownFees || Math.abs(difference - knownFees) < 2) {
    return {
      classification: RECON_STATUS.FEE_DISCREPANCY,
      confidence: 0.95,
      likelyCause: 'Mismatched fee configuration between payment gateway and ledger.',
      explanation: `The difference of ₹${Math.abs(difference).toFixed(2)} closely matches the expected fee of ₹${knownFees}. Likely a failure in fee deduction logging.`,
      recommendedAction: AI_ACTIONS.AUTO_RESOLVE,
      evidence: ['FEE_MATCH'],
    };
  }
  
  if (knownRefund > 0 && Math.abs(Math.abs(difference) - knownRefund) < 10) {
    return {
      classification: RECON_STATUS.REFUND_DISCREPANCY,
      confidence: 0.85,
      likelyCause: 'Refund processed but not fully reflected in settlement.',
      explanation: `Difference closely matches the refund amount of ₹${knownRefund}.`,
      recommendedAction: AI_ACTIONS.NEEDS_REVIEW,
      evidence: ['REFUND_MATCH'],
    };
  }
  
  if (knownAdjustment !== 0 && Math.abs(Math.abs(difference) - Math.abs(knownAdjustment)) < 10) {
    return {
      classification: RECON_STATUS.ADJUSTMENT_DISCREPANCY,
      confidence: 0.88,
      likelyCause: 'Manual adjustment missing from reconciliation.',
      explanation: `Difference closely matches a known manual adjustment of ₹${knownAdjustment}.`,
      recommendedAction: AI_ACTIONS.NEEDS_REVIEW,
      evidence: ['ADJUSTMENT_MATCH'],
    };
  }
  
  // Large unexplained difference (includes the deliberate failure scenario)
  if (Math.abs(difference) > 100) {
    return {
      classification: 'UNEXPLAINED_DISCREPANCY',
      confidence: 0.35,
      likelyCause: null,
      explanation: `A large unexplained difference of ₹${Math.abs(difference).toFixed(2)} was found. Available records do not fully explain the settlement difference.`,
      recommendedAction: AI_ACTIONS.NEEDS_REVIEW,
      evidence: ['LARGE_VARIANCE', 'NO_MATCHING_RECORD'],
    };
  }
  
  // Small unexplained difference
  return {
    classification: 'UNEXPLAINED_DISCREPANCY',
    confidence: 0.65,
    likelyCause: 'Rounding or minor untracked charge.',
    explanation: `Small unexplained difference of ₹${Math.abs(difference).toFixed(2)}. Possibly a rounding discrepancy.`,
    recommendedAction: AI_ACTIONS.NEEDS_REVIEW,
    evidence: ['SMALL_VARIANCE'],
  };
};

/**
 * Main entry point: Investigate an ambiguous exception
 * Uses real AI (NVIDIA NIM or Gemini) when Supabase is configured, mock otherwise
 */
export const investigateException = async (evidence) => {
  try {
    let rawResponse;
    const currentProvider = getAiProvider();

    if (isSupabaseConfigured && (currentProvider === 'NVIDIA' || currentProvider === 'GEMINI')) {
      // ====== REAL AI MODE ======
      rawResponse = await callRealAI(evidence);

      // Check for backend-caught AI API failures (quota or general)
      if (rawResponse.classification === 'AI_UNAVAILABLE') {
        if (rawResponse.errorType === 'QUOTA_EXHAUSTED') {
          // Quota: do not retry — throw immediately to Demo AI fallback
          const err = new Error(`${currentProvider} API quota exhausted`);
          err.isQuota = true;
          throw err;
        } else {
          // GENERAL_FAILURE (malformed JSON, prose response, etc.) — attempt ONE retry
          console.warn(`${currentProvider} returned malformed response. Attempting single retry...`);
          let retryResponse;
          try {
            retryResponse = await callRealAI(evidence);
          } catch (retryNetErr) {
            // Retry itself failed at network level — propagate to outer catch
            throw retryNetErr;
          }

          if (retryResponse.classification === 'AI_UNAVAILABLE') {
            // Retry also returned a failure — give up and fall through to Demo AI
            throw new Error(retryResponse.explanation || `${currentProvider} API failed after retry`);
          }

          // Retry succeeded — use the recovered response and signal recovery
          rawResponse = retryResponse;
          rawResponse._recovered = true;
        }
      }
    } else {
      // ====== DEMO MODE ======
      rawResponse = await createMockAIResponse(evidence);
    }

    const validResponse = validateAIResponse(rawResponse);
    validResponse.ai_provider = (isSupabaseConfigured && (currentProvider === 'NVIDIA' || currentProvider === 'GEMINI')) ? currentProvider : 'FALLBACK';
    validResponse._recovered = rawResponse._recovered === true;
    return validResponse;
  } catch (error) {
    console.error('AI investigation failed:', error);

    // Fallback to Demo AI
    const fallbackResponse = await createMockAIResponse(evidence);
    const validFallback = validateAIResponse(fallbackResponse);

    // Override the explanation to clearly state it's fallback
    const isTimeout = error.name === 'AbortError' || error.message.includes('timeout');
    validFallback.explanation = `[Demo AI Fallback${isTimeout ? ' - Timeout' : ''}] ` + validFallback.explanation;
    validFallback._isFallback = true;
    validFallback._quotaExhausted = error.isQuota === true;
    validFallback.ai_provider = 'FALLBACK';
    return validFallback;
  }
};

/**
 * Get the current AI mode label
 */
export const getAIMode = () => {
  const provider = getAiProvider();
  if (provider === 'NVIDIA') return 'NVIDIA AI';
  if (provider === 'GEMINI') return 'Gemini AI';
  return 'Demo AI Fallback';
};
