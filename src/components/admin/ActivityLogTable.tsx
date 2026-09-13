import React, { useState } from 'react';
import { ActivityLog } from '../../types';
import {
  Upload,
  Edit3,
  Trash2,
  Eye,
  ShieldAlert,
  LogIn,
  Search,
  Filter,
} from 'lucide-react';

interface ActivityLogTableProps {
  logs: ActivityLog[];
  isLoading?: boolean;
}

export const ActivityLogTable: React.FC<ActivityLogTableProps> = ({ logs, isLoading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const formatTimestamp = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.content_title && log.content_title.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'UPLOAD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Upload className="w-3 h-3" /> UPLOAD
          </span>
        );
      case 'EDIT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Edit3 className="w-3 h-3" /> EDIT
          </span>
        );
      case 'DELETE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Trash2 className="w-3 h-3" /> DELETE
          </span>
        );
      case 'VIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Eye className="w-3 h-3" /> VIEW
          </span>
        );
      case 'SECURITY_TEST':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldAlert className="w-3 h-3" /> AUDIT_TEST
          </span>
        );
      case 'LOGIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <LogIn className="w-3 h-3" /> LOGIN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold font-mono bg-slate-800 text-slate-300">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Security Audit & Activity Trail</h2>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident logs of all uploads, views, deletions, logins, and authorization checks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-cyan-500 transition-colors w-48 sm:w-56"
            />
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-hidden text-xs"
            >
              <option value="ALL" className="bg-slate-900">All Actions</option>
              <option value="UPLOAD" className="bg-slate-900">Uploads</option>
              <option value="VIEW" className="bg-slate-900">Views</option>
              <option value="EDIT" className="bg-slate-900">Edits</option>
              <option value="DELETE" className="bg-slate-900">Deletions</option>
              <option value="SECURITY_TEST" className="bg-slate-900">Security Checks</option>
              <option value="LOGIN" className="bg-slate-900">Logins</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="pb-3 pr-4 font-mono">Timestamp</th>
              <th className="pb-3 px-4">Action</th>
              <th className="pb-3 px-4">Subject User</th>
              <th className="pb-3 px-4">Resource Target</th>
              <th className="pb-3 pl-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading audit stream...
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No audit entries matching filter criteria.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 pr-4 font-mono text-slate-400 whitespace-nowrap">
                    {formatTimestamp(log.created_at)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">{getActionBadge(log.action)}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-white">{log.user_name}</div>
                    <div className="text-[11px] font-mono text-slate-400 truncate max-w-xs">{log.user_email}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-200 truncate max-w-xs">
                    {log.content_title || '—'}
                  </td>
                  <td className="py-3.5 pl-4 font-mono text-slate-400 text-[11px] truncate max-w-xs">
                    {log.metadata ? JSON.stringify(log.metadata) : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
