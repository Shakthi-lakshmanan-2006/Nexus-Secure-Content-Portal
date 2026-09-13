import React from 'react';
import {
  Menu,
  Search,
  Lock,
  Command,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  currentView: string;
  onOpenMobileMenu: () => void;
  onOpenSearch?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onOpenMobileMenu,
  searchQuery,
  onSearchChange,
}) => {
  const { user, isAdmin } = useAuth();

  const getBreadcrumbTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'content':
        return 'Content Library';
      case 'my-uploads':
        return 'Upload & My Stored Files';
      case 'content-detail':
        return 'Protected Content Enclave';
      case 'admin-queue':
        return 'Admin • Approval Queue';
      case 'admin-content':
        return 'Admin • Content Catalog';
      case 'admin-security':
        return 'Admin • Security Verification';
      case 'admin-activity':
        return 'Admin • Audit Activity Logs';
      default:
        return 'Portal';
    }
  };

  return (
    <header className="h-16 px-4 sm:px-8 border-b border-slate-800/80 bg-[#0b0f14]/85 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 hidden sm:inline">NEXUS</span>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <span className="text-emerald-400 font-semibold tracking-wide">
            {getBreadcrumbTitle()}
          </span>
        </div>
      </div>

      {/* Middle: Quick Search Input */}
      <div className="hidden md:flex items-center max-w-md w-full mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search verified catalog, tags, guides..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-12 py-1.5 rounded-xl bg-[#0f151c] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500/80 transition-colors"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right: Security Status & User Role Badge */}
      <div className="flex items-center gap-3">
        {/* Security Enclave Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/30 border border-emerald-900/40 text-[11px] font-mono font-medium text-emerald-300">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>ZERO-TRUST ENCLAVE</span>
        </div>

        {/* Role Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono tracking-wider uppercase border ${
            isAdmin
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}
          />
          <span>{isAdmin ? 'ADMIN' : 'VIEWER'}</span>
        </div>
      </div>
    </header>
  );
};
