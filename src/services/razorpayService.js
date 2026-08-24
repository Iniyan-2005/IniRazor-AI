// ============================================================
// IniRazorAI — Razorpay Service (Frontend)
// Calls the razorpay-sync Edge Function to fetch test-mode data
// ============================================================

import { isSupabaseConfigured } from './supabase.js';

/**
 * Sync payments from Razorpay Test Mode via Edge Function
 * Returns { success, mode, message, data }
 */
export const syncRazorpayData = async () => {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      mode: 'DEMO',
      message: 'Supabase not configured. Using demo data.',
      data: null,
    };
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(`${supabaseUrl}/functions/v1/razorpay-sync`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error(`Razorpay sync failed: ${response.status}`);
  }

  return await response.json();
};

/**
 * Check if Razorpay integration is available
 */
export const isRazorpayAvailable = () => {
  return isSupabaseConfigured;
};
