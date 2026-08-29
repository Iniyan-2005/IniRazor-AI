// ============================================================
// IniRazorAI — Fetch Payments Edge Function
// Supabase Edge Function (Deno/TypeScript)
// ============================================================
// Securely fetches persisted payments for the frontend
// using the service_role key to bypass RLS.

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
    
    // Initialize standard Supabase client with service role to securely bypass RLS on the server
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fixed, non-arbitrary query with deterministic ordering and bounded limit
    const { data, error } = await supabase
      .from('payments')
      .select('*, settlements(*)')
      .order('created_at', { ascending: false })
      .limit(1000)

    if (error) {
      throw new Error(`Select error: ${error.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: data || [],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
        data: null,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
