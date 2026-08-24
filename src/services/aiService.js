// ============================================================
// IniRazorAI — AI Service
// Uses real Gemini via Supabase Edge Function when configured,
// falls back to rule-based mock in Demo Mode.
// ============================================================

import { AI_ACTIONS, RECON_STATUS } from '../utils/constants.js';
import { isSupabaseConfigured, supabase } from './supabase.js';

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
 * Call real Gemini AI via Supabase Edge Function
 */
const callRealAI = async (evidence) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(`${supabaseUrl}/functions/v1/investigate-exception`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ evidence }),
  });

  if (!response.ok) {
    throw new Error(`Edge Function error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

/**
 * Rule-based mock AI for Demo Mode (no Supabase/Gemini configured)
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
 * Uses real Gemini when Supabase is configured, mock otherwise
 */
export const investigateException = async (evidence) => {
  try {
    let rawResponse;

    if (isSupabaseConfigured) {
      // ====== REAL AI MODE ======
      // Call Gemini via Supabase Edge Function
      rawResponse = await callRealAI(evidence);
    } else {
      // ====== DEMO MODE ======
      // Use rule-based mock
      rawResponse = await createMockAIResponse(evidence);
    }

    return validateAIResponse(rawResponse);
  } catch (error) {
    console.error('AI investigation failed:', error);
    return {
      classification: 'AI_UNAVAILABLE',
      confidence: 0,
      likelyCause: null,
      explanation: `AI investigation failed: ${error.message}. Transaction escalated for manual review.`,
      recommendedAction: AI_ACTIONS.NEEDS_REVIEW,
      evidence: [],
    };
  }
};

/**
 * Get the current AI mode label
 */
export const getAIMode = () => {
  return isSupabaseConfigured ? 'Gemini AI (Live)' : 'Mock AI (Demo)';
};
