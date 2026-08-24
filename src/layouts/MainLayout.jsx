import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  GitCompareArrows, 
  AlertTriangle, 
  ScrollText, 
  BarChart3, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import EnvironmentBadge from '../components/EnvironmentBadge.jsx';
import logo from '../assets/logo.jpg';

const MainLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 flex items-center gap-3 border-b border-slate-100">
          <img src={logo} alt="IniRazorAI Logo" className="w-12 h-12 rounded-full object-cover" />
          <div>
            <h1 className="font-bold text-lg text-slate-800">IniRazorAI</h1>
            <p className="text-xs text-slate-500">Intelligent Innovation</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLink to="/" className={({isActive}) => isActive ? "sidebar-link sidebar-link-active" : "sidebar-link sidebar-link-inactive"}>
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </NavLink>
          <NavLink to="/transactions" className={({isActive}) => isActive ? "sidebar-link sidebar-link-active" : "sidebar-link sidebar-link-inactive"}>
            <ArrowLeftRight className="w-5 h-5 mr-3" /> Transactions
          </NavLink>
          <NavLink to="/reconciliation" className={({isActive}) => isActive ? "sidebar-link sidebar-link-active" : "sidebar-link sidebar-link-inactive"}>
            <GitCompareArrows className="w-5 h-5 mr-3" /> Reconciliation
          </NavLink>
          <NavLink to="/exceptions" className={({isActive}) => isActive ? "sidebar-link sidebar-link-active" : "sidebar-link sidebar-link-inactive"}>
            <AlertTriangle className="w-5 h-5 mr-3" /> Exceptions
          </NavLink>
          <NavLink to="/audit" className={({isActive}) => isActive ? "sidebar-link sidebar-link-active" : "sidebar-link sidebar-link-inactive"}>
            <ScrollText className="w-5 h-5 mr-3" /> Audit Trail
          </NavLink>
          <NavLink to="/evaluation" className={({isActive}) => isActive ? "sidebar-link sidebar-link-active" : "sidebar-link sidebar-link-inactive"}>
            <BarChart3 className="w-5 h-5 mr-3" /> Evaluation
          </NavLink>
          <NavLink to="/settings" className={({isActive}) => isActive ? "sidebar-link sidebar-link-active" : "sidebar-link sidebar-link-inactive"}>
            <Settings className="w-5 h-5 mr-3" /> Settings
          </NavLink>
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-sm font-medium text-slate-800 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
            </div>
            <button onClick={logout} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-slate-800">AI Finance Controller</h2>
          <div className="flex items-center gap-4">
            <EnvironmentBadge />
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Operational
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
