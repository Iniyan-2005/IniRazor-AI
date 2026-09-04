import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Brain, ArrowRight, ShieldCheck, Zap, Database, TrendingUp, AlertTriangle, Play, Menu, X, CheckCircle2, ChevronRight, LineChart, MessageSquare, ShieldAlert, ScrollText, Lock, Eye } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle.jsx';
import logo from '../assets/logo.jpg';
import welcomeBg from '../assets/welcome-bg.png';
import RupeeCursor from '../components/RupeeCursor.jsx';

// Popup Component
const WelcomePopup = ({ onClose }) => {
  useEffect(() => {
    // Trap focus basic implementation
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Suppress custom cursor globally
    document.body.classList.add('modal-active');
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('modal-active');
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${welcomeBg})` }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        </motion.div>

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-title"
        >
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] opacity-10 blur-[50px] rounded-full pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--bg-surface-2)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)] z-20"
            aria-label="Close welcome message"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary-text)' }}>
              <Zap className="w-3 h-3" /> Razorpay Buildathon
            </div>

            <h2 id="welcome-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              Welcome to IniRazorAI
            </h2>

            <p className="text-base text-[var(--text-secondary)] mb-4 leading-relaxed">
              This project was built for the Razorpay Buildathon and is developed by{' '}
              <a
                href="https://www.linkedin.com/in/siniyan2005/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[var(--primary)] hover:underline decoration-2 underline-offset-2 transition-all"
              >
                Iniyan S
              </a>.
            </p>

            <p className="text-sm text-[var(--text-muted)] mb-8">
              Explore how AI transforms raw financial transactions into meaningful insights and actions.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="btn-primary flex-1 py-3 text-sm rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Explore the Experience <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const hasSeenWelcome = sessionStorage.getItem('inirazor_welcome_shown');
  const [welcomeResolved, setWelcomeResolved] = useState(!!hasSeenWelcome);
  const [showWelcome, setShowWelcome] = useState(!hasSeenWelcome);
  const [activeInsight, setActiveInsight] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const exceptionData = [
    {
      id: "PAY_8924",
      headline: "Amount Mismatch",
      expected: "₹12,500.00",
      actual: "₹12,350.00",
      diff: "₹150.00",
      color: "text-red-500",
      aiReasoning: "The ₹150 discrepancy perfectly matches the standard 1.2% cross-border markup fee which was not included in the expected base settlement.",
      confidence: 94,
      action: "AUTO_RESOLVE"
    },
    {
      id: "PAY_9102",
      headline: "Unexplained Deduction",
      expected: "₹45,000.00",
      actual: "₹42,000.00",
      diff: "₹3,000.00",
      color: "text-red-500",
      aiReasoning: "A massive ₹3,000 deduction is present without corresponding tax or fee records. This anomaly cannot be safely explained and requires human approval.",
      confidence: 62,
      action: "NEEDS_REVIEW"
    }
  ];

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } }
  };

  // Welcome Popup Logic

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    sessionStorage.setItem('inirazor_welcome_shown', 'true');
    setWelcomeResolved(true);
  };

  // Handle scroll for sticky navbar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      <RupeeCursor />
      {showWelcome && <WelcomePopup onClose={handleCloseWelcome} />}

      {/* ── Main Content Container ────────────────────────────────────────────────────────── */}
      {welcomeResolved && (
        <>
          {/* ── Navbar ────────────────────────────────────────────────────────── */}
          <nav
            className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isScrolled
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
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  <div className="relative">
                    <img src={logo} alt="IniRazorAI Logo" className="w-9 h-9 rounded-lg object-cover transition-transform group-hover:scale-105" style={{ boxShadow: 'var(--shadow-card)' }} />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: 'var(--primary)', boxShadow: 'var(--shadow-card)' }}>
                      <Brain className="w-2.5 h-2.5 text-white" />
                    </span>
                  </div>
                  <span className="font-bold text-lg tracking-tight">IniRazorAI</span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                  <a href="#how-it-works" className="text-sm font-medium transition-colors hover:text-[var(--primary)] text-[var(--text-secondary)]">How It Works</a>
                  <a href="#features" className="text-sm font-medium transition-colors hover:text-[var(--primary)] text-[var(--text-secondary)]">Features</a>
                  <a href="#ai-insights" className="text-sm font-medium transition-colors hover:text-[var(--primary)] text-[var(--text-secondary)]">AI Insights</a>
                </div>

                <div className="hidden md:flex items-center gap-4">
                  <ThemeToggle />
                  <Link to="/login" className="text-sm font-medium transition-colors hover:text-[var(--primary)] text-[var(--text-secondary)]">
                    Login
                  </Link>
                  <button onClick={() => navigate('/login')} className="btn-primary text-sm px-5 py-2 hover:-translate-y-0.5 transition-transform">
                    Try the Dashboard
                  </button>
                </div>

                <div className="md:hidden flex items-center gap-3">
                  <ThemeToggle />
                  <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-primary)]">
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="md:hidden border-b overflow-hidden bg-[var(--bg-surface)] border-[var(--border)]"
                >
                  <div className="px-4 pt-2 pb-6 space-y-4 shadow-lg">
                    <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-[var(--text-secondary)]">How It Works</a>
                    <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-[var(--text-secondary)]">Features</a>
                    <a href="#ai-insights" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-[var(--text-secondary)]">AI Insights</a>
                    <div className="pt-4 border-t border-[var(--border)]">
                      <Link to="/login" className="block w-full text-center mb-3 px-3 py-2 rounded-md text-base font-medium text-[var(--text-secondary)]">
                        Login
                      </Link>
                      <button onClick={() => navigate('/login')} className="w-full btn-primary justify-center">
                        Try the Dashboard
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>

          {/* ── Hero Section ──────────────────────────────────────────────────── */}
          <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 opacity-20 blur-[100px] pointer-events-none rounded-full bg-[var(--primary)]" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0"
                >
                  <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-6 border bg-[var(--primary-subtle)] text-[var(--primary-text)] border-[color-mix(in_srgb,var(--primary)_20%,transparent)]">
                    <Zap className="w-4 h-4" />
                    <span>Built for Razorpay Buildathon</span>
                  </motion.div>

                  <motion.h1 variants={staggerItem} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.15]">
                    Your AI-Powered <br className="hidden lg:block" />
<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Reconciliation</span> Engine.
                  </motion.h1>

                  <motion.p variants={staggerItem} className="text-lg sm:text-xl mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0 text-[var(--text-secondary)]">
                    Automate payment-to-settlement matching. Let deterministic math handle standard fees, and AI safely investigate complex discrepancies.
                  </motion.p>

                  <motion.div variants={staggerItem} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                    <button onClick={() => navigate('/login')} className="btn-primary w-full sm:w-auto px-8 py-3.5 text-base rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                      Explore Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                    <a href="#how-it-works" className="btn-secondary w-full sm:w-auto px-8 py-3.5 text-base rounded-xl hover:-translate-y-0.5 transition-all">
                      See How It Works
                    </a>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="relative mx-auto w-full max-w-lg lg:max-w-none"
                >
                  <div className="relative aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden border bg-[var(--bg-surface-2)] border-[var(--border)]">
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--text-primary) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.0, duration: 0.6, type: 'spring' }} className="relative z-10">
                        <motion.div
                          animate={{ scale: prefersReducedMotion ? 1 : [1, 1.05, 1] }}
                          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                          className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-md border border-white/10" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--ai) 100%)' }}
                        >
                          <Brain className="w-10 h-10 text-white" />
                          <div className="absolute inset-0 rounded-full border border-white/30 animate-ping opacity-20" style={{ animationDuration: '3s' }}></div>
                        </motion.div>
                      </motion.div>

                      <motion.svg initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.6, duration: 1 }} className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="none">
                        <path d="M 0,200 C 150,200 250,100 400,100" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="4 4" className={prefersReducedMotion ? "" : "animate-[dash_20s_linear_infinite]"} vectorEffect="non-scaling-stroke" />
                        <path d="M 0,350 C 150,350 250,250 400,250" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="4 4" className={prefersReducedMotion ? "" : "animate-[dash_15s_linear_infinite]"} vectorEffect="non-scaling-stroke" />
                      </motion.svg>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4, duration: 0.5 }}
                        className={`absolute top-4 sm:top-8 right-2 sm:right-8 card p-2 sm:p-3 shadow-lg flex items-center gap-2 sm:gap-3 bg-[var(--bg-surface)] ${prefersReducedMotion ? '' : 'animate-[float_6s_ease-in-out_infinite]'}`}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--success-subtle)] text-[var(--success)]">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] sm:text-xs font-semibold text-[var(--text-primary)]">Payment Matched</p>
<p className="text-[10px] sm:text-xs font-medium text-[var(--success)]">₹1,25,000 settled</p>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.6, duration: 0.5 }}
                        className={`absolute bottom-16 sm:bottom-12 left-2 sm:left-6 card p-2 sm:p-3 shadow-lg flex items-center gap-2 sm:gap-3 bg-[var(--bg-surface)] ${prefersReducedMotion ? '' : 'animate-[float_7s_ease-in-out_infinite_reverse]'}`}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--warning-subtle)] text-[var(--warning)]">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] sm:text-xs font-semibold text-[var(--text-primary)]">Exception Queued</p>
                          <p className="text-[10px] sm:text-xs font-medium text-[var(--warning)]">Amount mismatch (₹120)</p>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8, duration: 0.5 }}
                        className={`absolute bottom-2 sm:bottom-6 right-2 sm:right-10 card p-2 sm:p-3 shadow-lg flex items-center gap-2 sm:gap-3 bg-[var(--bg-surface)] ${prefersReducedMotion ? '' : 'animate-[float_8s_ease-in-out_infinite]'}`}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--ai-subtle)] text-[var(--ai)]">
                          <Brain className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[var(--text-primary)]">AI Analysis</p>
                          <p className="text-xs text-[var(--text-muted)]">Missing tax identified</p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ── Problem → Solution Storytelling ─────────────────────────────── */}
          <section className="py-24 bg-[var(--bg-surface-2)] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <motion.div
                  initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
                  variants={fadeIn}
                >
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6 leading-tight">
                    Thousands of transactions. <br />
<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Are you matching them all?</span>
                  </h2>

                  <div className="card p-6 shadow-sm overflow-hidden relative border-[var(--border)]">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--bg-surface)] z-10"></div>
                    <div className="space-y-3 opacity-60">
                      {[
                        { desc: 'PAY_8921 • Settled perfectly', val: 'Matched', color: 'text-emerald-500' },
                        { desc: 'PAY_8922 • Missing settlement', val: 'Error', color: 'text-red-500' },
                        { desc: 'PAY_8923 • Known fee deduction', val: 'Matched', color: 'text-emerald-500' },
                        { desc: 'PAY_8924 • Amount mismatch', val: 'Review', color: 'text-amber-500' },
                        { desc: 'PAY_8925 • Tax discrepancy', val: 'Matched', color: 'text-emerald-500' }
                      ].map((item, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="flex justify-between items-center text-sm font-mono">
                          <span className="text-[var(--text-muted)]">{item.desc}</span>
                          <span className={item.color}>{item.val}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
                  variants={fadeIn}
                  className="relative"
                >
                  <div className="hidden lg:block absolute top-1/2 -left-12 w-12 h-[2px] bg-gradient-to-r from-transparent to-[var(--primary)] -translate-y-1/2"></div>

                  <div className="card p-8 shadow-lg border-[var(--primary)] relative overflow-hidden bg-[var(--bg-surface)]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] opacity-5 blur-[50px] rounded-full"></div>

                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--ai) 100%)' }}>
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold">Intelligent Reconciliation</h3>
                    </div>

                    <div className="space-y-4">
                      {[
                        { icon: Database, color: 'text-blue-500', text: '100 transactions synced & processed.' },
                        { icon: CheckCircle2, color: 'text-emerald-500', text: 'Deterministic engine auto-matched 94 records.' },
                        { icon: Brain, color: 'text-indigo-500', text: 'AI safely investigated 6 complex exceptions.' }
                      ].map((item, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }} viewport={{ once: true }} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface-2)]">
                          <p className="text-sm font-medium flex items-start gap-2">
                            <item.icon className={`w-4 h-4 mt-0.5 ${item.color}`} />
                            {item.text}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ── How It Works ──────────────────────────────────────────────────── */}
          <section id="how-it-works" className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl font-bold tracking-tight mb-4">From Raw Data to Complete Reconciliation</h2>
<p className="text-lg text-[var(--text-secondary)]">A fail-safe pipeline combining deterministic mathematics with AI intelligence.</p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8 relative">
                <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-[var(--border)] z-0">
                  <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }} viewport={{ once: true }} className="absolute top-0 left-0 h-full w-full bg-[var(--primary)] origin-left opacity-40"></motion.div>
                </div>

                {[
                  { icon: Database, num: '01 — Connect', title: 'Connect', desc: 'Securely connect and import your transaction and payment data.', color: 'var(--primary)' },
                  { icon: Brain, num: '02 — Analyze', title: 'Analyze', desc: 'AI analyzes patterns, trends, anomalies, and financial behavior instantly.', color: 'var(--ai)' },
                  { icon: LineChart, num: '03 — Understand', title: 'Understand', desc: 'Receive clear explanations and highly actionable financial insights.', color: 'var(--success)' }
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: isDesktop ? -30 : 0, y: isDesktop ? 0 : 20 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.6, delay: i * 0.2 }}
                    viewport={{ once: true }}
                    className="relative z-10 flex flex-col items-center text-center group"
                  >
                    <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6 shadow-md transition-transform group-hover:-translate-y-1 bg-[var(--bg-surface)] border border-[var(--border)]">
                      <step.icon className="w-10 h-10" style={{ color: step.color }} />
                    </div>
                    <div className="text-xs font-bold uppercase tracking-widest mb-2 text-[var(--text-muted)]">{step.num}</div>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-sm max-w-xs text-[var(--text-secondary)]">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Feature Showcase ────────────────────────────────────────────── */}
          <section id="features" className="py-24 bg-[var(--bg-surface-2)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="mb-16">
                <h2 className="text-3xl font-bold tracking-tight mb-4">Enterprise-Grade Financial Safety</h2>
<p className="text-lg max-w-2xl text-[var(--text-secondary)]">Not just a dashboard. A robust reconciliation pipeline built for strict FinOps compliance and accuracy.</p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }} className="card p-8 md:col-span-2 lg:col-span-1 flex flex-col justify-between overflow-hidden relative group hover:border-[var(--border-strong)] transition-colors">
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-[var(--ai-subtle)] text-[var(--ai)]">
                      <Brain className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Hybrid Reconciliation Engine</h3>
<p className="mb-8 text-[var(--text-secondary)]">Math for the expected, AI for the unexpected. Rule-based engines handle standard deductions, while NVIDIA NIM investigates complex amount mismatches.</p>
                  </div>
                  <div className="mt-auto p-5 rounded-xl border border-[var(--border)] shadow-sm bg-[var(--bg-surface)] transform transition-transform group-hover:-translate-y-1">
                    <div className="flex items-center justify-between w-full">
  <div className="flex-1 border-r border-[var(--border)] px-4 text-center"><p className="text-xl font-bold text-[var(--success)]">94%</p><p className="text-xs text-[var(--text-muted)]">Deterministic Match</p></div>
  <div className="flex-1 px-4 text-center"><p className="text-xl font-bold text-[var(--ai)]">6%</p><p className="text-xs text-[var(--text-muted)]">AI Investigated</p></div>
</div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} viewport={{ once: true }} className="card p-8 lg:col-span-1 flex flex-col justify-between overflow-hidden relative group hover:border-[var(--border-strong)] transition-colors">
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-[var(--warning-subtle)] text-[var(--warning)]">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Financial Safety First</h3>
<p className="mb-8 text-[var(--text-secondary)]">Fail-safe architecture. Strict confidence thresholds ensure ambiguous transactions are never auto-resolved without explicit human approval.</p>
                  </div>
                  <div className="mt-auto p-4 rounded-xl border border-red-500/20 bg-red-500/5 transform transition-transform group-hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[var(--warning)] uppercase flex items-center gap-1">
    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Confidence &lt; 90%
  </span>
</div>
<p className="text-sm font-medium mb-1 text-[var(--text-primary)]">AI Auto-Resolve Blocked</p>
<p className="text-xs text-[var(--text-muted)] font-mono">Transaction routed to manual review queue.</p>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} viewport={{ once: true }} className="card p-8 lg:col-span-1 flex flex-col justify-between overflow-hidden relative group hover:border-[var(--border-strong)] transition-colors">
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-[var(--success-subtle)] text-[var(--success)]">
                      <ScrollText className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Immutable Audit Trail</h3>
<p className="mb-8 text-[var(--text-secondary)]">100% Traceability. Every deterministic match, AI reasoning, and human intervention is logged chronologically for strict enterprise compliance.</p>
                  </div>
                  <div className="mt-auto bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-3"><p className="text-[10px] font-mono text-[var(--text-muted)] mb-1">[01:22:45] EVENT_TYPE: AI_INVESTIGATION</p><p className="text-xs font-medium">Actor: AI_AGENT • Decision: NEEDS_REVIEW</p></div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} viewport={{ once: true }} className="card p-8 md:col-span-2 lg:col-span-1 flex flex-col justify-between overflow-hidden relative group hover:border-[var(--border-strong)] transition-colors">
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-[var(--primary-subtle)] text-[var(--primary)]">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Exceptions Queue</h3>
<p className="mb-8 text-[var(--text-secondary)]">A dedicated workspace for FinOps teams to manually investigate, approve, or reject flagged transactions with full AI-generated context.</p>
                  </div>
                  <div className="mt-auto space-y-3 transform transition-transform group-hover:-translate-y-1">
                    <div className="flex gap-2"><button className="flex-1 py-2 rounded-lg bg-[var(--success-subtle)] text-[var(--success)] text-xs font-bold flex items-center justify-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> Approve</button><button className="flex-1 py-2 rounded-lg bg-[var(--danger-subtle)] text-[var(--danger)] text-xs font-bold flex items-center justify-center gap-1"><X className="w-3.5 h-3.5"/> Reject</button></div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ── AI Insight Demo Section ───────────────────────────────────────── */}
          <section id="ai-insights" className="py-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-16 items-center">

                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="order-2 lg:order-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-6 border bg-[var(--ai-subtle)] text-[var(--ai)] border-[color-mix(in_srgb,var(--ai)_20%,transparent)]">
                    <Brain className="w-4 h-4" />
                    <span>Meet Your New Analyst</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6 leading-tight">
                    Don't just flag mismatches. <br />
<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
Understand them.
</span>
                  </h2>
                  <p className="text-lg mb-8 text-[var(--text-secondary)]">
                    When mathematical rules fail, our AI steps in to analyze the raw transaction evidence, providing your FinOps team with a likely cause, explanation, and a safe recommendation.
                  </p>
                  <button onClick={() => navigate('/login')} className="inline-flex items-center gap-2 font-medium transition-colors hover:gap-3 text-[var(--primary)]">
                    Investigate Exceptions <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>

                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="order-1 lg:order-2 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[var(--ai)] opacity-5 blur-[80px] rounded-full pointer-events-none"></div>

                  <div className="card shadow-2xl overflow-hidden flex flex-col border border-[var(--border)] relative z-10 bg-[var(--bg-surface)]">
                    <div className="px-5 py-4 border-b flex items-center gap-3 border-[var(--border)] bg-[var(--bg-surface-2)]">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--ai) 100%)' }}>
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Exception Investigation</h4>
                        <p className="text-xs flex items-center gap-1 text-[var(--success)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Online and analyzing
                        </p>
                      </div>
                    </div>

                    <div className="p-5 space-y-6" style={{ backgroundImage: 'radial-gradient(circle at center, var(--bg-surface-2) 0%, transparent 100%)' }}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`chat-${activeInsight}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-6"
                        >
                          <div className="space-y-4">
  <div className="flex justify-between items-center p-3 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border)]">
    <span className="text-sm font-semibold text-[var(--text-secondary)]">Transaction ID</span>
    <span className="text-sm font-mono font-bold">{exceptionData[activeInsight].id}</span>
  </div>
  <div className="grid grid-cols-3 gap-2">
    <div className="p-3 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border)] text-center">
      <p className="text-xs text-[var(--text-muted)] mb-1">Expected</p>
      <p className="text-sm font-bold">{exceptionData[activeInsight].expected}</p>
    </div>
    <div className="p-3 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border)] text-center">
      <p className="text-xs text-[var(--text-muted)] mb-1">Actual</p>
      <p className="text-sm font-bold">{exceptionData[activeInsight].actual}</p>
    </div>
    <div className="p-3 rounded-lg bg-[var(--danger-subtle)] border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] text-center">
      <p className="text-xs text-[var(--danger)] mb-1">Difference</p>
      <p className="text-sm font-bold text-[var(--danger)]">{exceptionData[activeInsight].diff}</p>
    </div>
  </div>
  
  <div className="rounded-xl p-4 border border-[color-mix(in_srgb,var(--ai)_30%,transparent)] bg-[var(--ai-subtle)]">
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center gap-2 text-[var(--ai)]">
        <Brain className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">AI Analysis</span>
      </div>
      <div className="flex items-center gap-1 text-[var(--success)] bg-[var(--success-subtle)] px-2 py-1 rounded text-xs font-bold">
        Confidence: {exceptionData[activeInsight].confidence}%
      </div>
    </div>
    <p className="text-sm text-[var(--text-primary)] font-medium leading-relaxed">
      {exceptionData[activeInsight].aiReasoning}
    </p>
  </div>
</div>
                        </motion.div>
                      </AnimatePresence>

                      <div className="flex gap-2 justify-end border-t border-[var(--border-subtle)] pt-4 mt-2">
                        <span className="text-xs text-[var(--text-muted)] self-center mr-auto">View Exception Cases:</span>
                        <button onClick={() => setActiveInsight(0)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${activeInsight === 0 ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)]'}`}>
                          Amount Mismatch
                        </button>
                        <button onClick={() => setActiveInsight(1)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${activeInsight === 1 ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)]'}`}>
                          Unexplained Discrepancy
                        </button>
                      </div>
                    </div>

                    <div className="px-5 py-3 border-t flex items-center gap-3 border-[var(--border)] bg-[var(--bg-surface-2)]">
                      <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-dark)] transition-colors">
  <CheckCircle2 className="w-4 h-4" /> Approve & Resolve
</button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ── Final CTA ─────────────────────────────────────────────────────── */}
          <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-[var(--primary)] opacity-[0.03] dark:opacity-[0.05]"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-30"></div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
                Stop Managing Transactions.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  Start Understanding Them.
                </span>
              </h2>

              <p className="text-xl mb-10 text-[var(--text-secondary)] max-w-2xl mx-auto">
                Turn financial activity into clarity with your AI Finance Controller.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={() => navigate('/login')} className="btn-primary w-full sm:w-auto px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  Enter the Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                <button onClick={() => navigate('/login')} className="btn-secondary w-full sm:w-auto px-8 py-4 text-lg rounded-xl hover:-translate-y-0.5 transition-all">
                  Login to Your Account
                </button>
              </div>
            </motion.div>
          </section>

          {/* ── Footer ────────────────────────────────────────────────────────── */}
          <footer className="border-t border-[var(--border)] bg-[var(--bg-surface)] py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={logo} alt="IniRazorAI Logo" className="w-8 h-8 rounded-lg object-cover grayscale" />
                  </div>
                  <div>
                    <span className="font-bold text-lg tracking-tight">IniRazorAI</span>
                    <p className="text-xs text-[var(--text-muted)]">AI Finance Controller</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-sm text-[var(--text-secondary)]">
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Built for Razorpay Buildathon
                  </span>
                  <a href="https://github.com/Iniyan-2005/IniRazor-AI" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--primary)] transition-colors">
                    GitHub Repository
                  </a>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-[var(--border-subtle)] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[var(--text-muted)]">
                <p>
                  Developed by <a href="https://www.linkedin.com/in/siniyan2005/" target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--primary)] hover:underline underline-offset-2 transition-all">Iniyan S</a> · Full Stack Developer
                </p>
                <div className="flex items-center gap-4">
                  <Link to="/login" className="hover:text-[var(--text-primary)] transition-colors">Login</Link>
                </div>
              </div>
            </div>
          </footer>

          <style dangerouslySetInnerHTML={{
            __html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes dash {
          to { stroke-dashoffset: -100; }
        }
      `}} />
        </>
      )}
    </div>
  );
};

export default LandingPage;
