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

// Infrastructure detection
export function getInfrastructureMode() {
  if (isSupabaseConfigured) {
    return 'SUPABASE_CONNECTED'
  }
  return 'NOT_CONFIGURED'
}

export function getInfrastructureLabel() {
  const mode = getInfrastructureMode()
  switch (mode) {
    case 'SUPABASE_CONNECTED':
      return 'Connected'
    default:
      return 'Not Configured'
  }
}
