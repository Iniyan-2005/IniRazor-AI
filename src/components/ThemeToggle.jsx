import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme.jsx';

/**
 * ThemeToggle — a polished sun/moon button for the topbar.
 * Uses CSS var tokens so it looks correct in both themes.
 */
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="
        relative w-8 h-8 flex items-center justify-center rounded-lg
        transition-all duration-200
        hover:scale-105 active:scale-95
      "
      style={{
        backgroundColor: 'var(--bg-surface-2)',
        border: '1px solid var(--border)',
        color: 'var(--text-secondary)',
      }}
    >
      {/* Sun icon — visible in dark mode (to switch to light) */}
      <Sun
        className={`
          w-4 h-4 absolute transition-all duration-300 ease-in-out
          ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}
        `}
        style={{ color: '#fbbf24' }}
      />
      {/* Moon icon — visible in light mode (to switch to dark) */}
      <Moon
        className={`
          w-4 h-4 absolute transition-all duration-300 ease-in-out
          ${isDark ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}
        `}
      />
    </button>
  );
};

export default ThemeToggle;
