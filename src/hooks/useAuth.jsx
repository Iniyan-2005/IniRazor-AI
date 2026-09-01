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

    // Supabase Auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        toast.error('Invalid credentials or user not created in Supabase Auth.')
        return { success: false, error: error.message }
      }
      const demoUser = DEMO_USERS.find(u => u.email === email)
      toast.success(`Welcome back, ${demoUser ? demoUser.name : 'User'}!`)
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (error) {
      return { success: false, error: error.message }
    }
    // Browser will redirect to Google — no further action needed here
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

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, sendPasswordReset, updatePassword, signInWithGoogle, isSupabaseConfigured }}>
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
