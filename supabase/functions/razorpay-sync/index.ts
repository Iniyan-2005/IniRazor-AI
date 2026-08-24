// ============================================================
// IniRazorAI — Razorpay Sync Edge Function
// Supabase Edge Function (Deno/TypeScript)
// ============================================================
// Fetches payment data from Razorpay Test Mode API
// Falls back to demo data if credentials are not configured

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
    const keyId = Deno.env.get('RAZORPAY_KEY_ID')
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!keyId || !keySecret) {
      return new Response(
        JSON.stringify({
          success: false,
          mode: 'DEMO',
          message: 'Razorpay credentials not configured. Using demo data.',
          data: null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch payments from Razorpay Test Mode
    const auth = btoa(`${keyId}:${keySecret}`)
    const response = await fetch('https://api.razorpay.com/v1/payments?count=100', {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Razorpay API error: ${response.status}`)
    }

    const data = await response.json()

    return new Response(
      JSON.stringify({
        success: true,
        mode: 'RAZORPAY_TEST',
        message: `Fetched ${data.items?.length || 0} payments from Razorpay Test Mode`,
        data: data.items || [],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        mode: 'ERROR',
        message: error.message,
        data: null,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
