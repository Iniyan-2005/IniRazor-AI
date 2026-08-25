import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { ThemeProvider } from './hooks/useTheme.jsx'
import './index.css'

// Themed Toaster — uses CSS vars via inline style injection
// This component reads current theme from dom to pick correct colors
function ThemedToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        className: '',
        style: {
          // We use a dark background for toasts in all modes for readability
          // (toasts are transient overlays — a dark surface works universally)
          background: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          fontSize: '14px',
          padding: '12px 16px',
          borderRadius: '10px',
        },
        success: {
          iconTheme: { primary: '#10b981', secondary: '#ffffff' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
        },
        loading: {
          iconTheme: { primary: '#3b82f6', secondary: '#ffffff' },
        },
      }}
    />
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
        <ThemedToaster />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
