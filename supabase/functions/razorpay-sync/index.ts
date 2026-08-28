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
    const rzpPayments = data.items || []

    if (rzpPayments.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          mode: 'RAZORPAY_TEST',
          fetched: 0,
          inserted: 0,
          updated: 0,
          message: 'Fetched 0 payments from Razorpay Test Mode',
          data: [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Connect to Supabase using standard architecture
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Prepare normalized records
    const recordsToUpsert = rzpPayments.map((p: any) => ({
      payment_id: p.id,
      order_id: p.order_id || `direct_${p.id}`,
      amount: parseFloat((p.amount / 100).toFixed(2)),
      currency: p.currency,
      status: p.status,
      customer_name: p.email || p.contact || 'Unknown',
      payment_method: p.method || 'unknown',
      created_at: new Date(p.created_at * 1000).toISOString(),
      metadata: { source: 'RAZORPAY_TEST', ...p }
    }))

    // Fetch existing payment IDs to calculate accurate counts
    const paymentIds = recordsToUpsert.map((r: any) => r.payment_id)
    const { data: existingRecords, error: selectError } = await supabase
      .from('payments')
      .select('payment_id')
      .in('payment_id', paymentIds)

    if (selectError) {
      throw new Error(`Select error: ${selectError.message}`)
    }

    const existingIds = new Set(existingRecords?.map((r: any) => r.payment_id) || [])
    let inserted = 0
    let updated = 0

    recordsToUpsert.forEach((r: any) => {
      if (existingIds.has(r.payment_id)) {
        updated++
      } else {
        inserted++
      }
    })

    // Perform Upsert via Supabase Data API (PostgREST)
    const { error: upsertError } = await supabase
      .from('payments')
      .upsert(recordsToUpsert, { onConflict: 'payment_id', ignoreDuplicates: false })

    if (upsertError) {
      throw new Error(`Database upsert error: ${upsertError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        mode: 'RAZORPAY_TEST',
        fetched: recordsToUpsert.length,
        inserted,
        updated,
        message: `Successfully synchronized ${recordsToUpsert.length} Razorpay payments (Inserted: ${inserted}, Updated: ${updated})`,
        data: recordsToUpsert,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        mode: 'ERROR',
        message: `${error.message} (DB_URL_Len: ${Deno.env.get('SUPABASE_DB_URL')?.length})`,
        data: null,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
