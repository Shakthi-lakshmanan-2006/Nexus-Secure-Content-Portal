import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Layers,
  Plus,
  Edit3,
  Trash2,
  Eye,
  ShieldAlert,
  ShieldCheck,
  History,
  Video,
  FileText,
  Code2,
  HardDrive,
  Calendar,
  Lock,
  Sparkles,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ContentItem, AdminStats, ActivityLog } from '../types';
import { UploadModal } from '../components/admin/UploadModal';
import { EditModal } from '../components/admin/EditModal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { SecurityTestsRunner } from '../components/admin/SecurityTestsRunner';
import { ActivityLogTable } from '../components/admin/ActivityLogTable';
import { ApprovalQueue } from '../components/admin/ApprovalQueue';
import { Confetti } from '../components/ui/Confetti';

interface AdminPageProps {
  initialSubTab?: 'content' | 'queue' | 'security' | 'activity';
  contents: ContentItem[];
  onSelectContent: (content: ContentItem) => void;
  onRefreshContents: () => Promise<void>;
  onToast: (type: 'success' | 'error' | 'warning', title: string, message?: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  initialSubTab = 'queue',
  contents,
  onSelectContent,
  onRefreshContents,
  onToast,
}) => {
  const { user, isAdmin, switchRoleDemo, fetchWithAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<'content' | 'queue' | 'security' | 'activity'>(initialSubTab);

  // Stats & Logs & Pending Submissions
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [pendingItems, setPendingItems] = useState<ContentItem[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [deletingContent, setDeletingContent] = useState<ContentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setActiveTab(initialSubTab);
  }, [initialSubTab]);

  const fetchStatsAndLogs = async () => {
    if (!isAdmin) return;
    try {
      setIsLoadingStats(true);
      const [statsRes, logsRes, pendingRes] = await Promise.all([
        fetchWithAuth('/api/admin/stats'),
        fetchWithAuth('/api/admin/activity'),
        fetchWithAuth('/api/admin/pending'),
      ]);

      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats(sData.stats);
      }

      if (logsRes.ok) {
        const lData = await logsRes.json();
        setLogs(lData.logs);
      }

      if (pendingRes.ok) {
        const pData = await pendingRes.json();
        setPendingItems(pData.pending || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats/logs:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStatsAndLogs();
  }, [isAdmin, contents]);

  const handleReviewSubmission = async (id: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
    const res = await fetchWithAuth(`/api/admin/content/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to review submission');
    }

    if (action === 'APPROVE') {
      setShowConfetti(true);
    }

    await onRefreshContents();
    await fetchStatsAndLogs();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingContent) return;
    try {
      setIsDeleting(true);
      const res = await fetchWithAuth(`/api/admin/content/${deletingContent.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete resource.');
      }

      onToast('success', 'Resource Deleted', `"${deletingContent.title}" and its storage asset were permanently deleted.`);
      setDeletingContent(null);
      await onRefreshContents();
      await fetchStatsAndLogs();
    } catch (err: unknown) {
      console.error('Delete error:', err);
      onToast('error', 'Deletion Error', (err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  // STRICT SERVER-SIDE & CLIENT-SIDE ROLE DEFENSE
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">403 — Unauthorized Access</h2>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
          You don&apos;t have permission to access this area. The administration enclave requires verified
          ADMIN role credentials verified server-side.
        </p>

        <div className="mt-8 p-5 rounded-2xl bg-[#0f151c] border border-slate-800 text-left text-xs max-w-md mx-auto space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Current User:</span>
            <span className="font-mono text-white">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Assigned Role:</span>
            <span className="font-mono text-emerald-400 font-bold">{user?.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Authorized Admin Email:</span>
            <span className="font-mono text-amber-400 font-bold">sakthilakshman521@gmail.com</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Confetti Celebration on Approval */}
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              CMS ENCLAVE
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">Logged in as {user?.email}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Administrator Portal
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Review user submissions, manage content catalogs, verify security rules, and inspect audit logs.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer self-start sm:self-auto hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Upload &amp; Publish</span>
        </button>
      </div>

      {/* Admin Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        {[
          { label: 'Pending Review', value: pendingItems.length, icon: Clock, color: 'text-amber-400', highlight: pendingItems.length > 0 },
          { label: 'Total Content', value: stats?.total_content ?? contents.length, icon: Layers, color: 'text-emerald-400' },
          { label: 'Videos', value: stats?.total_videos ?? contents.filter((c) => c.type === 'VIDEO').length, icon: Video, color: 'text-amber-400' },
          { label: 'PDFs', value: stats?.total_pdfs ?? contents.filter((c) => c.type === 'PDF').length, icon: FileText, color: 'text-emerald-400' },
          { label: 'HTML Pages', value: stats?.total_html ?? contents.filter((c) => c.type === 'HTML').length, icon: Code2, color: 'text-teal-400' },
          { label: 'Total Views', value: stats?.total_views ?? contents.reduce((a, b) => a + b.view_count, 0), icon: Eye, color: 'text-slate-300' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`p-4 rounded-2xl bg-[#0f151c] border backdrop-blur-xs flex items-center justify-between ${
                item.highlight ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800'
              }`}
            >
              <div>
                <p className="text-[11px] font-medium text-slate-400">{item.label}</p>
                <p className={`text-xl font-bold font-mono mt-1 ${item.highlight ? 'text-amber-400 animate-pulse' : 'text-white'}`}>
                  {item.value}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Admin Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'queue', label: 'Approval Queue', icon: Clock, badge: pendingItems.length },
          { id: 'content', label: 'Content Catalog', icon: Layers },
          { id: 'security', label: 'Security Verification', icon: ShieldCheck },
          { id: 'activity', label: 'Audit Activity Logs', icon: History },
        ].map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'content' | 'queue' | 'security' | 'activity')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-slate-950 ml-1">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 0: Approval Queue */}
      {activeTab === 'queue' && (
        <ApprovalQueue
          pendingItems={pendingItems}
          onReview={handleReviewSubmission}
          onRefresh={fetchStatsAndLogs}
          onToast={onToast}
        />
      )}

      {/* TAB 1: Content Catalog Table */}
      {activeTab === 'content' && (
        <div className="bg-[#0f151c] border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold bg-slate-950/40">
                  <th className="py-3.5 px-6">Resource</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4">Created</th>
                  <th className="py-3.5 px-4">Views</th>
                  <th className="py-3.5 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {contents.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Title & Description */}
                    <td className="py-4 px-6 max-w-xs sm:max-w-md">
                      <div className="font-bold text-white text-sm line-clamp-1">{item.title}</div>
                      <div className="text-slate-400 line-clamp-1 text-[11px] mt-0.5">{item.description}</div>
                    </td>

                    {/* Type */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold uppercase ${
                          item.type === 'VIDEO'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : item.type === 'PDF'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-300">
                      {item.category}
                    </td>

                    {/* Size */}
                    <td className="py-4 px-4 whitespace-nowrap font-mono text-slate-400">
                      {formatFileSize(item.file_size)}
                    </td>

                    {/* Created Date */}
                    <td className="py-4 px-4 whitespace-nowrap font-mono text-slate-400">
                      {formatDate(item.created_at)}
                    </td>

                    {/* Views */}
                    <td className="py-4 px-4 whitespace-nowrap font-mono text-white font-medium">
                      {item.view_count}
                    </td>

                    {/* Actions */}
                    <td className="py-4 pr-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectContent(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Open View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setEditingContent(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit Metadata"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeletingContent(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Automated Security & Access-Control Verification */}
      {activeTab === 'security' && <SecurityTestsRunner />}

      {/* TAB 3: Audit Activity Logs */}
      {activeTab === 'activity' && (
        <ActivityLogTable logs={logs} isLoading={isLoadingStats} />
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={async () => {
          await onRefreshContents();
          await fetchStatsAndLogs();
        }}
        onToast={onToast}
      />

      {/* Edit Modal */}
      <EditModal
        isOpen={Boolean(editingContent)}
        content={editingContent}
        onClose={() => setEditingContent(null)}
        onSuccess={async () => {
          await onRefreshContents();
          await fetchStatsAndLogs();
        }}
        onToast={onToast}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingContent)}
        title="Delete content permanently?"
        description={`This action permanently removes "${deletingContent?.title}" and its associated encrypted storage file. This cannot be undone.`}
        confirmLabel="Delete permanently"
        cancelLabel="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingContent(null)}
      />
    </div>
  );
};
