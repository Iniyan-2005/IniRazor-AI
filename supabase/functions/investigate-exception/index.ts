// ============================================================
// IniRazorAI — Investigate Exception Edge Function
// Supabase Edge Function (Deno/TypeScript)
// ============================================================
// This Edge Function receives structured financial evidence
// and calls Google Gemini to investigate ambiguous discrepancies.
//
// Environment variables required:
//   AI_API_KEY - Google Gemini API key
//   AI_MODEL   - Model name (default: gemini-2.0-flash)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const AI_API_KEY = Deno.env.get('AI_API_KEY')
    const AI_MODEL = Deno.env.get('AI_MODEL') || 'gemini-2.0-flash'

    if (!AI_API_KEY) {
      return new Response(
        JSON.stringify({
          classification: 'AI_UNAVAILABLE',
          confidence: 0,
          likelyCause: null,
          explanation: 'AI API key not configured. Transaction escalated for manual review.',
          recommendedAction: 'NEEDS_REVIEW',
          evidence: [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { evidence } = await req.json()

    // Build the prompt
    const prompt = `You are a financial reconciliation expert analyzing a payment-settlement discrepancy.

EVIDENCE:
- Payment Amount: ₹${evidence.payment?.amount}
- Payment Status: ${evidence.payment?.status}
- Payment Method: ${evidence.payment?.payment_method}
- Settlement Gross Amount: ₹${evidence.settlement?.gross_amount}
- Known Fee: ₹${evidence.knownFees}
- Known Tax (GST): ₹${evidence.knownTax}
- Known Refund: ₹${evidence.knownRefund}
- Known Adjustment: ₹${evidence.knownAdjustment}
- Expected Net Settlement: ₹${evidence.expectedAmount}
- Actual Net Settlement: ₹${evidence.actualAmount}
- Difference: ₹${evidence.difference}
${evidence.isDemoData ? '- Data Context: SYNTHETIC DEMO DATA' : ''}

TASK:
Analyze this discrepancy and determine:
1. What is the most likely classification?
2. What is the likely cause?
3. Can this be safely auto-resolved?

Classifications: FEE_DISCREPANCY, TAX_DISCREPANCY, REFUND_DISCREPANCY, ADJUSTMENT_DISCREPANCY, AMOUNT_MISMATCH, UNEXPLAINED_DISCREPANCY

Respond ONLY with valid JSON in this exact format:
{
  "classification": "string",
  "confidence": number between 0 and 1,
  "likelyCause": "string or null",
  "explanation": "string",
  "recommendedAction": "AUTO_RESOLVE" or "NEEDS_REVIEW" or "UNRESOLVED",
  "evidence": ["array of supporting observations"]
}

RULES:
- If you cannot explain the full difference, set confidence below 0.5 and recommendedAction to "NEEDS_REVIEW"
- Never invent financial records or transactions
- Never recommend AUTO_RESOLVE if confidence is below 0.9
- Be honest about uncertainty`

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${AI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    if (!response.ok) {
      const errorBody = await response.text();
      let errorDesc = `Gemini API error: ${response.status}`;
      let isQuota = response.status === 429;
      
      try {
        const errJson = JSON.parse(errorBody);
        if (errJson.error && errJson.error.message) {
          errorDesc = errJson.error.message;
          const msgLower = errorDesc.toLowerCase();
          if (msgLower.includes('quota') || msgLower.includes('exhausted') || msgLower.includes('rate limit')) {
            isQuota = true;
          }
        }
      } catch(e) {}

      if (isQuota) {
        throw new Error('QUOTA_EXHAUSTED: ' + errorDesc);
      }
      throw new Error(errorDesc);
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      throw new Error('Empty response from Gemini')
    }

    // Parse and validate the AI response
    const aiResult = JSON.parse(text)

    // Validate required fields
    if (!aiResult.classification || typeof aiResult.confidence !== 'number' || !aiResult.recommendedAction) {
      throw new Error('Invalid AI response structure')
    }

    // Enforce safety rules
    if (aiResult.confidence < 0.9 && aiResult.recommendedAction === 'AUTO_RESOLVE') {
      aiResult.recommendedAction = 'NEEDS_REVIEW'
    }

    // Clamp confidence
    aiResult.confidence = Math.max(0, Math.min(1, aiResult.confidence))

    return new Response(JSON.stringify(aiResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('AI investigation failed:', error.message)
    
    const isQuota = error.message.includes('QUOTA_EXHAUSTED') || error.message.toLowerCase().includes('429');

    return new Response(
      JSON.stringify({
        classification: 'AI_UNAVAILABLE',
        errorType: isQuota ? 'QUOTA_EXHAUSTED' : 'GENERAL_FAILURE',
        confidence: 0,
        likelyCause: null,
        explanation: `AI investigation failed: ${error.message}. Transaction escalated for manual review.`,
        recommendedAction: 'NEEDS_REVIEW',
        evidence: [],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
