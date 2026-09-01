import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import toast from 'react-hot-toast';
import { Lock, Mail, Brain, Loader2, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import logo from '../assets/logo.jpg';
import ThemeToggle from '../components/ThemeToggle.jsx';

// ─── Shared style helpers ─────────────────────────────────────────────────────
const labelStyle = {
  display: 'block',
  fontSize: '0.6875rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--text-muted)',
  marginBottom: '0.375rem',
};

const errorStyle = {
  fontSize: '0.75rem',
  color: 'var(--danger)',
  marginTop: '0.25rem',
};

// ─── Show/Hide password toggle ────────────────────────────────────────────────
function TogglePasswordBtn({ show, onToggle }) {
  return (
    <button
      type="button"
      aria-label={show ? 'Hide password' : 'Show password'}
      onClick={onToggle}
      tabIndex={0}
      style={{
        position: 'absolute',
        right: '0.75rem',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        padding: '0.125rem',
      }}
    >
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );
}

// ─── Brand block ──────────────────────────────────────────────────────────────
function BrandBlock() {
  return (
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
      <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
        IniRazorAI
      </h1>
      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
        AI-Powered Finance Controller
      </p>
    </div>
  );
}

// ─── SIGN IN VIEW ─────────────────────────────────────────────────────────────
function SignInView({ onGoSignUp, onGoForgot }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result && result.success) {
        navigate('/dashboard');
      } else {
        toast.error('Invalid email or password');
      }
    } catch {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
        Sign in to your account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="signin-email" style={labelStyle}>Email address</label>
          <div className="input-icon-wrapper">
            <Mail className="input-icon" />
            <input
              id="signin-email"
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
            <label htmlFor="signin-password" style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
            <button
              type="button"
              onClick={onGoForgot}
              style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}
            >
              Forgot password?
            </button>
          </div>
          <div className="input-icon-wrapper">
            <Lock className="input-icon" />
            <input
              id="signin-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-with-icon"
              placeholder="••••••••"
              style={{ paddingRight: '2.5rem' }}
            />
            <TogglePasswordBtn show={showPassword} onToggle={() => setShowPassword(v => !v)} />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Switch to Sign Up */}
      <p style={{ fontSize: '0.8125rem', textAlign: 'center', color: 'var(--text-muted)', marginTop: '1.25rem' }}>
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onGoSignUp}
          style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }}
        >
          Sign up
        </button>
      </p>

      {/* Demo credentials */}
      <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
        <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.625rem' }}>
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
              style={{ padding: '0.625rem 0.75rem', backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-2)'; }}
            >
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{cred.label}</p>
              <p style={{ fontSize: '0.6875rem', fontFamily: 'monospace', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{cred.email}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SIGN UP VIEW ─────────────────────────────────────────────────────────────
function SignUpView({ onGoSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const { signup, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!email) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address.';
    if (!password) e.password = 'Password is required.';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (!confirm) e.confirm = 'Please confirm your password.';
    else if (confirm !== password) e.confirm = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const result = await signup(email, password);
      if (!result.success) {
        const msg = result.error || 'Sign up failed.';
        if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('email address is already')) {
          setErrors({ email: 'An account with this email already exists. Try signing in.' });
        } else if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('weak')) {
          setErrors({ password: 'Password is too weak. Use a stronger password.' });
        } else {
          toast.error(msg);
        }
        return;
      }
      if (result.needsConfirmation) {
        setDone(true);
      } else {
        toast.success('Account created! Welcome to IniRazorAI.');
        navigate('/dashboard');
      }
    } catch {
      toast.error('Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="card" style={{ padding: '2rem' }}>
        <button type="button" onClick={onGoSignIn} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </button>
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Sign up is only available when Supabase is configured. Use the demo credentials to explore the app.
          </p>
          <button type="button" onClick={onGoSignIn} className="btn-primary" style={{ marginTop: '1.25rem' }}>
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <CheckCircle2 style={{ width: '2.5rem', height: '2.5rem', color: 'var(--success)', margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Check your email</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account, then sign in.
        </p>
        <button type="button" onClick={onGoSignIn} className="btn-primary w-full">
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '2rem' }}>
      <button type="button" onClick={onGoSignIn} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
      </button>

      <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
        Create your account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="signup-email" style={labelStyle}>Email address</label>
          <div className="input-icon-wrapper">
            <Mail className="input-icon" />
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
              className="input-with-icon"
              placeholder="you@example.com"
              style={errors.email ? { borderColor: 'var(--danger)' } : {}}
            />
          </div>
          {errors.email && <p style={errorStyle}>{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="signup-password" style={labelStyle}>Password</label>
          <div className="input-icon-wrapper">
            <Lock className="input-icon" />
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })); }}
              className="input-with-icon"
              placeholder="At least 6 characters"
              style={{ paddingRight: '2.5rem', ...(errors.password ? { borderColor: 'var(--danger)' } : {}) }}
            />
            <TogglePasswordBtn show={showPassword} onToggle={() => setShowPassword(v => !v)} />
          </div>
          {errors.password && <p style={errorStyle}>{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="signup-confirm" style={labelStyle}>Confirm password</label>
          <div className="input-icon-wrapper">
            <Lock className="input-icon" />
            <input
              id="signup-confirm"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setErrors(prev => ({ ...prev, confirm: undefined })); }}
              className="input-with-icon"
              placeholder="••••••••"
              style={{ paddingRight: '2.5rem', ...(errors.confirm ? { borderColor: 'var(--danger)' } : {}) }}
            />
            <TogglePasswordBtn show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
          </div>
          {errors.confirm && <p style={errorStyle}>{errors.confirm}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
          ) : (
            'Sign Up'
          )}
        </button>
      </form>

      <p style={{ fontSize: '0.8125rem', textAlign: 'center', color: 'var(--text-muted)', marginTop: '1.25rem' }}>
        Already have an account?{' '}
        <button
          type="button"
          onClick={onGoSignIn}
          style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }}
        >
          Sign in
        </button>
      </p>
    </div>
  );
}

// ─── FORGOT PASSWORD VIEW ─────────────────────────────────────────────────────
function ForgotPasswordView({ onGoSignIn }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { sendPasswordReset, isSupabaseConfigured } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Email is required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address.'); return; }
    setError('');
    setLoading(true);
    try {
      const result = await sendPasswordReset(email);
      if (!result.success) {
        setError(result.error || 'Failed to send reset email.');
        return;
      }
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="card" style={{ padding: '2rem' }}>
        <button type="button" onClick={onGoSignIn} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </button>
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Password reset requires Supabase to be configured. Use the demo credentials to sign in.
          </p>
          <button type="button" onClick={onGoSignIn} className="btn-primary" style={{ marginTop: '1.25rem' }}>
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <CheckCircle2 style={{ width: '2.5rem', height: '2.5rem', color: 'var(--success)', margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Reset link sent</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          If an account exists for <strong>{email}</strong>, a password reset link has been sent. Check your inbox and spam folder.
        </p>
        <button type="button" onClick={onGoSignIn} className="btn-primary w-full">
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '2rem' }}>
      <button type="button" onClick={onGoSignIn} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
      </button>

      <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
        Reset your password
      </h2>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="forgot-email" style={labelStyle}>Email address</label>
          <div className="input-icon-wrapper">
            <Mail className="input-icon" />
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="input-with-icon"
              placeholder="you@example.com"
              style={error ? { borderColor: 'var(--danger)' } : {}}
            />
          </div>
          {error && <p style={errorStyle}>{error}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>
    </div>
  );
}

// ─── ROOT PAGE ────────────────────────────────────────────────────────────────
const LoginPage = () => {
  const [view, setView] = useState('signin'); // 'signin' | 'signup' | 'forgot'

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative"
      style={{ backgroundColor: 'var(--bg-app)' }}
    >
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <BrandBlock />

        {view === 'signin' && (
          <SignInView
            onGoSignUp={() => setView('signup')}
            onGoForgot={() => setView('forgot')}
          />
        )}
        {view === 'signup' && (
          <SignUpView onGoSignIn={() => setView('signin')} />
        )}
        {view === 'forgot' && (
          <ForgotPasswordView onGoSignIn={() => setView('signin')} />
        )}
      </div>
    </div>
  );
};

export default LoginPage;

