// ============================================================
// IniRazorAI — Persist Audit Logs Edge Function
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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, message: 'Missing authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const token = authHeader.replace('Bearer ', '')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Authenticate the token
    const authClient = createClient(supabaseUrl, supabaseAnonKey)
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized access' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Initialize privileged client for DB operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { logs } = await req.json()

    if (!Array.isArray(logs)) {
      throw new Error('Invalid payload: logs must be an array')
    }

    const recordsToInsert = [];
    for (const log of logs) {
      recordsToInsert.push({
        id: log.id, // Now natively UUIDv4 from frontend
        reconciliation_id: log.reconciliation_id || null, // Native UUIDv4
        event_type: log.event_type,
        actor: log.actor || 'SYSTEM',
        action: log.action || null,
        input_snapshot: log.input_snapshot || null,
        reasoning: log.reasoning || null,
        decision: log.decision || null,
        confidence: log.confidence || null,
        created_at: log.created_at || new Date().toISOString(),
      });
    }

    if (recordsToInsert.length === 0) {
       return new Response(
        JSON.stringify({ success: true, count: 0, message: "No applicable records to insert" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Append-only logic. Using 'upsert' with 'onConflict: id' guarantees idempotency on network retries.
    // Since IDs are randomly generated UUIDs, status changes create NEW logs.
    const { error } = await supabase
      .from('audit_logs')
      .upsert(recordsToInsert, { onConflict: 'id' })

    if (error) {
      throw new Error(`Database upsert error: ${error.message}`)
    }

    return new Response(
      JSON.stringify({ success: true, count: recordsToInsert.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
