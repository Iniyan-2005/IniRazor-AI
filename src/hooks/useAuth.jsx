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
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
