import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Brain,
  Menu,
  X,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Zap
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
      
      {/* ── Base style for custom animations ─────────────────────────────── */}
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
