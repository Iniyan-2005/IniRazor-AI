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

    // Connect to Supabase using standard architecture, but respecting RLS
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')
    const token = authHeader.replace('Bearer ', '')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    const authClient = createClient(supabaseUrl, supabaseAnonKey)
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    if (authError || !user) throw new Error('Unauthorized user')

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

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
      metadata: { source: 'RAZORPAY_TEST', ...p },
      user_id: user.id
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

    // 2. Synthesize and Upsert Settlements for captured payments
    const settlementsToUpsert: any[] = []
    rzpPayments.forEach((p: any) => {
      // In Razorpay Test Mode, create a settlement for captured payments
      if (p.status === 'captured') {
        const gross = parseFloat((p.amount / 100).toFixed(2))
        // Use Razorpay's exact fee/tax if available, otherwise fallback to 2% + 18% GST estimate
        const fee = p.fee ? parseFloat((p.fee / 100).toFixed(2)) : parseFloat((gross * 0.02).toFixed(2))
        const tax = p.tax ? parseFloat((p.tax / 100).toFixed(2)) : parseFloat((fee * 0.18).toFixed(2))
        const net = gross - fee - tax
        
        settlementsToUpsert.push({
          settlement_id: `setl_${p.id}`,
          payment_id: p.id,
          gross_amount: gross,
          fee: fee,
          tax: tax,
          adjustment: 0,
          refund: 0,
          net_amount: parseFloat(net.toFixed(2)),
          status: 'settled',
          settled_at: new Date(p.created_at * 1000).toISOString(),
          metadata: { source: 'RAZORPAY_TEST', ...p },
          user_id: user.id
        })
      }
    })

    if (settlementsToUpsert.length > 0) {
      const { error: setlError } = await supabase
        .from('settlements')
        .upsert(settlementsToUpsert, { onConflict: 'settlement_id', ignoreDuplicates: false })
        
      if (setlError) {
        throw new Error(`Settlements upsert error: ${setlError.message}`)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        mode: 'RAZORPAY_TEST',
        fetched: recordsToUpsert.length,
        inserted,
        updated,
        message: `Successfully synchronized ${recordsToUpsert.length} Razorpay payments and ${settlementsToUpsert.length} settlements`,
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
