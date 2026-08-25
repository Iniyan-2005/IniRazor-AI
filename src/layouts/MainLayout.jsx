import React from 'react';
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
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import EnvironmentBadge from '../components/EnvironmentBadge.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import logo from '../assets/logo.jpg';

const NAV_ITEMS = [
  { to: '/',               label: 'Dashboard',      icon: LayoutDashboard, end: true },
  { to: '/transactions',   label: 'Transactions',   icon: ArrowLeftRight },
  { to: '/reconciliation', label: 'Reconciliation', icon: GitCompareArrows },
  { to: '/exceptions',     label: 'Exceptions',     icon: AlertTriangle },
  { to: '/audit',          label: 'Audit Trail',    icon: ScrollText },
  { to: '/evaluation',     label: 'Evaluation',     icon: BarChart3 },
  { to: '/settings',       label: 'Settings',       icon: Settings },
];

/* Page title map — derives the topbar title from the current route */
const PAGE_TITLES = {
  '/':               'Dashboard',
  '/transactions':   'Transactions',
  '/reconciliation': 'Reconciliation Engine',
  '/exceptions':     'Exceptions Queue',
  '/audit':          'Audit Trail',
  '/evaluation':     'Evaluation',
  '/settings':       'System Configuration',
};

const MainLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const pageTitle = (() => {
    const exact = PAGE_TITLES[location.pathname];
    if (exact) return exact;
    const prefix = Object.keys(PAGE_TITLES).find(
      (k) => k !== '/' && location.pathname.startsWith(k)
    );
    return prefix ? PAGE_TITLES[prefix] : 'IniRazorAI';
  })();

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--bg-app)' }}
    >
      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside
        className="w-60 flex flex-col flex-shrink-0"
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
        }}
      >
        {/* Brand */}
        <div
          className="h-16 flex items-center gap-3 px-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--sidebar-border)' }}
        >
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

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div
          className="p-3 flex-shrink-0"
          style={{ borderTop: '1px solid var(--sidebar-border)' }}
        >
          <div className="flex items-center gap-3 px-1">
            {/* Avatar initial */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 uppercase"
              style={{
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary-text)',
              }}
            >
              {(user?.name || user?.email || 'U').charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {user?.name || 'User'}
              </p>
              <p className="text-[11px] truncate leading-tight" style={{ color: 'var(--text-muted)' }}>
                {user?.email || ''}
              </p>
            </div>
            <button
              onClick={logout}
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
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="h-16 px-6 flex items-center justify-between flex-shrink-0 sticky top-0 z-10"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <h2
            className="text-base font-semibold truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {pageTitle}
          </h2>

          <div className="flex items-center gap-2">
            {/* Operational status */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
              style={{
                backgroundColor: 'var(--success-subtle)',
                color: 'var(--success-text)',
                borderColor: 'color-mix(in srgb, var(--success) 30%, transparent)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
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
          className="flex-1 p-6 overflow-auto"
          style={{ backgroundColor: 'var(--bg-app)' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
