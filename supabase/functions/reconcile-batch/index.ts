// ============================================================
// IniRazorAI — Reconcile Batch Edge Function
// Supabase Edge Function (Deno/TypeScript)
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch all payments and settlements
    const { data: payments, error: pErr } = await supabase.from('payments').select('*')
    if (pErr) throw pErr

    const { data: settlements, error: sErr } = await supabase.from('settlements').select('*')
    if (sErr) throw sErr

    const startTime = Date.now()
    const results = []
    const auditLogs = []
    const tolerance = 1.0
    const confidenceThreshold = 0.9

    for (const payment of payments) {
      const matchingSettlements = settlements.filter(s => s.payment_id === payment.payment_id)

      let reconciliation = {
        payment_id: payment.payment_id,
        settlement_id: null,
        expected_amount: null,
        actual_amount: null,
        difference: null,
        status: 'PENDING',
        confidence: 0,
        reason: '',
        ai_analysis: null,
        recommended_action: null,
        final_action: null,
      }

      if (matchingSettlements.length === 0) {
        reconciliation.status = 'MISSING_SETTLEMENT'
        reconciliation.confidence = 1.0
        reconciliation.reason = 'No settlement record found for this payment'
        reconciliation.recommended_action = 'NEEDS_REVIEW'
      } else if (matchingSettlements.length > 1) {
        reconciliation.status = 'DUPLICATE'
        reconciliation.confidence = 1.0
        reconciliation.settlement_id = matchingSettlements[0].settlement_id
        reconciliation.reason = `${matchingSettlements.length} settlement records found for this payment`
        reconciliation.recommended_action = 'NEEDS_REVIEW'
      } else {
        const settlement = matchingSettlements[0]
        reconciliation.settlement_id = settlement.settlement_id

        const expectedNet = settlement.gross_amount - settlement.fee - settlement.tax + settlement.adjustment - settlement.refund
        reconciliation.expected_amount = parseFloat(expectedNet.toFixed(2))
        reconciliation.actual_amount = settlement.net_amount
        reconciliation.difference = parseFloat((reconciliation.actual_amount - reconciliation.expected_amount).toFixed(2))

        const absDiff = Math.abs(reconciliation.difference)

        if (absDiff <= tolerance) {
          reconciliation.status = 'MATCHED'
          reconciliation.confidence = 1.0
          reconciliation.reason = 'Payment and settlement match within tolerance'
        } else {
          // Deterministic classification attempt
          reconciliation.status = 'AMOUNT_MISMATCH'
          reconciliation.reason = `Unexplained difference of ₹${absDiff}`
          reconciliation.recommended_action = 'NEEDS_REVIEW'

          // Try AI investigation
          try {
            const aiResponse = await fetch(`${supabaseUrl}/functions/v1/investigate-exception`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({
                evidence: {
                  payment,
                  settlement,
                  expectedAmount: reconciliation.expected_amount,
                  actualAmount: reconciliation.actual_amount,
                  difference: reconciliation.difference,
                  knownFees: settlement.fee,
                  knownTax: settlement.tax,
                  knownRefund: settlement.refund,
                  knownAdjustment: settlement.adjustment,
                },
              }),
            })

            const aiResult = await aiResponse.json()
            reconciliation.ai_analysis = aiResult

            if (aiResult.confidence >= confidenceThreshold && aiResult.recommendedAction === 'AUTO_RESOLVE') {
              reconciliation.status = 'AI_RESOLVED'
              reconciliation.confidence = aiResult.confidence
              reconciliation.reason = aiResult.explanation
              reconciliation.recommended_action = 'AUTO_RESOLVE'
              reconciliation.final_action = 'AI_RESOLVED'
            } else {
              reconciliation.status = aiResult.classification || 'NEEDS_REVIEW'
              reconciliation.confidence = aiResult.confidence
              reconciliation.reason = aiResult.explanation
              reconciliation.recommended_action = aiResult.recommendedAction
            }
          } catch (aiErr) {
            reconciliation.ai_analysis = { error: aiErr.message }
            reconciliation.status = 'AI_UNAVAILABLE'
            reconciliation.reason = 'AI investigation failed; transaction escalated for manual review.'
            reconciliation.recommended_action = 'NEEDS_REVIEW'
          }
        }
      }

      // Insert reconciliation
      const { data: reconData, error: reconErr } = await supabase
        .from('reconciliations')
        .insert(reconciliation)
        .select()
        .single()
      if (reconErr) throw reconErr

      // Create audit log
      const auditLog = {
        reconciliation_id: reconData.id,
        event_type: reconciliation.status === 'MATCHED' ? 'DETERMINISTIC_MATCH' : 'EXCEPTION_DETECTED',
        actor: reconciliation.ai_analysis ? 'AI_AGENT' : 'SYSTEM',
        action: `Reconciliation: ${reconciliation.status}`,
        reasoning: reconciliation.reason,
        decision: reconciliation.status,
        confidence: reconciliation.confidence,
      }

      await supabase.from('audit_logs').insert(auditLog)
      results.push(reconData)
    }

    const processingTime = Date.now() - startTime

    return new Response(
      JSON.stringify({
        success: true,
        total: results.length,
        processingTime,
        stats: {
          matched: results.filter(r => r.status === 'MATCHED').length,
          aiResolved: results.filter(r => r.status === 'AI_RESOLVED').length,
          needsReview: results.filter(r => ['NEEDS_REVIEW', 'AMOUNT_MISMATCH', 'UNEXPLAINED_DISCREPANCY'].includes(r.status)).length,
          unresolved: results.filter(r => r.status === 'UNRESOLVED').length,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
