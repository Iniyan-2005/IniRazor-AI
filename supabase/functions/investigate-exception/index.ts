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

// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ---------------------------------------------------------------------------
// Error codes — stable machine-readable strings sent to the frontend.
//
// IMPORTANT: errorCode → errorType mapping is CENTRALIZED in ERROR_TYPE_MAP
// below and nowhere else. Never derive errorType from error.message string
// scanning — that causes mismatch between errorCode and errorType.
// ---------------------------------------------------------------------------

const AI_ERROR = {
  SERVICE_OVERLOADED: 'AI_SERVICE_OVERLOADED', // NVIDIA 503
  QUOTA_EXHAUSTED:    'AI_QUOTA_EXHAUSTED',    // NVIDIA 429 / quota
  AUTH_ERROR:         'AI_AUTH_ERROR',          // NVIDIA 401 / 403
  PROVIDER_ERROR:     'AI_PROVIDER_ERROR',      // Other non-2xx NVIDIA errors
  EMPTY_RESPONSE:     'AI_EMPTY_RESPONSE',      // Choices / content missing
  INVALID_RESPONSE:   'AI_INVALID_RESPONSE',    // Content present but not parseable JSON
  UNAVAILABLE:        'AI_UNAVAILABLE',         // Generic / catch-all fallback
} as const;

/**
 * SINGLE SOURCE OF TRUTH: errorCode → frontend-facing errorType.
 *
 * This map is used exclusively when constructing error responses.
 * Do NOT override it with string scans on error.message — that causes
 * errorCode/errorType mismatches in production (confirmed root cause).
 */
const ERROR_TYPE_MAP: Record<string, string> = {
  [AI_ERROR.QUOTA_EXHAUSTED]:    'QUOTA_EXHAUSTED',
  [AI_ERROR.AUTH_ERROR]:         'AUTH_ERROR',
  [AI_ERROR.SERVICE_OVERLOADED]: 'SERVICE_OVERLOADED',
  [AI_ERROR.EMPTY_RESPONSE]:     'EMPTY_RESPONSE',
  [AI_ERROR.INVALID_RESPONSE]:   'INVALID_RESPONSE',
  [AI_ERROR.PROVIDER_ERROR]:     'GENERAL_FAILURE',
  [AI_ERROR.UNAVAILABLE]:        'GENERAL_FAILURE',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Simple sleep utility for retry back-off. */
const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

/**
 * Robust AI JSON parser.
 *
 * Handles:
 *  1. Perfect valid JSON
 *  2. JSON wrapped in markdown code fences (```json ... ```)
 *  3. Conversational prose BEFORE a valid JSON object
 *  4. Conversational prose AFTER a valid JSON object
 *  5. Whitespace around JSON
 *
 * Does NOT:
 *  - Silently "fix" corrupted JSON via unsafe regex
 *  - Convert invalid content into fake successful results
 *  - Remove random characters
 *
 * @param content    Raw string from AI
 * @param model      Model name — included in diagnostic logs only
 * @param parseAttemptNum  Which generation attempt produced this content (for logging)
 */
function parseAIJson(
  content: string,
  model: string,
  parseAttemptNum: number,
): Record<string, unknown> {
  if (!content || !content.trim()) {
    console.error('AI parse failure: empty content', { parseAttemptNum, model, contentLength: 0 })
    const err: any = new Error('AI returned an empty response')
    err.errorCode = AI_ERROR.EMPTY_RESPONSE
    throw err
  }

  const trimmed = content.trim()

  // Attempt 1: Direct parse — handles perfect JSON.
  // If the AI returns a valid JSON array (not an object) we reject it immediately
  // so Attempt 3 cannot silently salvage a nested object from it.
  try {
    const parsed = JSON.parse(trimmed)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed
    // Valid JSON but wrong type (array, number, string, null) → reject without boundary extraction
    if (parsed !== null && typeof parsed !== 'undefined') {
      const err: any = new Error(
        `AI returned valid JSON but wrong type: expected object, got ${Array.isArray(parsed) ? 'array' : typeof parsed}`
      )
      err.errorCode = AI_ERROR.INVALID_RESPONSE
      throw err
    }
  } catch (e: any) {
    // Re-throw only classified errors (wrong-type guard above)
    if (e.errorCode) throw e
    // Otherwise SyntaxError — fall through to fence stripping
  }

  // Attempt 2: Strip markdown code fences (```json ... ``` or ``` ... ```)
  const withoutFences = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  try {
    const parsed = JSON.parse(withoutFences)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed
    if (parsed !== null && typeof parsed !== 'undefined') {
      const err: any = new Error(
        `AI returned valid JSON but wrong type after fence removal: expected object, got ${Array.isArray(parsed) ? 'array' : typeof parsed}`
      )
      err.errorCode = AI_ERROR.INVALID_RESPONSE
      throw err
    }
  } catch (e: any) {
    if (e.errorCode) throw e
  }

  // Attempt 3: Extract JSON object by finding outermost { ... }
  // Only reached when input was not valid JSON and not a valid JSON array.
  // Handles prose before/after the JSON object.
  const start = withoutFences.indexOf('{')
  const end   = withoutFences.lastIndexOf('}')

  if (start !== -1 && end !== -1 && end > start) {
    const candidate = withoutFences.slice(start, end + 1)
    try {
      const parsed = JSON.parse(candidate)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed
    } catch { /* fall through */ }
  }

  // All attempts exhausted — log diagnostic info and throw classified error
  console.error('AI parse failure: all 3 parse attempts exhausted', {
    parseAttemptNum,
    model,
    contentLength: trimmed.length,
    preview: trimmed.slice(0, 500),
    parseError: 'Could not extract a valid JSON object from AI content',
  })

  const err: any = new Error(`AI returned content that could not be parsed as JSON. Preview: ${trimmed.slice(0, 500)}`)
  err.errorCode = AI_ERROR.INVALID_RESPONSE
  throw err
}

/**
 * Validate that a parsed AI result contains the minimum required fields
 * for the investigation contract. Throws AI_INVALID_RESPONSE if missing.
 */
function validateInvestigationResult(obj: Record<string, unknown>): void {
  if (
    typeof obj.classification !== 'string' ||
    typeof obj.confidence !== 'number' ||
    typeof obj.recommendedAction !== 'string'
  ) {
    const err: any = new Error(
      `AI response is missing required fields (classification, confidence, recommendedAction). ` +
      `Got keys: ${Object.keys(obj).join(', ')}`
    )
    err.errorCode = AI_ERROR.INVALID_RESPONSE
    throw err
  }
}

/**
 * Call the NVIDIA NIM chat-completions endpoint with controlled 503 retry.
 *
 * Retry policy (HTTP-level only — separate from parse-level retry):
 *   Attempt 1 — immediate
 *   Attempt 2 — after 2 000 ms  (only if attempt 1 returned HTTP 503)
 *   Attempt 3 — after 4 000 ms  (only if attempt 2 returned HTTP 503)
 *   After three consecutive 503s the error is re-thrown → AI_SERVICE_OVERLOADED.
 *
 * Only HTTP 503 triggers a retry. All other non-2xx codes throw immediately.
 * JSON parse failures are NEVER retried here — that is handled by the caller.
 */
const MAX_NVIDIA_ATTEMPTS = 3

async function callNvidiaWithRetry(
  baseUrl: string,
  model: string,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  requestId: string,
  edgeStartedAt: number,
  generationAttempt: number
): Promise<string> {
  for (let attempt = 1; attempt <= MAX_NVIDIA_ATTEMPTS; attempt++) {
    console.log('[INVESTIGATION_TIMING]', { 
      requestId, 
      stage: 'nvidia_request_start', 
      httpAttempt: attempt,
      generationAttempt,
      model, 
      elapsedMs: Date.now() - edgeStartedAt 
    })

    const fetchStart = Date.now()
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt   },
        ],
        temperature: 0,
        top_p: 1,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      }),
    })

    console.log('[INVESTIGATION_TIMING]', {
      requestId,
      stage: 'nvidia_response_received',
      httpAttempt: attempt,
      generationAttempt,
      status: response.status,
      nvidiaDurationMs: Date.now() - fetchStart,
      elapsedMs: Date.now() - edgeStartedAt
    })

    if (response.ok) {
      const data = await response.json()
      const text: string | undefined = data.choices?.[0]?.message?.content
      if (!text) {
        const err: any = new Error('NVIDIA returned a successful response but content field is empty or missing')
        err.errorCode = AI_ERROR.EMPTY_RESPONSE
        throw err
      }
      return text
    }

    // ── Non-2xx path ──────────────────────────────────────────────────────
    const errorBody = await response.text()

    // Always log the full upstream failure for Supabase Edge Function logs
    console.error('[INVESTIGATION_ERROR]', {
      requestId,
      stage: 'nvidia_api_failure',
      attempt,
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
      model,
      elapsedMs: Date.now() - edgeStartedAt
    })

    // Parse vendor error for a cleaner description
    let errorDesc = `NVIDIA API error ${response.status}: ${errorBody}`
    let isQuota = response.status === 429

    try {
      const errJson = JSON.parse(errorBody)
      if (errJson.detail) errorDesc = errJson.detail
      if (errJson.title)  errorDesc = errJson.title
      const msgLower = errorDesc.toLowerCase()
      if (msgLower.includes('quota') || msgLower.includes('exhausted') || msgLower.includes('rate limit')) {
        isQuota = true
      }
    } catch (_) { /* errorBody was not JSON — keep the raw text description */ }

    // Auth errors → throw immediately (no retry)
    if (response.status === 401 || response.status === 403) {
      const err: any = new Error(errorDesc)
      err.errorCode = AI_ERROR.AUTH_ERROR
      throw err
    }

    // Quota / rate limit → throw immediately (no retry)
    if (isQuota) {
      const err: any = new Error(errorDesc)
      err.errorCode = AI_ERROR.QUOTA_EXHAUSTED
      throw err
    }

    // Non-503 permanent errors → throw immediately (no retry)
    if (response.status !== 503) {
      const err: any = new Error(errorDesc)
      err.errorCode = AI_ERROR.PROVIDER_ERROR
      throw err
    }

    // 503 Service Unavailable — retry if attempts remain
    if (attempt < MAX_NVIDIA_ATTEMPTS) {
      const delayMs = attempt === 1 ? 2000 : 4000
      console.warn('NVIDIA 503 overload, retrying', {
        attempt,
        maxAttempts: MAX_NVIDIA_ATTEMPTS,
        delayMs,
      })
      await sleep(delayMs)
      continue
    }

    // All attempts exhausted on 503 → throw to trigger AI_SERVICE_OVERLOADED
    const err: any = new Error(`NVIDIA 503 after ${MAX_NVIDIA_ATTEMPTS} attempts: ${errorDesc}`)
    err.errorCode = AI_ERROR.SERVICE_OVERLOADED
    throw err
  }

  // TypeScript requires a return here; the loop above always throws or returns.
  throw new Error('NVIDIA retry loop exited unexpectedly')
}

/**
 * Build a safe client-facing error message.
 * Raw error details (stack traces, internal paths) remain in Supabase logs only.
 */
function buildClientMessage(errorCode: string): string {
  switch (errorCode) {
    case AI_ERROR.SERVICE_OVERLOADED: return 'AI service is temporarily overloaded. Transaction escalated for manual review.'
    case AI_ERROR.QUOTA_EXHAUSTED:    return 'AI API quota exhausted. Transaction escalated for manual review.'
    case AI_ERROR.AUTH_ERROR:         return 'AI authentication error. Transaction escalated for manual review.'
    case AI_ERROR.EMPTY_RESPONSE:     return 'AI returned an empty response. Transaction escalated for manual review.'
    case AI_ERROR.INVALID_RESPONSE:   return 'AI returned an invalid response format. Transaction escalated for manual review.'
    case AI_ERROR.PROVIDER_ERROR:     return 'AI provider error. Transaction escalated for manual review.'
    default:                          return 'AI investigation failed. Transaction escalated for manual review.'
  }
}

/**
 * Construct a deterministic error response.
 *
 * errorCode   → the AI_ERROR constant that was thrown
 * errorType   → derived EXCLUSIVELY from ERROR_TYPE_MAP[errorCode]
 *
 * These two values are ALWAYS consistent — no secondary string scanning.
 */
function buildErrorResponse(errorCode: string): Record<string, unknown> {
  const errorType = ERROR_TYPE_MAP[errorCode] ?? 'GENERAL_FAILURE'
  return {
    classification: 'AI_UNAVAILABLE',
    errorType,
    errorCode,
    confidence: 0,
    likelyCause: null,
    explanation: buildClientMessage(errorCode),
    recommendedAction: 'NEEDS_REVIEW',
    evidence: [],
  }
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let requestId = 'unknown'
  let startedAt = Date.now()

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify(buildErrorResponse(AI_ERROR.AUTH_ERROR)),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    const token = authHeader.replace('Bearer ', '')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // Authenticate the token
    const authClient = createClient(supabaseUrl, supabaseAnonKey)
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify(buildErrorResponse(AI_ERROR.AUTH_ERROR)),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const AI_API_KEY = Deno.env.get('AI_API_KEY')?.trim()
    const AI_PROVIDER = (Deno.env.get('AI_PROVIDER') || 'GEMINI').trim().toUpperCase()
    const AI_MODEL = (
      Deno.env.get('AI_MODEL') ||
      (AI_PROVIDER === 'NVIDIA' ? 'nvidia/nemotron-3-super-120b-a12b' : 'gemini-2.0-flash')
    ).trim()
    const AI_BASE_URL = (
      Deno.env.get('AI_BASE_URL') || 'https://integrate.api.nvidia.com/v1'
    ).trim().replace(/\/$/, '')

    if (!AI_API_KEY) {
      return new Response(
        JSON.stringify(buildErrorResponse(AI_ERROR.UNAVAILABLE)),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { evidence } = await req.json()
    requestId = evidence?.requestId || 'unknown-backend-req'
    const paymentId = evidence?.payment?.payment_id || 'unknown-payment'
    startedAt = Date.now()


    console.log('[INVESTIGATION_START]', {
      requestId,
      timestamp: startedAt,
      paymentId
    })

    console.log('[INVESTIGATION_TIMING]', {
      requestId,
      stage: 'auth_complete',
      elapsedMs: Date.now() - startedAt
    })

    // ── Prompts ───────────────────────────────────────────────────────────


    /**
     * The strict system prompt for NVIDIA NIM.
     * States JSON-only output requirements.
     * Used for both the first generation and the parse-retry regeneration.
     */
    const systemPrompt = `You are a financial reconciliation classifier.

Analyze the provided transaction discrepancy.

Return exactly one valid JSON object.

Do not reveal reasoning.
Do not show step-by-step calculations.
Do not write analysis.
Do not use markdown.
Do not use code fences.
Do not write any text before or after the JSON.

Your response MUST start with { and end with }.

Use exactly this schema:

{
  "classification": "FEE_DISCREPANCY | TAX_DISCREPANCY | REFUND_DISCREPANCY | ADJUSTMENT_DISCREPANCY | AMOUNT_MISMATCH | UNEXPLAINED_DISCREPANCY",
  "confidence": number,
  "likelyCause": "string",
  "explanation": "string",
  "recommendedAction": "AUTO_RESOLVE | NEEDS_REVIEW | UNRESOLVED",
  "evidence": ["array of strings"]
}`

    /** Standard investigation request with evidence. */
    const investigationPrompt = `EVIDENCE:
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
${evidence.isDemoData ? '- Data Context: SYNTHETIC DEMO DATA\n' : ''}
Analyze this discrepancy and provide the JSON output.`


    /**
     * Parse-retry prompt — used ONLY when the first generation produced
     * content that parseAIJson could not extract valid JSON from.
     *
     * Keeps the full original evidence context and adds explicit correction.
     * This is NOT the HTTP-level 503 retry — it is a single additional
     * AI content regeneration when parsing fails.
     */
    const parseRetryPrompt = `CORRECTION REQUIRED: Your previous response could not be parsed as valid JSON.

${investigationPrompt}

ADDITIONAL JSON FORMAT REQUIREMENTS FOR THIS REGENERATION:
- Your ENTIRE response must be a single JSON object and nothing else.
- Do NOT write any sentences before or after the JSON object.
- Do NOT wrap the JSON in markdown code fences.
- Do NOT use unescaped newlines or tabs inside string values.
- Do NOT truncate the JSON — the closing } must be present.
- Do NOT return an array — return only one JSON object.`

    // ── Generate AI content ───────────────────────────────────────────────
    //
    // Parse-retry architecture (SEPARATE from HTTP 503 retry):
    //
    //   Generation 1 → callNvidiaWithRetry (handles HTTP 503 internally)
    //                → parseAIJson
    //                → success? → done
    //                → AI_INVALID_RESPONSE? → Generation 2 (parse retry)
    //   Generation 2 → callNvidiaWithRetry (handles HTTP 503 internally)
    //                → parseAIJson
    //                → success? → done
    //                → fail?    → AI_INVALID_RESPONSE (no further retry)
    //
    // Other errors (quota, auth, overload, empty) → NOT retried here.
    // Maximum total NVIDIA HTTP requests: MAX_NVIDIA_ATTEMPTS × 2 generations = 6
    // (Only reached if EVERY attempt in BOTH generations returns 503)

    console.log('[INVESTIGATION_TIMING]', {
      requestId,
      stage: 'context_ready',
      elapsedMs: Date.now() - startedAt
    })

    const MAX_PARSE_GENERATIONS = 2 // generation 1 + 1 parse-retry

    let aiResult: Record<string, unknown> | null = null
    let lastParseError: any = null

    for (let generation = 1; generation <= MAX_PARSE_GENERATIONS; generation++) {
      let text: string | undefined

      try {
        if (AI_PROVIDER === 'NVIDIA') {
          const userPrompt = generation === 1 ? investigationPrompt : parseRetryPrompt
          text = await callNvidiaWithRetry(AI_BASE_URL, AI_MODEL, AI_API_KEY, systemPrompt, userPrompt, requestId, startedAt, generation)
        } else {
          // Gemini path
          const userPrompt = generation === 1 ? investigationPrompt : parseRetryPrompt
          
          console.log('[INVESTIGATION_TIMING]', { 
            requestId, 
            stage: 'gemini_request_start', 
            generation, 
            model: AI_MODEL, 
            elapsedMs: Date.now() - startedAt 
          })
          
          const fetchStart = Date.now()
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${AI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: userPrompt }] }],
                generationConfig: {
                  temperature: 0.1,
                  responseMimeType: 'application/json',
                },
              }),
            }
          )

          console.log('[INVESTIGATION_TIMING]', {
            requestId,
            stage: 'gemini_response_received',
            generation,
            status: response.status,
            fetchDurationMs: Date.now() - fetchStart,
            elapsedMs: Date.now() - startedAt
          })

          if (!response.ok) {
            const errorBody = await response.text()
            let errorDesc = `Gemini API error: ${response.status}`
            let isQuota = response.status === 429

            try {
              const errJson = JSON.parse(errorBody)
              if (errJson.error?.message) {
                errorDesc = errJson.error.message
                const msgLower = errorDesc.toLowerCase()
                if (msgLower.includes('quota') || msgLower.includes('exhausted') || msgLower.includes('rate limit')) {
                  isQuota = true
                }
              }
            } catch (_) { /* not JSON */ }

            const err: any = new Error(errorDesc)
            err.errorCode = isQuota ? AI_ERROR.QUOTA_EXHAUSTED : AI_ERROR.PROVIDER_ERROR
            throw err
          }

          const data = await response.json()
          text = data.candidates?.[0]?.content?.parts?.[0]?.text
        }
      } catch (providerErr: any) {
        // Provider/HTTP level error (quota, auth, overload, etc.)
        // These are NOT parse errors — do NOT retry the parse generation loop.
        // Re-throw immediately so the outer catch handles them with correct errorCode.
        throw providerErr
      }

      if (!text) {
        const err: any = new Error(`Empty response from ${AI_PROVIDER} on generation ${generation}`)
        err.errorCode = AI_ERROR.EMPTY_RESPONSE
        throw err
      }

      // ── Diagnostic logging before parsing ────────────────────────────────
      console.log('AI response received', {
        provider: AI_PROVIDER,
        model: AI_MODEL,
        generation,
        contentLength: text.length,
        preview: text.slice(0, 500),
      })

      // ── Attempt parse ─────────────────────────────────────────────────────
      try {
        aiResult = parseAIJson(text, AI_MODEL, generation)
        break // ← Parse succeeded — exit generation loop
      } catch (parseErr: any) {
        lastParseError = parseErr

        if (parseErr.errorCode !== AI_ERROR.INVALID_RESPONSE) {
          // Non-parse error from inside parseAIJson (e.g. AI_EMPTY_RESPONSE
          // for a blank text that slipped through). Throw immediately.
          throw parseErr
        }

        if (generation < MAX_PARSE_GENERATIONS) {
          console.warn('AI JSON parse failed — requesting one parse-retry regeneration', {
            generation,
            model: AI_MODEL,
            parseError: parseErr.message?.slice(0, 200),
          })
          // Continue to next generation (parse-retry with stricter prompt)
          continue
        }

        // Last generation also failed — give up
        console.error('AI JSON parse failed on all generations — returning AI_INVALID_RESPONSE', {
          model: AI_MODEL,
          totalGenerations: generation,
        })
        throw parseErr
      }
    }

    if (!aiResult) {
      // Should never reach here — loop always breaks or throws
      throw lastParseError ?? new Error('AI generation loop exited without a result')
    }

    // ── Structure validation ──────────────────────────────────────────────
    validateInvestigationResult(aiResult)

    console.log('[INVESTIGATION_TIMING]', {
      requestId,
      stage: 'parse_complete',
      elapsedMs: Date.now() - startedAt
    })

    // ── Safety rules ──────────────────────────────────────────────────────
    if ((aiResult.confidence as number) < 0.9 && aiResult.recommendedAction === 'AUTO_RESOLVE') {
      aiResult.recommendedAction = 'NEEDS_REVIEW'
    }

    // Clamp confidence to [0, 1]
    aiResult.confidence = Math.max(0, Math.min(1, aiResult.confidence as number))

    console.log('[INVESTIGATION_COMPLETE]', {
      requestId,
      totalElapsedMs: Date.now() - startedAt
    })

    return new Response(JSON.stringify(aiResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    // ── Classify error and log detail server-side ─────────────────────────
    // errorCode is set on every thrown error via err.errorCode.
    // If somehow missing, default to AI_UNAVAILABLE.
    const errorCode: string = error.errorCode || AI_ERROR.UNAVAILABLE

    // Full error detail stays in Supabase logs — never in response
    console.error('[INVESTIGATION_ERROR]', {
      requestId: typeof requestId !== 'undefined' ? requestId : 'unknown',
      stage: 'global_catch',
      errorCode,
      errorName: error.name,
      safeMessage: error.message,
      elapsedMs: typeof startedAt !== 'undefined' ? Date.now() - startedAt : 0
    })

    // errorType is derived EXCLUSIVELY from ERROR_TYPE_MAP.
    // No secondary string scanning — that was the root cause of the mismatch bug.
    return new Response(
      JSON.stringify(buildErrorResponse(errorCode)),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
