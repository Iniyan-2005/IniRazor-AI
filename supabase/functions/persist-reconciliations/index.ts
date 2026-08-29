// ============================================================
// IniRazorAI — Persist Reconciliations Edge Function
// Supabase Edge Function (Deno/TypeScript)
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function generateDeterministicUuid(str: string): Promise<string> {
  const data = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  hashArray[6] = (hashArray[6] & 0x0f) | 0x50; // version 5
  hashArray[8] = (hashArray[8] & 0x3f) | 0x80; // variant
  const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.substring(0,8)}-${hex.substring(8,12)}-${hex.substring(12,16)}-${hex.substring(16,20)}-${hex.substring(20,32)}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { reconciliations } = await req.json()

    if (!Array.isArray(reconciliations)) {
      throw new Error('Invalid payload: reconciliations must be an array')
    }

    const recordsToUpsert = [];
    for (const recon of reconciliations) {
      // 1. Skip non-razorpay records if any slipped through
      if (recon.payment_id.startsWith('pay_demo_')) continue;

      // 2. Generate deterministic UUID based on semantics to ensure idempotency across runs
      // This allows multiple reconciliations per payment if they have different settlements/statuses
      const uniqueSemanticString = `${recon.payment_id}_${recon.settlement_id || 'null'}_${recon.status}`;
      const dbId = await generateDeterministicUuid(uniqueSemanticString);

      recordsToUpsert.push({
        id: dbId,
        payment_id: recon.payment_id,
        settlement_id: recon.settlement_id || null,
        expected_amount: recon.expected_amount,
        actual_amount: recon.actual_amount,
        difference: recon.difference,
        status: recon.status,
        confidence: recon.confidence,
        reason: recon.reason,
        ai_analysis: recon.ai_analysis || null,
        recommended_action: recon.recommended_action || null,
        final_action: recon.final_action || null,
        created_at: recon.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    if (recordsToUpsert.length === 0) {
       return new Response(
        JSON.stringify({ success: true, count: 0, message: "No applicable records to upsert" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { error } = await supabase
      .from('reconciliations')
      .upsert(recordsToUpsert, { onConflict: 'id' })

    if (error) {
      throw new Error(`Database upsert error: ${error.message}`)
    }

    return new Response(
      JSON.stringify({ success: true, count: recordsToUpsert.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
