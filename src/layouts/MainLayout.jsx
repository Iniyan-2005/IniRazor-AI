import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  GitCompareArrows,
  AlertTriangle,
  ScrollText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import EnvironmentBadge from '../components/EnvironmentBadge.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import AppCursorManager from '../components/AppCursorManager.jsx';
import logo from '../assets/logo.jpg';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/reconciliation', label: 'Reconciliation', icon: GitCompareArrows },
  { to: '/exceptions', label: 'Exceptions', icon: AlertTriangle },
  { to: '/audit', label: 'Audit Trail', icon: ScrollText },
  { to: '/evaluation', label: 'Evaluation', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

/* Page title map — derives the topbar title from the current route */
const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/reconciliation': 'Reconciliation Engine',
  '/exceptions': 'Exceptions Queue',
  '/audit': 'Audit Trail',
  '/evaluation': 'Evaluation',
  '/settings': 'System Configuration',
};

const MainLayout = () => {
  const { user, userProfile, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Handle escape key for logout modal and body class
  useEffect(() => {
    if (!showLogoutModal) {
      document.body.classList.remove('modal-active');
      return;
    }
    
    document.body.classList.add('modal-active');
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowLogoutModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('modal-active');
    };
  }, [showLogoutModal]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const pageTitle = (() => {
    const exact = PAGE_TITLES[location.pathname];
    if (exact) return exact;
    const prefix = Object.keys(PAGE_TITLES).find(
      (k) => location.pathname.startsWith(k)
    );
    return prefix ? PAGE_TITLES[prefix] : 'IniRazorAI';
  })();

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--bg-app)' }}
    >
      <AppCursorManager />
      {/* ── Mobile Overlay ─────────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col flex-shrink-0 transition-transform duration-300 ease-in-out lg:transform-none ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
        }}
      >
        {/* Brand */}
        <div
          className="h-16 flex items-center justify-between gap-3 px-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--sidebar-border)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={logo}
              alt="IniRazorAI Logo"
              className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <p
                className="font-bold text-sm leading-tight truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                IniRazorAI
              </p>
              <p className="text-[11px] leading-tight" style={{ color: 'var(--text-muted)' }}>
                AI Finance Controller
              </p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto relative">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `sidebar-link relative ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-bg"
                      className="absolute inset-0 rounded-lg"
                      style={{ backgroundColor: 'var(--sidebar-link-active-bg)', zIndex: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8 }}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-3 w-full">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{label}</span>
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div
          className="p-3 flex-shrink-0"
          style={{ borderTop: '1px solid var(--sidebar-border)' }}
        >
          <div className="flex items-center gap-3 px-1">
            {/* Avatar initial or image */}
            {userProfile?.avatar ? (
              <img
                src={userProfile.avatar}
                alt="Avatar"
                className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 uppercase"
                style={{
                  backgroundColor: 'var(--primary-subtle)',
                  color: 'var(--primary-text)',
                }}
              >
                {(userProfile?.name || 'U').charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {userProfile?.name}
              </p>
              <p className="text-[11px] truncate leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {userProfile?.email}
              </p>
              {userProfile?.providerLabel && (
                <p className="text-[10px] truncate leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {userProfile.providerLabel}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="p-1.5 rounded-md transition-colors flex-shrink-0"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.backgroundColor = 'var(--danger-subtle)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Top bar */}
        <header
          className="h-16 px-4 sm:px-6 flex items-center justify-between flex-shrink-0 sticky top-0 z-10"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="lg:hidden p-2 -ml-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
              onClick={toggleMobileMenu}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            </button>
            <h2
              className="text-base font-semibold truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {pageTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Operational status */}
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
              style={{
                backgroundColor: 'var(--success-subtle)',
                color: 'var(--success-text)',
                borderColor: 'color-mix(in srgb, var(--success) 30%, transparent)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
                style={{ backgroundColor: 'var(--success)' }}
              />
              Operational
            </div>

            <EnvironmentBadge />
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main
          className="flex-1 p-4 sm:p-6 overflow-x-hidden overflow-y-auto"
          style={{ backgroundColor: 'var(--bg-app)' }}
        >
          <div className="max-w-7xl mx-auto h-full">
            <AnimatePresence>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* ── Logout Confirmation Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowLogoutModal(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: prefersReducedMotion ? 0 : 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="logout-title"
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: 'var(--danger-subtle)',
                    color: 'var(--danger)',
                  }}
                >
                  <LogOut className="w-6 h-6" />
                </div>
                <h3
                  id="logout-title"
                  className="text-lg font-bold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Sign out?
                </h3>
                <p
                  className="text-sm mb-6"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Are you sure you want to sign out of your AI Finance Controller session?
                </p>
                <div className="flex w-full gap-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-surface-2)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface-3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface-2)';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={logout}
                    className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors text-white"
                    style={{ backgroundColor: 'var(--danger)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.filter = 'brightness(0.9)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.filter = 'none';
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MainLayout;
