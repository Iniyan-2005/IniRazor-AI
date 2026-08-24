// ============================================================
// IniRazorAI — Authentication Hook (Demo Mode)
// ============================================================
// In Demo Mode: simple local auth with localStorage
// With Supabase: uses Supabase Auth
import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

const DEMO_USERS = [
  { email: 'admin@inirazor.ai', password: 'admin123', name: 'Finance Admin', role: 'admin' },
  { email: 'reviewer@inirazor.ai', password: 'review123', name: 'Finance Reviewer', role: 'reviewer' },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const stored = localStorage.getItem('inirazor_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('inirazor_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    // Demo Mode authentication
    const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password)
    if (demoUser) {
      const userData = { email: demoUser.email, name: demoUser.name, role: demoUser.role }
      setUser(userData)
      localStorage.setItem('inirazor_user', JSON.stringify(userData))
      toast.success(`Welcome back, ${demoUser.name}!`)
      return { success: true }
    }
    toast.error('Invalid credentials. Use demo credentials to sign in.')
    return { success: false, error: 'Invalid credentials' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('inirazor_user')
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
