// ============================================================
// IniRazorAI — Fetch Reconciled Data Edge Function
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

    // 1. Fetch all reconciliations, newest first
    const { data: allRecons, error: reconError } = await supabase
      .from('reconciliations')
      .select('*')
      .order('created_at', { ascending: false });

    if (reconError) throw new Error(`Reconciliation fetch error: ${reconError.message}`);

    // 2. Deduplicate to get the latest per payment_id
    const activeReconciliations = [];
    const seenPayments = new Set();

    for (const recon of (allRecons || [])) {
      if (!seenPayments.has(recon.payment_id)) {
        seenPayments.add(recon.payment_id);
        activeReconciliations.push(recon);
      }
    }

    // 3. Fetch relevant audit logs
    let auditLogs = [];
    if (activeReconciliations.length > 0) {
      const activeIds = activeReconciliations.map(r => r.id);
      
      // Supabase OR syntax for IN array + IS NULL
      // e.g. "reconciliation_id.in.(uuid1,uuid2),reconciliation_id.is.null"
      const orQuery = `reconciliation_id.in.(${activeIds.join(',')}),reconciliation_id.is.null`;
      
      const { data: logs, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .or(orQuery)
        .order('created_at', { ascending: true });

      if (auditError) throw new Error(`Audit log fetch error: ${auditError.message}`);
      auditLogs = logs || [];
    } else {
      // If no reconciliations, just fetch system logs
      const { data: logs, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .is('reconciliation_id', null)
        .order('created_at', { ascending: true });

      if (auditError) throw new Error(`Audit log fetch error: ${auditError.message}`);
      auditLogs = logs || [];
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reconciliations: activeReconciliations,
        auditLogs: auditLogs
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
