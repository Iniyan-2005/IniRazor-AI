import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import toast from 'react-hot-toast';
import { Lock, Mail, Brain, Loader2 } from 'lucide-react';
import logo from '../assets/logo.jpg';
import ThemeToggle from '../components/ThemeToggle.jsx';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (err) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative"
      style={{ backgroundColor: 'var(--bg-app)' }}
    >
      {/* Theme toggle — top right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Card container */}
      <div className="w-full max-w-sm">
        {/* Brand block */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-5">
            <img
              src={logo}
              alt="IniRazorAI Logo"
              className="w-16 h-16 rounded-2xl object-cover"
              style={{ boxShadow: 'var(--shadow-lg)' }}
            />
            <span
              className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary)', boxShadow: 'var(--shadow-card)' }}
            >
              <Brain className="w-3.5 h-3.5 text-white" />
            </span>
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            IniRazorAI
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            AI-Powered Finance Controller
          </p>
        </div>

        {/* Form card */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-muted)',
                  marginBottom: '0.375rem',
                }}
              >
                Email address
              </label>
              <div className="input-icon-wrapper">
                <Mail className="input-icon" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-with-icon"
                  placeholder="admin@inirazor.ai"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-muted)',
                  marginBottom: '0.375rem',
                }}
              >
                Password
              </label>
              <div className="input-icon-wrapper">
                <Lock className="input-icon" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-with-icon"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <p
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
                marginBottom: '0.625rem',
              }}
            >
              Demo credentials
            </p>
            <div className="space-y-1.5">
              {[
                { label: 'Finance Admin', email: 'admin@inirazor.ai', password: 'admin123' },
                { label: 'Finance Reviewer', email: 'reviewer@inirazor.ai', password: 'review123' },
              ].map((cred) => (
                <button
                  key={cred.email}
                  type="button"
                  onClick={() => { setEmail(cred.email); setPassword(cred.password); }}
                  className="w-full text-left rounded-lg transition-colors"
                  style={{
                    padding: '0.625rem 0.75rem',
                    backgroundColor: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-subtle)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface-3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface-2)';
                  }}
                >
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {cred.label}
                  </p>
                  <p style={{ fontSize: '0.6875rem', fontFamily: 'monospace', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                    {cred.email}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
