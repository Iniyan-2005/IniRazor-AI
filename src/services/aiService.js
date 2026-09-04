// ============================================================
// IniRazorAI — AI Service
// Uses real NVIDIA NIM via Supabase Edge Function when configured,
// falls back to rule-based Demo AI in Demo Mode.
// ============================================================

import { AI_ACTIONS, RECON_STATUS } from '../utils/constants.js';
import { isSupabaseConfigured, supabase } from './supabase.js';
import { getAiProvider, getConfig } from './dataService.js';

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
      likelyCause: 'SYSTEM_ERROR'
    };
  }
  
  const validActions = Object.values(AI_ACTIONS);
  let action = response.recommendedAction;
  
  if (!validActions.includes(action)) {
    action = AI_ACTIONS.NEEDS_REVIEW;
  }

  // The confidence check is now managed dynamically by the backend and frontend configs.

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
  const requestId = evidence?.requestId || 'unknown-req';
  console.log('[AI REQUEST] Start', { requestId });

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const { getAuthToken } = await import('./supabase.js');
  const token = await getAuthToken();
  if (!supabaseUrl || !token) {
    throw new Error('Supabase not configured or user not authenticated');
  }

  const config = getConfig();
  const confidenceThreshold = config.confidenceThreshold || 0.90;

  const controller = new AbortController();
  const startedAt = Date.now();
  
  console.log('[AI REQUEST] Timeout scheduled', { requestId, timeoutMs: 150000 });
  const timeoutId = setTimeout(() => {
    console.log('[AI REQUEST] Timeout fired - aborting controller', { requestId, elapsedMs: Date.now() - startedAt });
    controller.abort();
  }, 150000); 

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/investigate-exception`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ evidence, confidenceThreshold }),
      signal: controller.signal
    });

    console.log('[AI REQUEST] fetch resolved', { requestId, status: response.status, elapsedMs: Date.now() - startedAt });

    if (!response.ok) {
      throw new Error(`Edge Function error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('[AI REQUEST] failed', {
      requestId,
      name: error?.name,
      message: error?.message,
      elapsedMs: Date.now() - startedAt
    });
    throw error;
  } finally {
    clearTimeout(timeoutId);
    console.log('[AI REQUEST] finished finally block', {
      requestId,
      elapsedMs: Date.now() - startedAt
    });
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
      recommendedAction: AI_ACTIONS.AUTO_RESOLVE
    };
  }
  
  if (knownRefund > 0 && Math.abs(Math.abs(difference) - knownRefund) < 10) {
    return {
      classification: RECON_STATUS.REFUND_DISCREPANCY,
      confidence: 0.85,
      likelyCause: 'Refund processed but not fully reflected in settlement.',
      explanation: `Difference closely matches the refund amount of ₹${knownRefund}.`,
      recommendedAction: AI_ACTIONS.NEEDS_REVIEW
    };
  }
  
  if (knownAdjustment !== 0 && Math.abs(Math.abs(difference) - Math.abs(knownAdjustment)) < 10) {
    return {
      classification: RECON_STATUS.ADJUSTMENT_DISCREPANCY,
      confidence: 0.88,
      likelyCause: 'Manual adjustment missing from reconciliation.',
      explanation: `Difference closely matches a known manual adjustment of ₹${knownAdjustment}.`,
      recommendedAction: AI_ACTIONS.NEEDS_REVIEW
    };
  }
  
  // Large unexplained difference (includes the deliberate failure scenario)
  if (Math.abs(difference) > 100) {
    return {
      classification: 'UNEXPLAINED_DISCREPANCY',
      confidence: 0.35,
      likelyCause: null,
      explanation: `A large unexplained difference of ₹${Math.abs(difference).toFixed(2)} was found. Available records do not fully explain the settlement difference.`,
      recommendedAction: AI_ACTIONS.NEEDS_REVIEW
    };
  }
  
  // Small unexplained difference
  return {
    classification: RECON_STATUS.UNEXPLAINED_DISCREPANCY,
    confidence: 0.60,
    likelyCause: 'Unknown micro-variance',
    explanation: 'A small unexplained difference exists. Recommend manual verification.',
    recommendedAction: AI_ACTIONS.NEEDS_REVIEW
  };
};

/**
 * Main entry point: Investigate an ambiguous exception
 * Uses real AI (NVIDIA NIM or Gemini) when Supabase is configured, mock otherwise
 */
export const investigateException = async (evidence) => {
  // Declared outside try so it is accessible in the catch block.
  // (const declared inside try {} is not in scope inside catch {}.)
  const currentProvider = getAiProvider();

  try {
    let rawResponse;

    if (isSupabaseConfigured && (currentProvider === 'NVIDIA' || currentProvider === 'GEMINI')) {
      // ====== REAL AI MODE ======
      // Single call — the Edge Function already handles NVIDIA 503 retries internally
      // (MAX_NVIDIA_ATTEMPTS = 3, with 2 s and 4 s back-off). Do NOT retry here.
      rawResponse = await callRealAI(evidence);

      // Quota exhausted: throw so the outer catch produces a Demo AI fallback.
      if (rawResponse.classification === 'AI_UNAVAILABLE' &&
          rawResponse.errorType === 'QUOTA_EXHAUSTED') {
        const err = new Error(`${currentProvider} API quota exhausted`);
        err.isQuota = true;
        throw err;
      }

      // All other AI_UNAVAILABLE results (503 exhausted, timeout, general failure)
      // are returned directly. The worker in ReconciliationPage will mark the
      // exception as NEEDS_REVIEW. No frontend retry.
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

    const isTimeout = error.name === 'AbortError' || error?.message?.toLowerCase().includes('timeout');

    // If we are in Real AI mode, do not silently convert upstream failures (timeouts/network) into Fallback.
    if (isSupabaseConfigured && (currentProvider === 'NVIDIA' || currentProvider === 'GEMINI') && !error.isQuota) {
      return {
        classification: 'AI_UNAVAILABLE',
        confidence: 0,
        recommendedAction: AI_ACTIONS.NEEDS_REVIEW,
        errorType: isTimeout ? 'TIMEOUT' : 'GENERAL_FAILURE',
        explanation: isTimeout 
          ? 'AI investigation timed out. The request exceeded processing limits.' 
          : `AI investigation failed: ${error.message || 'Unknown network error'}.`,
        likelyCause: null,

        ai_provider: currentProvider,
        _recovered: false
      };
    }

    // Fallback to Demo AI
    const fallbackResponse = await createMockAIResponse(evidence);
    const validFallback = validateAIResponse(fallbackResponse);

    // Override the explanation to clearly state it's fallback
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
