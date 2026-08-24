// ============================================================
// IniRazorAI — Evaluate Results Edge Function
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

    // Fetch reconciliations and payments (for ground truth)
    const { data: reconciliations } = await supabase.from('reconciliations').select('*')
    const { data: payments } = await supabase.from('payments').select('payment_id, ground_truth_status')

    if (!reconciliations || !payments) {
      throw new Error('No data available for evaluation')
    }

    const paymentMap = new Map(payments.map(p => [p.payment_id, p.ground_truth_status]))
    const results = []

    let tp = 0, fp = 0, fn = 0, tn = 0

    for (const recon of reconciliations) {
      const groundTruth = paymentMap.get(recon.payment_id)
      if (!groundTruth) continue

      const systemResolved = ['MATCHED', 'AI_RESOLVED'].includes(recon.status)
      const truthIsClean = groundTruth === 'MATCHED'

      const correct = (systemResolved && truthIsClean) || (!systemResolved && !truthIsClean)
      const falsePositive = systemResolved && !truthIsClean
      const falseNegative = !systemResolved && truthIsClean

      if (systemResolved && truthIsClean) tp++
      else if (systemResolved && !truthIsClean) fp++
      else if (!systemResolved && truthIsClean) fn++
      else tn++

      results.push({
        reconciliation_id: recon.id,
        ground_truth: groundTruth,
        predicted_result: recon.status,
        correct,
        false_positive: falsePositive,
        false_negative: falseNegative,
      })
    }

    // Clear old evaluation results
    await supabase.from('evaluation_results').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Insert new results
    for (let i = 0; i < results.length; i += 50) {
      await supabase.from('evaluation_results').insert(results.slice(i, i + 50))
    }

    const total = tp + fp + fn + tn
    const accuracy = total > 0 ? (tp + tn) / total : 0
    const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0
    const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0
    const f1 = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0

    return new Response(
      JSON.stringify({
        success: true,
        metrics: {
          total,
          truePositives: tp,
          falsePositives: fp,
          trueNegatives: tn,
          falseNegatives: fn,
          accuracy,
          precision,
          recall,
          f1,
          falsePositiveRate: (fp + tn) > 0 ? fp / (fp + tn) : 0,
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
