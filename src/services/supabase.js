// ============================================================
// IniRazorAI — Supabase Client (with Demo Mode fallback)
// ============================================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if Supabase credentials are configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Create Supabase client only if configured
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Environment mode detection
export function getEnvironmentMode() {
  if (isSupabaseConfigured) {
    return 'SUPABASE_CONNECTED'
  }
  return 'DEMO_MODE'
}

export function getEnvironmentLabel() {
  const mode = getEnvironmentMode()
  switch (mode) {
    case 'SUPABASE_CONNECTED':
      return 'Razorpay Test Mode'
    default:
      return 'Demo Mode'
  }
}
