import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import TransactionDetailPage from './pages/TransactionDetailPage'
import ReconciliationPage from './pages/ReconciliationPage'
import ExceptionsPage from './pages/ExceptionsPage'
import AuditTrailPage from './pages/AuditTrailPage'
import EvaluationPage from './pages/EvaluationPage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { CursorProvider } from './contexts/CursorContext'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm">Loading...</p>
        </div>
      </div>
    )
  }
  if (!user) return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <AuthProvider>
      <CursorProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/transactions/:paymentId" element={<TransactionDetailPage />} />
            <Route path="/reconciliation" element={<ReconciliationPage />} />
            <Route path="/exceptions" element={<ExceptionsPage />} />
            <Route path="/audit" element={<AuditTrailPage />} />
            <Route path="/evaluation" element={<EvaluationPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CursorProvider>
    </AuthProvider>
  )
}

export default App
