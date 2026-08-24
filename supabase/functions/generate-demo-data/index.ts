// ============================================================
// IniRazorAI — Generate Demo Data Edge Function
// Supabase Edge Function (Deno/TypeScript)
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const INDIAN_NAMES = [
  'Aarav Sharma', 'Priya Patel', 'Vikram Singh', 'Ananya Desai', 'Rohan Mehta',
  'Sneha Gupta', 'Arjun Reddy', 'Kavitha Nair', 'Rahul Kumar', 'Deepika Iyer',
  'Amit Joshi', 'Pooja Bhatt', 'Sanjay Verma', 'Neha Kapoor', 'Rajesh Pillai',
  'Divya Agarwal', 'Karthik Menon', 'Swati Mishra', 'Manoj Tiwari', 'Lakshmi Rao',
]

const PAYMENT_METHODS = ['upi', 'card', 'netbanking', 'wallet', 'emi']

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { count = 500 } = await req.json()

    // Clear existing data
    await supabase.from('evaluation_results').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('reconciliations').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('settlements').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    const payments = []
    const settlements = []

    // Distribution: 70% normal, 10% fee/tax, 5% refund, 5% adjustment, 4% missing, 3% duplicate, 2% unexplained, 1% invalid
    for (let i = 0; i < count; i++) {
      const amount = Math.round((500 + Math.random() * 49500) * 100) / 100
      const paymentId = `pay_${String(i + 1).padStart(5, '0')}_${Math.random().toString(36).slice(2, 6)}`
      const orderId = `order_${String(i + 1).padStart(5, '0')}_${Math.random().toString(36).slice(2, 6)}`

      const payment = {
        payment_id: paymentId,
        order_id: orderId,
        amount,
        currency: 'INR',
        status: 'captured',
        customer_name: INDIAN_NAMES[i % INDIAN_NAMES.length],
        payment_method: PAYMENT_METHODS[i % PAYMENT_METHODS.length],
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {},
        ground_truth_status: 'MATCHED',
      }

      const fee = Math.round(amount * 0.02 * 100) / 100
      const tax = Math.round(fee * 0.18 * 100) / 100
      let adjustment = 0
      let refund = 0
      let netAmount = Math.round((amount - fee - tax) * 100) / 100

      const pct = i / count

      if (pct >= 0.70 && pct < 0.80) {
        // Fee/tax discrepancy
        const feeError = Math.round((Math.random() * 50 + 10) * 100) / 100
        netAmount = Math.round((netAmount - feeError) * 100) / 100
        payment.ground_truth_status = 'FEE_DISCREPANCY'
      } else if (pct >= 0.80 && pct < 0.85) {
        // Refund discrepancy
        refund = Math.round(amount * 0.1 * 100) / 100
        netAmount = Math.round((netAmount - refund * 0.5) * 100) / 100
        payment.ground_truth_status = 'REFUND_DISCREPANCY'
      } else if (pct >= 0.85 && pct < 0.90) {
        // Adjustment discrepancy
        adjustment = Math.round((Math.random() * 200 + 50) * 100) / 100
        payment.ground_truth_status = 'ADJUSTMENT_DISCREPANCY'
      } else if (pct >= 0.90 && pct < 0.94) {
        // Missing settlement
        payment.ground_truth_status = 'MISSING_SETTLEMENT'
      } else if (pct >= 0.94 && pct < 0.97) {
        // Duplicate
        payment.ground_truth_status = 'DUPLICATE'
      } else if (pct >= 0.97 && pct < 0.99) {
        // Unexplained
        netAmount = Math.round((netAmount - Math.random() * 500 - 100) * 100) / 100
        payment.ground_truth_status = 'UNKNOWN'
      } else if (pct >= 0.99) {
        // Invalid
        payment.status = 'failed'
        payment.ground_truth_status = 'INVALID'
      }

      payments.push(payment)

      // Create settlement (skip for missing settlement cases)
      if (payment.ground_truth_status !== 'MISSING_SETTLEMENT') {
        const settlement = {
          settlement_id: `setl_${String(i + 1).padStart(5, '0')}_${Math.random().toString(36).slice(2, 6)}`,
          payment_id: paymentId,
          gross_amount: amount,
          fee,
          tax,
          adjustment,
          refund,
          net_amount: netAmount,
          status: 'settled',
          settled_at: new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: {},
        }
        settlements.push(settlement)

        // Create duplicate for duplicate cases
        if (payment.ground_truth_status === 'DUPLICATE') {
          settlements.push({
            ...settlement,
            settlement_id: `setl_dup_${String(i + 1).padStart(5, '0')}_${Math.random().toString(36).slice(2, 6)}`,
          })
        }
      }
    }

    // Insert in batches
    for (let i = 0; i < payments.length; i += 50) {
      await supabase.from('payments').insert(payments.slice(i, i + 50))
    }
    for (let i = 0; i < settlements.length; i += 50) {
      await supabase.from('settlements').insert(settlements.slice(i, i + 50))
    }

    return new Response(
      JSON.stringify({
        success: true,
        payments: payments.length,
        settlements: settlements.length,
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
