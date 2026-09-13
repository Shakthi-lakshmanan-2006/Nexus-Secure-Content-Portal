import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UploadCloud,
  Clock,
  CheckCircle2,
  XCircle,
  Video,
  FileText,
  Code2,
  HardDrive,
  Eye,
  Trash2,
  AlertCircle,
  Sparkles,
  Plus,
} from 'lucide-react';
import { ContentItem } from '../../types';
import { VideoPlayer } from '../viewer/VideoPlayer';
import { PdfViewer } from '../viewer/PdfViewer';
import { HtmlSandbox } from '../viewer/HtmlSandbox';
import { ConfirmModal } from '../ui/ConfirmModal';
import { useAuth } from '../../context/AuthContext';

interface MySubmissionsProps {
  onOpenUpload?: () => void;
  onUploadNew?: () => void;
  onToast: (type: 'success' | 'error' | 'warning', title: string, message?: string) => void;
}

export const MySubmissions: React.FC<MySubmissionsProps> = ({ onOpenUpload, onUploadNew, onToast }) => {
  const { fetchWithAuth } = useAuth();
  const handleOpenUpload = onOpenUpload || onUploadNew || (() => {});
  const [submissions, setSubmissions] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [inspectingItem, setInspectingItem] = useState<ContentItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/content/my-submissions');
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error('Failed to load user submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleWithdraw = async () => {
    if (!deletingId) return;
    try {
      setIsDeleting(true);
      const res = await fetchWithAuth(`/api/content/submissions/${deletingId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to withdraw submission');
      }
      onToast('success', 'Submission Withdrawn', 'Your content submission was removed from the queue.');
      setDeletingId(null);
      await fetchSubmissions();
    } catch (err) {
      onToast('error', 'Withdrawal Error', (err as Error).message);
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0f151c] border border-emerald-500/20 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-medium text-emerald-300 mb-2">
            <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>MEMBER CONTRIBUTION WORKSPACE</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">My Submissions</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Track your uploaded training materials, document procedures, and interactive architecture references.
            Submissions are reviewed by administrators before being published to the secure organizational library.
          </p>
        </div>

        <button
          onClick={handleOpenUpload}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Content</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-16 text-center text-xs text-slate-400 font-mono">
          Loading your submission history...
        </div>
      )}

      {/* Empty State */}
      {!loading && submissions.length === 0 && (
        <div className="py-20 text-center rounded-3xl bg-[#0f151c]/60 border border-slate-800 p-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No submissions yet</h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto">
            You haven&apos;t submitted any files yet. Share training videos, compliance SOP runbooks, or cloud hardening guides with your team.
          </p>
          <button
            onClick={handleOpenUpload}
            className="mt-5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Your First Resource</span>
          </button>
        </div>
      )}

      {/* Submissions List */}
      {!loading && submissions.length > 0 && (
        <div className="space-y-4">
          {submissions.map((item, idx) => {
            const isPending = item.status === 'PENDING_REVIEW';
            const isApproved = item.status === 'APPROVED';
            const isRejected = item.status === 'REJECTED';
            const isVideo = item.type === 'VIDEO';
            const isPdf = item.type === 'PDF';
            const isHtml = item.type === 'HTML';

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="p-5 sm:p-6 rounded-2xl bg-[#0f151c] border border-slate-800 hover:border-slate-700/80 transition-all shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Left content details */}
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Badge */}
                    {isPending && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                        <span>AWAITING ADMIN REVIEW</span>
                      </span>
                    )}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>APPROVED &amp; PUBLISHED</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-mono bg-rose-500/10 text-rose-300 border border-rose-500/30">
                        <XCircle className="w-3 h-3 text-rose-400" />
                        <span>SUBMISSION REJECTED</span>
                      </span>
                    )}

                    {/* Type Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        isVideo
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : isPdf
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                      }`}
                    >
                      {isVideo && <Video className="w-3 h-3" />}
                      {isPdf && <FileText className="w-3 h-3" />}
                      {isHtml && <Code2 className="w-3 h-3" />}
                      <span>{item.type}</span>
                    </span>

                    <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                      {item.category}
                    </span>

                    <span className="text-xs font-mono text-slate-400">
                      Submitted on {formatDate(item.created_at)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">{item.title}</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Rejection reason banner if rejected */}
                  {isRejected && item.rejection_reason && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2 mt-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Reviewer Feedback: </span>
                        <span>{item.rejection_reason}</span>
                      </div>
                    </div>
                  )}

                  {/* Metadata tags & size */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                    <div className="flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatFileSize(item.file_size)}</span>
                    </div>

                    {isApproved && (
                      <div className="flex items-center gap-1 text-emerald-400 font-medium">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{item.view_count} total views</span>
                      </div>
                    )}

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        {item.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
                  <button
                    onClick={() => setInspectingItem(item)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700/80"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Preview Asset</span>
                  </button>

                  {/* If pending or rejected, allow withdrawal */}
                  {(isPending || isRejected) && (
                    <button
                      onClick={() => setDeletingId(item.id)}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Withdraw submission"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Withdraw</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {inspectingItem && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-4xl max-h-[90vh] bg-[#0c1117] border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-white truncate">
                    {inspectingItem.title}
                  </h3>
                  <p className="text-[11px] font-mono text-emerald-400">
                    STATUS: {inspectingItem.status}
                  </p>
                </div>
                <button
                  onClick={() => setInspectingItem(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 min-h-[400px] flex items-center justify-center">
                {inspectingItem.type === 'VIDEO' && (
                  <div className="w-full">
                    <VideoPlayer contentId={inspectingItem.id} title={inspectingItem.title} />
                  </div>
                )}
                {inspectingItem.type === 'PDF' && (
                  <div className="w-full h-[550px]">
                    <PdfViewer contentId={inspectingItem.id} title={inspectingItem.title} />
                  </div>
                )}
                {inspectingItem.type === 'HTML' && (
                  <div className="w-full h-[550px]">
                    <HtmlSandbox contentId={inspectingItem.id} title={inspectingItem.title} />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Withdraw Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="Withdraw Submission"
        description="Are you sure you want to withdraw this submission? It will be removed from the review queue and private vault."
        confirmLabel="Withdraw Submission"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleWithdraw}
        onClose={() => setDeletingId(null)}
      />
    </div>
  );
};
