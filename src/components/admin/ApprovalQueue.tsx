import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Video,
  FileText,
  Code2,
  HardDrive,
  Eye,
  AlertTriangle,
  User,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { ContentItem } from '../../types';
import { VideoPlayer } from '../viewer/VideoPlayer';
import { PdfViewer } from '../viewer/PdfViewer';
import { HtmlSandbox } from '../viewer/HtmlSandbox';

interface ApprovalQueueProps {
  pendingItems: ContentItem[];
  onReview: (id: string, action: 'APPROVE' | 'REJECT', reason?: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  onToast: (type: 'success' | 'error' | 'warning', title: string, message?: string) => void;
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({
  pendingItems,
  onReview,
  onRefresh,
  onToast,
}) => {
  const [inspectingItem, setInspectingItem] = useState<ContentItem | null>(null);
  const [rejectingItem, setRejectingItem] = useState<ContentItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const presetReasons = [
    'Contains potential credentials or private internal keys',
    'Content formatting incomplete or lacks required documentation',
    'Media encoding or stream playback issue detected',
    'Duplicate of existing published organizational resource',
    'Out of scope for official enterprise portal knowledge base',
  ];

  const handleApprove = async (item: ContentItem) => {
    try {
      setIsProcessing(item.id);
      await onReview(item.id, 'APPROVE');
      onToast('success', 'Submission Approved', `"${item.title}" is now published to the content library.`);
      if (inspectingItem?.id === item.id) {
        setInspectingItem(null);
      }
    } catch (err) {
      onToast('error', 'Approval Error', (err as Error).message);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    try {
      setIsProcessing(rejectingItem.id);
      const reason = rejectionReason.trim() || 'Content submission does not meet organization criteria.';
      await onReview(rejectingItem.id, 'REJECT', reason);
      onToast('warning', 'Submission Rejected', `"${rejectingItem.title}" was rejected with feedback note.`);
      setRejectingItem(null);
      setRejectionReason('');
      if (inspectingItem?.id === rejectingItem.id) {
        setInspectingItem(null);
      }
    } catch (err) {
      onToast('error', 'Rejection Error', (err as Error).message);
    } finally {
      setIsProcessing(null);
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
      return new Date(iso).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Queue Header & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0f151c] border border-amber-500/20 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Pending Submissions Queue</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {pendingItems.length} awaiting review
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review member-uploaded guides, videos, and PDFs. Inspect assets directly before approving for organization-wide publication.
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 self-start sm:self-auto transition-colors cursor-pointer"
        >
          Refresh Queue
        </button>
      </div>

      {/* Empty State */}
      {pendingItems.length === 0 && (
        <div className="py-16 text-center rounded-2xl bg-[#0f151c]/60 border border-slate-800/80 p-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">All caught up!</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            There are no pending submissions awaiting review. When users upload new content, it will appear here for verification.
          </p>
        </div>
      )}

      {/* Submission Cards */}
      <div className="space-y-4">
        {pendingItems.map((item, idx) => {
          const isVideo = item.type === 'VIDEO';
          const isPdf = item.type === 'PDF';
          const isHtml = item.type === 'HTML';
          const busy = isProcessing === item.id;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-5 sm:p-6 rounded-2xl bg-[#0f151c] border border-slate-800 hover:border-amber-500/30 transition-all shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              {/* Left Details */}
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Type Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                      isVideo
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : isPdf
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                    }`}
                  >
                    {isVideo && <Video className="w-3.5 h-3.5" />}
                    {isPdf && <FileText className="w-3.5 h-3.5" />}
                    {isHtml && <Code2 className="w-3.5 h-3.5" />}
                    <span>{item.type}</span>
                  </span>

                  <span className="text-xs font-medium text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
                    {item.category}
                  </span>

                  <span className="text-[11px] font-mono text-amber-400/90 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Submitted {formatDate(item.created_at)}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{item.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Submitter info & tags */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5 font-medium text-slate-200">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{item.created_by_name || 'Member'}</span>
                    {item.created_by_email && (
                      <span className="text-[11px] font-mono text-slate-400">
                        ({item.created_by_email})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatFileSize(item.file_size)}</span>
                  </div>

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

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
                {/* Inspect Preview Button */}
                <button
                  onClick={() => setInspectingItem(item)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700/80"
                  title="Inspect media before decision"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Inspect Preview</span>
                </button>

                {/* Reject Button */}
                <button
                  onClick={() => setRejectingItem(item)}
                  disabled={busy}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Reject</span>
                </button>

                {/* Accept & Publish Button */}
                <button
                  onClick={() => handleApprove(item)}
                  disabled={busy}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>{busy ? 'Publishing...' : 'Accept & Publish'}</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Inspect Media Preview Modal */}
      <AnimatePresence>
        {inspectingItem && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-4xl max-h-[90vh] bg-[#0c1117] border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    INSPECTION ENCLAVE
                  </span>
                  <h3 className="text-sm font-bold text-white truncate">
                    {inspectingItem.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(inspectingItem)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => {
                      setRejectingItem(inspectingItem);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-1 cursor-pointer border border-rose-500/30"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => setInspectingItem(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Body: Active media player */}
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

              {/* Modal Footer Description */}
              <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Submitted by: {inspectingItem.created_by_name || 'Member'} ({inspectingItem.created_by_email})</span>
                <span>Original File: {inspectingItem.original_filename} ({formatFileSize(inspectingItem.file_size)})</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rejection Reason Modal */}
      <AnimatePresence>
        {rejectingItem && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0f151c] border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Reject Submission</h3>
                  <p className="text-xs text-slate-400">
                    Provide feedback so the submitter understands why this was not approved.
                  </p>
                </div>
              </div>

              {/* Title preview */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium">
                Target: &quot;{rejectingItem.title}&quot;
              </div>

              {/* Preset Reason Chips */}
              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                  Quick Reason Presets:
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {presetReasons.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setRejectionReason(preset)}
                      className={`w-full text-left text-xs p-2 rounded-lg border transition-colors cursor-pointer ${
                        rejectionReason === preset
                          ? 'bg-rose-500/20 text-rose-200 border-rose-500/40'
                          : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Reason Textarea */}
              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                  Reviewer Notes:
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this submission was rejected..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingItem(null);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-rose-950/40 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Confirm Rejection</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
