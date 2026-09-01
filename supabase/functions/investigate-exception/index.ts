// ============================================================
// IniRazorAI — Investigate Exception Edge Function
// Supabase Edge Function (Deno/TypeScript)
// ============================================================
// This Edge Function receives structured financial evidence
// and calls NVIDIA NIM or Google Gemini to investigate ambiguous discrepancies.
//
// Environment variables required:
//   AI_PROVIDER - 'NVIDIA' or 'GEMINI' (default: GEMINI)
//   AI_API_KEY  - API key for the selected provider
//   AI_MODEL    - Model name
//   AI_BASE_URL - Base URL for OpenAI-compatible APIs (like NVIDIA NIM)

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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ classification: 'AI_UNAVAILABLE', confidence: 0, likelyCause: null, explanation: 'Missing authorization header', recommendedAction: 'NEEDS_REVIEW', evidence: [] }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const token = authHeader.replace('Bearer ', '')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    // Authenticate the token
    const authClient = createClient(supabaseUrl, supabaseAnonKey)
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ classification: 'AI_UNAVAILABLE', confidence: 0, likelyCause: null, explanation: 'Unauthorized access', recommendedAction: 'NEEDS_REVIEW', evidence: [] }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const AI_API_KEY = Deno.env.get('AI_API_KEY')
    const AI_PROVIDER = Deno.env.get('AI_PROVIDER') || 'GEMINI'
    const AI_MODEL = (Deno.env.get('AI_MODEL') || (AI_PROVIDER === 'NVIDIA' ? 'nvidia/nemotron-3-ultra-550b-a55b' : 'gemini-2.0-flash')).trim()
    const AI_BASE_URL = Deno.env.get('AI_BASE_URL') || 'https://integrate.api.nvidia.com/v1'

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

    let text: string | undefined;

    if (AI_PROVIDER === 'NVIDIA') {
      const systemPrompt = `You are a strict JSON-only financial reconciliation API.
1. Return ONLY valid JSON.
2. Do not provide reasoning or conversational text.
3. Do not use Markdown code fences.
4. Do not place literal newlines/tabs inside JSON string values.
5. Follow the exact required AI response schema.`;

      const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          top_p: 0.95,
          max_tokens: 1024,
          response_format: { type: "json_object" },
          chat_template_kwargs: {
            enable_thinking: false
          }
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        let errorDesc = `NVIDIA API error: ${response.status}`;
        let isQuota = response.status === 429;
        
        try {
          const errJson = JSON.parse(errorBody);
          if (errJson.detail) errorDesc = errJson.detail;
          if (errJson.title) errorDesc = errJson.title;
          const msgLower = errorDesc.toLowerCase();
          if (msgLower.includes('quota') || msgLower.includes('exhausted') || msgLower.includes('rate limit')) {
            isQuota = true;
          }
        } catch(e) {}

        if (isQuota) throw new Error('QUOTA_EXHAUSTED: ' + errorDesc);
        throw new Error(errorDesc);
      }

      const data = await response.json();
      text = data.choices?.[0]?.message?.content;
    } else {
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
      text = data.candidates?.[0]?.content?.parts?.[0]?.text
    }

    if (!text) {
      throw new Error(`Empty response from ${AI_PROVIDER}`)
    }

    // Extract the JSON object boundaries to ignore conversational prose (e.g. "Let me analyze...")
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
      text = text.substring(startIndex, endIndex + 1);
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
