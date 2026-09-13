import React, { useState, useEffect } from 'react';
import {
  Shield,
  LayoutDashboard,
  FolderLock,
  Layers,
  ShieldCheck,
  History,
  LogOut,
  Sparkles,
  ChevronRight,
  Clock,
  X,
  UploadCloud,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { user, isAdmin, logout, fetchWithAuth } = useAuth();
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchPending = async () => {
      try {
        const res = await fetchWithAuth('/api/admin/pending');
        if (res.ok) {
          const data = await res.json();
          setPendingCount(data.pending?.length || 0);
        }
      } catch {
        // silent fail in background
      }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 15000);
    return () => clearInterval(interval);
  }, [isAdmin, fetchWithAuth]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'content', label: 'Content Library', icon: FolderLock },
    { id: 'my-uploads', label: 'Upload & My Files', icon: UploadCloud },
  ];

  const adminItems = [
    {
      id: 'admin-queue',
      label: 'Approval Queue',
      icon: Clock,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { id: 'admin-content', label: 'Content Catalog', icon: Layers },
    { id: 'admin-security', label: 'Security Verification', icon: ShieldCheck },
    { id: 'admin-activity', label: 'Audit Activity Logs', icon: History },
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 w-72 bg-[#0b0f14] border-r border-slate-800/80 flex flex-col justify-between z-50 transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-lg shadow-emerald-950/50">
                <Shield className="w-5 h-5 text-white" />
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-wider text-white">NEXUS</h1>
                <p className="text-[11px] font-mono tracking-tight text-emerald-400 font-medium">
                  SECURE PORTAL
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="p-1 text-slate-400 hover:text-white lg:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-1 text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400">
              Workspace
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    active
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Admin Enclave Section (Only visible to Authorized Admin) */}
            {isAdmin && (
              <div className="pt-5 space-y-1.5">
                <div className="px-3 py-1 text-[10px] font-bold font-mono uppercase tracking-wider text-amber-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Admin Controls</span>
                  </span>
                  {pendingCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                      {pendingCount} review
                    </span>
                  )}
                </div>
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const active = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        active
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/25 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {typeof item.badge === 'number' && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-slate-950">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </nav>
        </div>

        {/* Footer Area: User Profile & Status */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          {/* Identity Verification Badge */}
          <div className="p-3 rounded-xl bg-[#0f151c] border border-slate-800">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
              <span className="text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                Google Identity
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                  isAdmin
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {isAdmin ? 'ADMIN' : 'VIEWER'}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-300 truncate">
              {user?.email}
            </p>
            {isAdmin ? (
              <p className="text-[10px] text-amber-400/90 mt-1">
                Authorized Admin Privilege Verified
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 mt-1">
                Standard Viewer • Uploads require admin review
              </p>
            )}
          </div>

          {/* User Profile Card */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128'}
                alt={user?.full_name || 'User'}
                className="w-8 h-8 rounded-full border border-slate-700 object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.full_name || 'Nexus User'}</p>
                <p className="text-[10px] font-mono text-slate-400 truncate">{user?.email || 'user@internal'}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
              title="Secure Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
