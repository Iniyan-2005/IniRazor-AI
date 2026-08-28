import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Brain, ArrowRight, ShieldCheck, Zap, Database, TrendingUp, AlertTriangle, Play, Menu, X, CheckCircle2, ChevronRight, LineChart, MessageSquare, ShieldAlert } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle.jsx';
import logo from '../assets/logo.jpg';
import RupeeCursor from '../components/RupeeCursor.jsx';

// Popup Component
const WelcomePopup = ({ onClose }) => {
  useEffect(() => {
    // Trap focus basic implementation
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

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

  const insightData = [
    {
      q: "Why did my expenses increase this month?",
      headline: "Your expenses increased by",
      highlight: "18.4%",
      amount: "(₹1,42,000)",
      color: "text-red-500",
      subtext: "The largest contributors were:",
      breakdown: [
        { name: 'Marketing', val: '+32%', icon: TrendingUp },
        { name: 'Infrastructure', val: '+14%', icon: TrendingUp },
        { name: 'Software', val: '+9%', icon: TrendingUp }
      ],
      summary: "The increase is primarily driven by higher campaign spending on Meta Ads."
    },
    {
      q: "What's our current runway?",
      headline: "Based on current burn, runway is",
      highlight: "14 months",
      amount: "(extended by 2m)",
      color: "text-emerald-500",
      subtext: "Key runway factors:",
      breakdown: [
        { name: 'Cash Balance', val: '₹1.2Cr', icon: Database },
        { name: 'Avg Burn', val: '₹8.5L/mo', icon: AlertTriangle },
        { name: 'Revenue Trend', val: '+12% MoM', icon: TrendingUp }
      ],
      summary: "Runway is healthy, primarily extended by recent consistent revenue growth."
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
                    Your AI Finance <br className="hidden lg:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                      Controller
                    </span> for Every Transaction.
                  </motion.h1>

                  <motion.p variants={staggerItem} className="text-lg sm:text-xl mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0 text-[var(--text-secondary)]">
                    Connect your payment data and let AI turn thousands of transactions into clear insights, anomalies, trends, and actions.
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
                          <p className="text-[10px] sm:text-xs font-semibold text-[var(--text-primary)]">Revenue Trend</p>
                          <p className="text-[10px] sm:text-xs font-medium text-[var(--success)]">+18.4% this week</p>
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
                          <p className="text-[10px] sm:text-xs font-semibold text-[var(--text-primary)]">Anomaly Detected</p>
                          <p className="text-[10px] sm:text-xs font-medium text-[var(--warning)]">Unusual marketing spend</p>
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
                          <p className="text-xs font-semibold text-[var(--text-primary)]">AI Insight</p>
                          <p className="text-xs text-[var(--text-muted)]">Cash flow optimized</p>
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
                    Your transactions are telling a story. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                      Are you listening?
                    </span>
                  </h2>

                  <div className="card p-6 shadow-sm overflow-hidden relative border-[var(--border)]">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--bg-surface)] z-10"></div>
                    <div className="space-y-3 opacity-60">
                      {['TXN_8921 • Amazon Web Serv...', 'TXN_8922 • Stripe Payout', 'TXN_8923 • Facebook Ads', 'TXN_8924 • GitHub Global', 'TXN_8925 • Google Workspace'].map((txn, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="flex justify-between items-center text-sm font-mono">
                          <span className="text-[var(--text-muted)]">{txn}</span>
                          <span className={i === 1 ? "text-emerald-500" : "text-red-500"}>{i === 1 ? '+₹1,25,000' : (i === 0 ? '-₹42,000' : (i === 2 ? '-₹18,500' : (i === 3 ? '-₹899' : '-₹2,400')))}</span>
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
                      <h3 className="text-xl font-bold">AI Finance Controller</h3>
                    </div>

                    <div className="space-y-4">
                      {[
                        { icon: TrendingUp, color: 'text-blue-500', text: 'Marketing spend increased 23% this month.' },
                        { icon: AlertTriangle, color: 'text-amber-500', text: '3 transactions show unusual behaviour.' },
                        { icon: Zap, color: 'text-indigo-500', text: 'Your strongest revenue period is between 7 PM and 10 PM.' }
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
                <h2 className="text-3xl font-bold tracking-tight mb-4">From Raw Data to Clear Intelligence</h2>
                <p className="text-lg text-[var(--text-secondary)]">Three simple steps to unlock the full potential of your financial data.</p>
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
                <h2 className="text-3xl font-bold tracking-tight mb-4">Everything You Need to Understand Your Business</h2>
                <p className="text-lg max-w-2xl text-[var(--text-secondary)]">Not just another dashboard. A comprehensive suite of AI tools designed to decode complex financial activity.</p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }} className="card p-8 md:col-span-2 lg:col-span-1 flex flex-col justify-between overflow-hidden relative group hover:border-[var(--border-strong)] transition-colors">
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-[var(--ai-subtle)] text-[var(--ai)]">
                      <Brain className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">AI-Powered Insights</h3>
                    <p className="mb-8 text-[var(--text-secondary)]">AI converts complex financial data into understandable business intelligence. It reads between the lines of your spreadsheet.</p>
                  </div>
                  <div className="mt-auto p-5 rounded-xl border border-[var(--border)] shadow-sm bg-[var(--bg-surface)] transform transition-transform group-hover:-translate-y-1">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-[var(--primary)] text-white">AI</div>
                      <div>
                        <p className="text-sm font-medium mb-1">Your marketing ROI is up 12%.</p>
                        <p className="text-xs text-[var(--text-muted)]">This correlates strongly with the recent Google Ads campaign launched on Tuesday.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} viewport={{ once: true }} className="card p-8 lg:col-span-1 flex flex-col justify-between overflow-hidden relative group hover:border-[var(--border-strong)] transition-colors">
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-[var(--warning-subtle)] text-[var(--warning)]">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Anomaly Detection</h3>
                    <p className="mb-8 text-[var(--text-secondary)]">Identify unusual transactions, duplicate payments, and potential financial risks before they impact your runway.</p>
                  </div>
                  <div className="mt-auto p-4 rounded-xl border border-red-500/20 bg-red-500/5 transform transition-transform group-hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-red-500 uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> High Risk Detected
                      </span>
                      <span className="text-xs text-red-500/80">Just now</span>
                    </div>
                    <p className="text-sm font-medium mb-1 text-[var(--text-primary)]">Duplicate subscription payment</p>
                    <p className="text-xs text-red-500/80 font-mono">₹4,200 charged twice by 'Atlassian' within 24h.</p>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} viewport={{ once: true }} className="card p-8 lg:col-span-1 flex flex-col justify-between overflow-hidden relative group hover:border-[var(--border-strong)] transition-colors">
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-[var(--success-subtle)] text-[var(--success)]">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Revenue & Spending Intelligence</h3>
                    <p className="mb-8 text-[var(--text-secondary)]">Understand exactly where money comes from and where it goes with real-time categorisation.</p>
                  </div>
                  <div className="mt-auto flex items-end gap-2 h-24">
                    {[40, 60, 75, 90].map((h, i) => {
                      const opacities = ['bg-emerald-500/40', 'bg-emerald-500/60', 'bg-emerald-500/80', 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'];
                      return (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          whileHover={{ height: i === 3 ? '100%' : `${h + 5}%` }}
                          transition={{ duration: 0.6, delay: 0.4 + (i * 0.1) }}
                          viewport={{ once: true }}
                          className={`w-1/4 rounded-t-md transition-colors ${opacities[i]}`}
                        ></motion.div>
                      );
                    })}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} viewport={{ once: true }} className="card p-8 md:col-span-2 lg:col-span-1 flex flex-col justify-between overflow-hidden relative group hover:border-[var(--border-strong)] transition-colors">
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-[var(--primary-subtle)] text-[var(--primary)]">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Ask Your Finance Data</h3>
                    <p className="mb-8 text-[var(--text-secondary)]">Allow users to interact with their financial information using natural language. No SQL required.</p>
                  </div>
                  <div className="mt-auto space-y-3 transform transition-transform group-hover:-translate-y-1">
                    <div className="ml-auto w-3/4 p-3 rounded-2xl rounded-tr-sm text-sm text-white bg-[var(--primary)]">
                      How much did we spend on software last month?
                    </div>
                    <div className="w-5/6 p-3 rounded-2xl rounded-tl-sm text-sm border border-[var(--border)] shadow-sm bg-[var(--bg-surface)]">
                      You spent ₹1,42,500 on software last month, up 8% from the previous month. Top vendor: AWS.
                    </div>
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
                    Stop digging through spreadsheets. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
                      Start asking questions.
                    </span>
                  </h2>
                  <p className="text-lg mb-8 text-[var(--text-secondary)]">
                    Our AI Finance Controller doesn't just show you charts. It understands your business context and provides direct answers to complex financial questions.
                  </p>
                  <button onClick={() => navigate('/login')} className="inline-flex items-center gap-2 font-medium transition-colors hover:gap-3 text-[var(--primary)]">
                    Ask Your Data <ArrowRight className="w-4 h-4" />
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
                        <h4 className="font-semibold text-sm">IniRazor Analyst</h4>
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
                          <div className="flex justify-end">
                            <div className="max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm text-sm bg-[var(--bg-surface-2)]">
                              {insightData[activeInsight].q}
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 shadow-sm" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--ai) 100%)' }}>
                              <Brain className="w-4 h-4 text-white" />
                            </div>
                            <div className="space-y-3 w-full">
                              <div className="rounded-2xl rounded-tl-sm p-4 shadow-sm border bg-[var(--bg-surface)] border-[var(--border-subtle)]">
                                <p className="text-sm font-medium mb-3">
                                  {insightData[activeInsight].headline} <span className={insightData[activeInsight].color}>{insightData[activeInsight].highlight}</span> {insightData[activeInsight].amount}.
                                </p>
                                <p className="text-sm mb-3 text-[var(--text-secondary)]">{insightData[activeInsight].subtext}</p>
                                <div className="space-y-2 mb-3">
                                  {insightData[activeInsight].breakdown.map((it, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm p-2 rounded bg-[var(--bg-surface-2)]">
                                      <span className="font-medium flex items-center gap-2"><it.icon className={`w-3.5 h-3.5 ${insightData[activeInsight].color}`} /> {it.name}</span>
                                      <span className={`font-mono ${insightData[activeInsight].color}`}>{it.val}</span>
                                    </div>
                                  ))}
                                </div>
                                <p className="text-sm font-medium pt-2 border-t border-[var(--border-subtle)]">
                                  {insightData[activeInsight].summary}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>

                      <div className="flex gap-2 justify-end border-t border-[var(--border-subtle)] pt-4 mt-2">
                        <span className="text-xs text-[var(--text-muted)] self-center mr-auto">Suggested queries:</span>
                        <button onClick={() => setActiveInsight(0)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${activeInsight === 0 ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)]'}`}>
                          Expenses
                        </button>
                        <button onClick={() => setActiveInsight(1)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${activeInsight === 1 ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)]'}`}>
                          Runway
                        </button>
                      </div>
                    </div>

                    <div className="px-5 py-3 border-t flex items-center gap-3 border-[var(--border)] bg-[var(--bg-surface-2)]">
                      <div className="flex-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-full px-4 py-2 text-sm text-[var(--text-muted)] flex items-center">
                        Ask a follow-up question...
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--primary)] text-white opacity-50">
                        <ArrowRight className="w-4 h-4" />
                      </div>
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
