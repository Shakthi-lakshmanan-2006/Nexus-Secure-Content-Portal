import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Video,
  FileText,
  Code2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers,
  Lock,
  UploadCloud,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ContentItem } from '../types';
import { ContentCard } from '../components/content/ContentCard';
import { MySubmissions } from '../components/content/MySubmissions';
import { UploadModal } from '../components/admin/UploadModal';

interface DashboardPageProps {
  contents: ContentItem[];
  onSelectContent: (content: ContentItem) => void;
  onNavigate: (view: string) => void;
  onRefreshContents?: () => Promise<void>;
  onToast?: (type: 'success' | 'error' | 'warning', title: string, message?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  contents,
  onSelectContent,
  onNavigate,
  onRefreshContents,
  onToast,
}) => {
  const { user, isAdmin } = useAuth();
  const firstName = user?.full_name?.split(' ')[0] || 'Member';
  const [activeViewTab, setActiveViewTab] = useState<'catalog' | 'submissions'>('catalog');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const totalContent = contents.length;
  const totalVideos = contents.filter((c) => c.type === 'VIDEO').length;
  const totalPdfs = contents.filter((c) => c.type === 'PDF').length;
  const totalHtml = contents.filter((c) => c.type === 'HTML').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1722] via-[#0d141e] to-[#0a1b1a] border border-slate-800/80 p-8 sm:p-10 shadow-2xl"
      >
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-medium text-emerald-300 mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>NEXUS SECURE ENCLAVE • GOOGLE VERIFIED</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {firstName}.
          </h2>

          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Upload new training, videos, or documents for administrator review. Approved items are
            safely published to the encrypted organization catalog.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Content</span>
            </button>

            <button
              onClick={() => onNavigate('content')}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>

            {isAdmin ? (
              <button
                onClick={() => onNavigate('admin-queue')}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Approval Queue</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('my-uploads')}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>My Stored Files Status</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient Decorative Background Shapes */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'All Assets',
            count: totalContent,
            icon: Layers,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
          },
          {
            label: 'Video Streams',
            count: totalVideos,
            icon: Video,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
          },
          {
            label: 'PDF Documents',
            count: totalPdfs,
            icon: FileText,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
          },
          {
            label: 'HTML Guides',
            count: totalHtml,
            icon: Code2,
            color: 'text-teal-400',
            bg: 'bg-teal-500/10',
            border: 'border-teal-500/20',
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-5 rounded-2xl bg-[#0f151c] border border-slate-800 backdrop-blur-xs flex items-center justify-between shadow-lg"
            >
              <div>
                <p className="text-xs font-medium text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1 font-mono">{stat.count}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} border ${stat.border}`}>
                <Icon className="w-5 h-5" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Section View Tabs: Catalog vs My Uploads */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveViewTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeViewTab === 'catalog'
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Featured Catalog</span>
        </button>

        <button
          onClick={() => setActiveViewTab('submissions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeViewTab === 'submissions'
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
          <span>My Uploads &amp; Status</span>
        </button>
      </div>

      {/* Tab 1: Available Catalog Resources */}
      {activeViewTab === 'catalog' && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Available Resources</h3>
              <p className="text-xs text-slate-400">
                Verified training and architecture assets approved for secure streaming.
              </p>
            </div>

            <button
              onClick={() => onNavigate('content')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All ({contents.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {contents.slice(0, 6).map((content, idx) => (
              <ContentCard
                key={content.id}
                content={content}
                onSelect={onSelectContent}
                index={idx}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: User's Own Uploads with Realtime Status Tracking */}
      {activeViewTab === 'submissions' && (
        <MySubmissions
          onUploadNew={() => setIsUploadOpen(true)}
          onToast={onToast || (() => {})}
        />
      )}

      {/* Security Architecture Compliance Notice */}
      <div className="p-6 rounded-2xl bg-[#0b1016] border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-slate-200">
              Zero-Trust Content Protection Enclave Active
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              All uploads pass virus/integrity analysis and require administrator review before publication.
              Access tokens are tied to verified Google identity sessions.
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400 shrink-0">
          STATUS: <span className="text-emerald-400 font-semibold">ONLINE &amp; MONITORED</span>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={async () => {
          if (onRefreshContents) {
            await onRefreshContents();
          }
          setActiveViewTab('submissions');
        }}
        onToast={onToast || (() => {})}
      />
    </div>
  );
};
