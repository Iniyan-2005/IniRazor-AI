import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Brain,
  Menu,
  X,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Zap,
  Database,
  LineChart,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle.jsx';
import logo from '../assets/logo.jpg';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll for sticky navbar blur effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'backdrop-blur-md border-b'
            : 'bg-transparent border-transparent'
        }`}
        style={{
          backgroundColor: isScrolled ? 'color-mix(in srgb, var(--bg-surface) 80%, transparent)' : 'transparent',
          borderColor: isScrolled ? 'var(--border)' : 'transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="relative">
                <img
                  src={logo}
                  alt="IniRazorAI Logo"
                  className="w-9 h-9 rounded-lg object-cover"
                  style={{ boxShadow: 'var(--shadow-card)' }}
                />
                <span
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--primary)', boxShadow: 'var(--shadow-card)' }}
                >
                  <Brain className="w-2.5 h-2.5 text-white" />
                </span>
              </div>
              <span className="font-bold text-lg tracking-tight">IniRazorAI</span>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400" style={{ color: 'var(--text-secondary)' }}>How It Works</a>
              <a href="#features" className="text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400" style={{ color: 'var(--text-secondary)' }}>Features</a>
              <a href="#ai-insights" className="text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400" style={{ color: 'var(--text-secondary)' }}>AI Insights</a>
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              <Link to="/login" className="text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400" style={{ color: 'var(--text-secondary)' }}>
                Login
              </Link>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary text-sm px-5 py-2"
              >
                Try the Dashboard
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                style={{ color: 'var(--text-primary)' }}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden border-b animate-in slide-in-from-top-2"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
          >
            <div className="px-4 pt-2 pb-6 space-y-4 shadow-lg">
              <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium" style={{ color: 'var(--text-secondary)' }}>How It Works</a>
              <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium" style={{ color: 'var(--text-secondary)' }}>Features</a>
              <a href="#ai-insights" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium" style={{ color: 'var(--text-secondary)' }}>AI Insights</a>
              <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <Link to="/login" className="block w-full text-center mb-3 px-3 py-2 rounded-md text-base font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Login
                </Link>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full btn-primary justify-center"
                >
                  Try the Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 opacity-20 blur-[100px] pointer-events-none rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Hero Content */}
            <div className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0 page-enter">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-6 border" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary-text)', borderColor: 'color-mix(in srgb, var(--primary) 20%, transparent)' }}>
                <Zap className="w-4 h-4" />
                <span>Built for Razorpay Buildathon</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.15]">
                Your AI Finance <br className="hidden lg:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  Controller
                </span> for Every Transaction.
              </h1>
              
              <p className="text-lg sm:text-xl mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0" style={{ color: 'var(--text-secondary)' }}>
                Connect your payment data and let AI turn thousands of transactions into clear insights, anomalies, trends, and actions.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => navigate('/login')}
                  className="btn-primary w-full sm:w-auto px-8 py-3.5 text-base rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Explore Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
                <a 
                  href="#how-it-works"
                  className="btn-secondary w-full sm:w-auto px-8 py-3.5 text-base rounded-xl"
                >
                  See How It Works
                </a>
              </div>
            </div>

            {/* Hero Visual - Abstract Data Visualization */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none stagger-enter">
              {/* Main Node */}
              <div className="relative aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden border" style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border)' }}>
                {/* Simulated grid background */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--text-primary) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                
                {/* Floating elements simulating AI processing */}
                <div className="absolute inset-0 flex items-center justify-center">
                  
                  {/* Central AI Node */}
                  <div className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-md border border-white/10" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--ai) 100%)' }}>
                    <Brain className="w-10 h-10 text-white animate-pulse" />
                    
                    {/* Pulsing rings */}
                    <div className="absolute inset-0 rounded-full border border-white/30 animate-ping opacity-20" style={{ animationDuration: '3s' }}></div>
                  </div>

                  {/* Flow lines (SVG) */}
                  <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.4 }}>
                    <path d="M 0,100 C 100,100 150,50 200,50" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite]" />
                    <path d="M 0,250 C 100,250 150,150 200,150" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_15s_linear_infinite]" />
                  </svg>
                  
                  {/* Insight Cards (Floating) */}
                  <div className="absolute top-8 right-8 card p-3 shadow-lg flex items-center gap-3 animate-[float_6s_ease-in-out_infinite]" style={{ backgroundColor: 'var(--bg-surface)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--success-subtle)', color: 'var(--success)' }}>
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Revenue Trend</p>
                      <p className="text-xs font-medium" style={{ color: 'var(--success)' }}>+18.4% this week</p>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-12 left-6 card p-3 shadow-lg flex items-center gap-3 animate-[float_7s_ease-in-out_infinite_reverse]" style={{ backgroundColor: 'var(--bg-surface)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--warning-subtle)', color: 'var(--warning)' }}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Anomaly Detected</p>
                      <p className="text-xs font-medium" style={{ color: 'var(--warning)' }}>Unusual marketing spend</p>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-6 right-10 card p-3 shadow-lg flex items-center gap-3 animate-[float_8s_ease-in-out_infinite]" style={{ backgroundColor: 'var(--bg-surface)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--ai-subtle)', color: 'var(--ai)' }}>
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>AI Insight</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Cash flow optimized</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>
      
      {/* ── Problem → Solution Storytelling ─────────────────────────────── */}
      <section className="py-24" style={{ backgroundColor: 'var(--bg-surface-2)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Problem */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6 leading-tight">
                Your transactions are telling a story. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  Are you listening?
                </span>
              </h2>
              
              <div className="card p-6 shadow-sm overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--bg-surface)] z-10"></div>
                <div className="space-y-3 opacity-60">
                  {/* Fake Raw Data */}
                  <div className="flex justify-between items-center text-sm font-mono">
                    <span style={{ color: 'var(--text-muted)' }}>TXN_8921 • Amazon Web Serv...</span>
                    <span className="text-red-500">-₹42,000</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-mono">
                    <span style={{ color: 'var(--text-muted)' }}>TXN_8922 • Stripe Payout</span>
                    <span className="text-emerald-500">+₹1,25,000</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-mono">
                    <span style={{ color: 'var(--text-muted)' }}>TXN_8923 • Facebook Ads</span>
                    <span className="text-red-500">-₹18,500</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-mono">
                    <span style={{ color: 'var(--text-muted)' }}>TXN_8924 • GitHub Global</span>
                    <span className="text-red-500">-₹899</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-mono">
                    <span style={{ color: 'var(--text-muted)' }}>TXN_8925 • Google Workspace</span>
                    <span className="text-red-500">-₹2,400</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: AI Solution */}
            <div className="relative">
              {/* Connecting line for desktop */}
              <div className="hidden lg:block absolute top-1/2 -left-12 w-12 h-[2px] bg-gradient-to-r from-transparent to-[var(--primary)] -translate-y-1/2"></div>
              
              <div className="card p-8 shadow-lg border border-[var(--primary)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] opacity-5 blur-[50px] rounded-full"></div>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--ai) 100%)' }}>
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">AI Finance Controller</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-[var(--border)]" style={{ backgroundColor: 'var(--bg-surface-2)' }}>
                    <p className="text-sm font-medium flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 mt-0.5 text-blue-500" />
                      Marketing spend increased 23% this month.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-[var(--border)]" style={{ backgroundColor: 'var(--bg-surface-2)' }}>
                    <p className="text-sm font-medium flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-500" />
                      3 transactions show unusual behaviour.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-[var(--border)]" style={{ backgroundColor: 'var(--bg-surface-2)' }}>
                    <p className="text-sm font-medium flex items-start gap-2">
                      <Zap className="w-4 h-4 mt-0.5 text-indigo-500" />
                      Your strongest revenue period is between 7 PM and 10 PM.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">From Raw Data to Clear Intelligence</h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Three simple steps to unlock the full potential of your financial data.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Animated connection line (desktop only) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-[var(--border)] z-0">
              <div className="absolute top-0 left-0 h-full w-full bg-[var(--primary)] origin-left opacity-30 animate-[scaleX_4s_ease-in-out_infinite]"></div>
            </div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6 shadow-md transition-transform group-hover:-translate-y-1" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <Database className="w-10 h-10" style={{ color: 'var(--primary)' }} />
              </div>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>01 — Connect</div>
              <h3 className="text-xl font-bold mb-2">Connect</h3>
              <p className="text-sm max-w-xs" style={{ color: 'var(--text-secondary)' }}>Securely connect and import your transaction and payment data.</p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6 shadow-md transition-transform group-hover:-translate-y-1" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <Brain className="w-10 h-10" style={{ color: 'var(--ai)' }} />
              </div>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>02 — Analyze</div>
              <h3 className="text-xl font-bold mb-2">Analyze</h3>
              <p className="text-sm max-w-xs" style={{ color: 'var(--text-secondary)' }}>AI analyzes patterns, trends, anomalies, and financial behavior instantly.</p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6 shadow-md transition-transform group-hover:-translate-y-1" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <LineChart className="w-10 h-10" style={{ color: 'var(--success)' }} />
              </div>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>03 — Understand</div>
              <h3 className="text-xl font-bold mb-2">Understand</h3>
              <p className="text-sm max-w-xs" style={{ color: 'var(--text-secondary)' }}>Receive clear explanations and highly actionable financial insights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Showcase ────────────────────────────────────────────── */}
      <section id="features" className="py-24" style={{ backgroundColor: 'var(--bg-surface-2)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Everything You Need to Understand Your Business</h2>
            <p className="text-lg max-w-2xl" style={{ color: 'var(--text-secondary)' }}>Not just another dashboard. A comprehensive suite of AI tools designed to decode complex financial activity.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Feature 1: AI-Powered Insights */}
            <div className="card p-8 md:col-span-2 lg:col-span-1 flex flex-col justify-between overflow-hidden relative group">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--ai-subtle)', color: 'var(--ai)' }}>
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">AI-Powered Insights</h3>
                <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>AI converts complex financial data into understandable business intelligence. It reads between the lines of your spreadsheet.</p>
              </div>
              
              <div className="mt-auto p-5 rounded-xl border border-[var(--border)] shadow-sm bg-[var(--bg-surface)] transform transition-transform group-hover:-translate-y-2">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-[var(--primary)] text-white">AI</div>
                  <div>
                    <p className="text-sm font-medium mb-1">Your marketing ROI is up 12%.</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>This correlates strongly with the recent Google Ads campaign launched on Tuesday.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Anomaly Detection */}
            <div className="card p-8 lg:col-span-1 flex flex-col justify-between overflow-hidden relative group">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--warning-subtle)', color: 'var(--warning)' }}>
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Anomaly Detection</h3>
                <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Identify unusual transactions, duplicate payments, and potential financial risks before they impact your runway.</p>
              </div>
              
              <div className="mt-auto p-4 rounded-xl border border-red-500/20 bg-red-500/5 transform transition-transform group-hover:-translate-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-red-500 uppercase">High Risk Detected</span>
                  <span className="text-xs text-red-500/80">Just now</span>
                </div>
                <p className="text-sm font-medium mb-1">Duplicate subscription payment</p>
                <p className="text-xs text-red-500/80 font-mono">₹4,200 charged twice by 'Atlassian' within 24h.</p>
              </div>
            </div>

            {/* Feature 3: Revenue & Spending */}
            <div className="card p-8 lg:col-span-1 flex flex-col justify-between overflow-hidden relative group">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--success-subtle)', color: 'var(--success)' }}>
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Revenue & Spending Intelligence</h3>
                <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Understand exactly where money comes from and where it goes with real-time categorisation.</p>
              </div>
              
              <div className="mt-auto flex items-end gap-2 h-24">
                <div className="w-1/4 bg-emerald-500/20 rounded-t-md h-[40%] transition-all group-hover:h-[45%]"></div>
                <div className="w-1/4 bg-emerald-500/40 rounded-t-md h-[60%] transition-all group-hover:h-[70%]"></div>
                <div className="w-1/4 bg-emerald-500/60 rounded-t-md h-[75%] transition-all group-hover:h-[85%]"></div>
                <div className="w-1/4 bg-emerald-500 rounded-t-md h-[90%] transition-all group-hover:h-[100%] shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
              </div>
            </div>

            {/* Feature 4: Ask Your Data */}
            <div className="card p-8 md:col-span-2 lg:col-span-1 flex flex-col justify-between overflow-hidden relative group">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Ask Your Finance Data</h3>
                <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Allow users to interact with their financial information using natural language. No SQL required.</p>
              </div>
              
              <div className="mt-auto space-y-3 transform transition-transform group-hover:-translate-y-2">
                <div className="ml-auto w-3/4 p-3 rounded-2xl rounded-tr-sm text-sm text-white" style={{ backgroundColor: 'var(--primary)' }}>
                  How much did we spend on software last month?
                </div>
                <div className="w-5/6 p-3 rounded-2xl rounded-tl-sm text-sm border border-[var(--border)] shadow-sm" style={{ backgroundColor: 'var(--bg-surface)' }}>
                  You spent ₹1,42,500 on software last month, up 8% from the previous month. Top vendor: AWS.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ── AI Insight Demo Section ───────────────────────────────────────── */}
      <section id="ai-insights" className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Text & CTA */}
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-6 border" style={{ backgroundColor: 'var(--ai-subtle)', color: 'var(--ai)', borderColor: 'color-mix(in srgb, var(--ai) 20%, transparent)' }}>
                <Brain className="w-4 h-4" />
                <span>Meet Your New Analyst</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6 leading-tight">
                Stop digging through spreadsheets. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
                  Start asking questions.
                </span>
              </h2>
              
              <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
                Our AI Finance Controller doesn't just show you charts. It understands your business context and provides direct answers to complex financial questions.
              </p>
              
              <button 
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 font-medium transition-colors hover:gap-3" 
                style={{ color: 'var(--primary)' }}
              >
                Ask Your Data <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right: AI Conversation Visualization */}
            <div className="order-1 lg:order-2 relative">
              {/* Background glows */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[var(--ai)] opacity-5 blur-[80px] rounded-full pointer-events-none"></div>
              
              <div className="card shadow-2xl overflow-hidden flex flex-col border border-[var(--border)] relative z-10" style={{ backgroundColor: 'var(--bg-surface)' }}>
                
                {/* Header */}
                <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface-2)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--ai) 100%)' }}>
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">IniRazor Analyst</h4>
                    <p className="text-xs flex items-center gap-1" style={{ color: 'var(--success)' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Online and analyzing
                    </p>
                  </div>
                </div>

                {/* Conversation Body */}
                <div className="p-5 space-y-6" style={{ backgroundImage: 'radial-gradient(circle at center, var(--bg-surface-2) 0%, transparent 100%)' }}>
                  
                  {/* User Message */}
                  <div className="flex justify-end animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm text-sm" style={{ backgroundColor: 'var(--bg-surface-2)' }}>
                      Why did my expenses increase this month?
                    </div>
                  </div>

                  {/* AI Message */}
                  <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 shadow-sm" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--ai) 100%)' }}>
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    
                    <div className="space-y-3 w-full">
                      <div className="rounded-2xl rounded-tl-sm p-4 shadow-sm border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                        <p className="text-sm font-medium mb-3">
                          Your expenses increased by <span className="text-red-500">18.4%</span> (₹1,42,000).
                        </p>
                        <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                          The largest contributors were:
                        </p>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between items-center text-sm p-2 rounded bg-[var(--bg-surface-2)]">
                            <span className="font-medium flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5 text-red-500"/> Marketing</span>
                            <span className="font-mono text-red-500">+32%</span>
                          </div>
                          <div className="flex justify-between items-center text-sm p-2 rounded bg-[var(--bg-surface-2)]">
                            <span className="font-medium flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5 text-red-500"/> Infrastructure</span>
                            <span className="font-mono text-red-500">+14%</span>
                          </div>
                          <div className="flex justify-between items-center text-sm p-2 rounded bg-[var(--bg-surface-2)]">
                            <span className="font-medium flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5 text-red-500"/> Software</span>
                            <span className="font-mono text-red-500">+9%</span>
                          </div>
                        </div>
                        
                        <p className="text-sm font-medium pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                          The increase is primarily driven by higher campaign spending on Meta Ads.
                        </p>
                      </div>
                      
                      {/* Interactive suggestion chips */}
                      <div className="flex gap-2">
                        <span className="text-xs px-3 py-1.5 rounded-full border cursor-pointer hover:bg-[var(--bg-surface-2)] transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                          Show marketing breakdown
                        </span>
                        <span className="text-xs px-3 py-1.5 rounded-full border cursor-pointer hover:bg-[var(--bg-surface-2)] transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                          Compare to last year
                        </span>
                      </div>
                    </div>
                  </div>
                  
                </div>
                
                {/* Fake Input area */}
                <div className="px-5 py-3 border-t flex items-center gap-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface-2)' }}>
                  <div className="flex-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-full px-4 py-2 text-sm text-[var(--text-muted)] flex items-center">
                    Ask a follow-up question...
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--primary)] text-white opacity-50">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

              </div>
            </div>
            
          </div>
        </div>
      </section>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes dash {
          to { stroke-dashoffset: -100; }
        }
      `}} />
    </div>
  );
};

export default LandingPage;
