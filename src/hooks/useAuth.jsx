// ============================================================
// IniRazorAI - Authentication Hook (Supabase Auth)
// ============================================================
// Uses Supabase Auth if configured, otherwise falls back to local demo auth.
import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase, isSupabaseConfigured } from '../services/supabase'

const AuthContext = createContext(null)

const DEMO_USERS = [
  { email: 'admin@inirazor.ai', password: 'admin123', name: 'Finance Admin', role: 'admin' },
  { email: 'reviewer@inirazor.ai', password: 'review123', name: 'Finance Reviewer', role: 'reviewer' },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem('inirazor_user')
      if (stored) {
        try { setUser(JSON.parse(stored)) } catch { localStorage.removeItem('inirazor_user') }
      }
      setLoading(false)
      return
    }

    // Supabase Auth — use onAuthStateChange as the single source of truth.
    // This fires immediately with the current session (INITIAL_SESSION event) AND
    // fires again when the OAuth token lands in the URL hash (SIGNED_IN event).
    // Setting loading = false only here (not in getSession) ensures ProtectedRoute
    // never redirects away before the OAuth callback tokens have been processed.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      setLoading(false)
      if (event === 'SIGNED_IN' && session?.user) {
        const name = session.user.user_metadata?.full_name || session.user.email || 'User'
        // Only show welcome toast for OAuth sign-ins that were explicitly initiated in this session
        if (session.user.app_metadata?.provider === 'google') {
          if (sessionStorage.getItem('is_oauth_login') === 'true') {
            toast.success(`Welcome, ${name}!`)
            sessionStorage.removeItem('is_oauth_login')
          }
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ─── Helper: build the OAuth redirect URL from the current browser origin ───
  // Always derives from window.location.origin — never hardcoded.
  // Strips any trailing slash from origin before appending the path.
  const getOAuthRedirectUrl = () => {
    const origin = window.location.origin.replace(/\/$/, '')
    return `${origin}/dashboard`
  }

  const login = async (email, password) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        toast.error('Invalid credentials or user not created in Supabase Auth.')
        return { success: false, error: error.message }
      }
      const name = data?.user?.user_metadata?.full_name || data?.user?.user_metadata?.name || email.split('@')[0] || 'User'
      toast.success(`Welcome back, ${name}!`)
      return { success: true }
    }

    // Offline Demo Mode authentication fallback
    const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password)
    if (demoUser) {
      const userData = { email: demoUser.email, name: demoUser.name, role: demoUser.role }
      setUser(userData)
      localStorage.setItem('inirazor_user', JSON.stringify(userData))
      toast.success(`Welcome back, ${demoUser.name}! (Offline Mode)`)
      return { success: true }
    }
    toast.error('Invalid credentials. Use demo credentials to sign in.')
    return { success: false, error: 'Invalid credentials' }
  }

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Google Sign-In requires Supabase to be configured.' }
    }
    
    // Set a flag so the auth listener knows this was an explicit login, preventing ghost toasts on reload
    sessionStorage.setItem('is_oauth_login', 'true')
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getOAuthRedirectUrl(),
      },
    })
    if (error) {
      sessionStorage.removeItem('is_oauth_login')
      return { success: false, error: error.message }
    }
    // Browser navigates away to Google — no further action needed here
    return { success: true }
  }

  const signup = async (email, password) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Sign up requires Supabase to be configured.' }
    }
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      return { success: false, error: error.message }
    }
    // If session is immediately created, user is logged in (email confirmation disabled)
    // If not, user needs to confirm email first
    const needsConfirmation = !data.session
    return { success: true, needsConfirmation }
  }

  const sendPasswordReset = async (email) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Password reset requires Supabase to be configured.' }
    }
    const redirectTo = `${window.location.origin}/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  }

  const updatePassword = async (newPassword) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Password update requires Supabase to be configured.' }
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  }

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    } else {
      setUser(null)
      localStorage.removeItem('inirazor_user')
    }
    toast.success('Signed out successfully')
  }

  // ─── Standardized User Profile Derivation ───
  const userProfile = (() => {
    if (!user) return null

    if (!isSupabaseConfigured) {
      return {
        name: user.name || 'Demo User',
        email: user.email,
        avatar: null,
        providerLabel: 'Demo Access',
        isDemo: true,
      }
    }

    const provider = user.app_metadata?.provider
    let providerLabel = 'Signed in with Supabase'
    if (provider === 'google') providerLabel = 'Signed in with Google'
    else if (provider === 'email') providerLabel = 'Signed in with Email'
    else if (provider) providerLabel = `Signed in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`

    let name = user.user_metadata?.full_name || user.user_metadata?.name || user.name
    if (!name) name = user.email ? user.email.split('@')[0] : 'User'

    return {
      name,
      email: user.email,
      avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      providerLabel,
      isDemo: false,
    }
  })()

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, login, logout, signup, sendPasswordReset, updatePassword, signInWithGoogle, isSupabaseConfigured }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
