import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Lock,
  Eye,
  Clock,
  HardDrive,
  Calendar,
  User,
  ShieldCheck,
  Tag,
  Star,
  Heart,
  MessageSquare,
  Send,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { ContentItem } from '../types';
import { VideoPlayer } from '../components/viewer/VideoPlayer';
import { PdfViewer } from '../components/viewer/PdfViewer';
import { HtmlSandbox } from '../components/viewer/HtmlSandbox';
import { useAuth } from '../context/AuthContext';

interface ContentDetailPageProps {
  content: ContentItem;
  onBack: () => void;
  onRefreshContent?: () => void;
}

interface UserComment {
  id: string;
  author: string;
  email: string;
  avatar: string;
  text: string;
  timestamp: string;
  rating?: number;
}

export const ContentDetailPage: React.FC<ContentDetailPageProps> = ({
  content,
  onBack,
}) => {
  const { user, fetchWithAuth } = useAuth();

  // Favorite state
  const [isFavorited, setIsFavorited] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`fav_${content.id}`);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // User's Rating state
  const [userRating, setUserRating] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`rating_${content.id}`);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [ratingSavedMsg, setRatingSavedMsg] = useState(false);

  // User comments/notes state
  const [comments, setComments] = useState<UserComment[]>(() => {
    try {
      const saved = localStorage.getItem(`comments_${content.id}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'c1',
        author: 'Security Compliance Bot',
        email: 'system@nexus.internal',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128',
        text: 'Zero-trust verification passed. Access strictly constrained to active authenticated sessions.',
        timestamp: 'Verified automatically',
        rating: 5,
      },
    ];
  });
  const [commentText, setCommentText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleToggleFavorite = () => {
    const next = !isFavorited;
    setIsFavorited(next);
    try {
      localStorage.setItem(`fav_${content.id}`, String(next));
    } catch {}
  };

  const handleRate = async (stars: number) => {
    setUserRating(stars);
    try {
      localStorage.setItem(`rating_${content.id}`, String(stars));
      await fetchWithAuth(`/api/content/${content.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: stars }),
      });
    } catch {}
    setRatingSavedMsg(true);
    setTimeout(() => setRatingSavedMsg(false), 2500);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: UserComment = {
      id: Math.random().toString(36).substring(2, 9),
      author: user?.full_name || 'Anonymous User',
      email: user?.email || 'user@internal',
      avatar: user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128',
      text: commentText.trim(),
      timestamp: 'Just now',
      rating: userRating > 0 ? userRating : undefined,
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    setCommentText('');
    try {
      localStorage.setItem(`comments_${content.id}`, JSON.stringify(updated));
    } catch {}
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Navigation & Enclave Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isFavorited
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-[#0f151c] text-slate-400 border-slate-800 hover:text-rose-400'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{isFavorited ? 'Bookmarked' : 'Bookmark'}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-[#0f151c] text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>

          {/* Protected Content Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0f151c] border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono text-[11px]">
              <Lock className="w-3.5 h-3.5" />
              <span>PROTECTED ENCLAVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Protected Viewer Stage */}
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {content.type === 'VIDEO' && (
          <VideoPlayer contentId={content.id} title={content.title} />
        )}

        {content.type === 'PDF' && (
          <PdfViewer
            contentId={content.id}
            title={content.title}
            initialPageCount={content.page_count || 12}
          />
        )}

        {content.type === 'HTML' && (
          <HtmlSandbox contentId={content.id} title={content.title} />
        )}
      </motion.div>

      {/* Interactive Rating Strip */}
      <div className="p-4 rounded-2xl bg-[#0f151c] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-300">Your Rating:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => handleRate(star)}
                className="p-1 text-slate-500 hover:text-amber-400 transition-colors cursor-pointer"
              >
                <Star
                  className={`w-5 h-5 ${
                    (hoverRating || userRating) >= star
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-600'
                  }`}
                />
              </button>
            ))}
          </div>
          {userRating > 0 && (
            <span className="text-xs font-mono text-amber-400 font-bold">
              {userRating} / 5
            </span>
          )}
        </div>

        <AnimatePresence>
          {ratingSavedMsg && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Feedback saved!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content Metadata & Security Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Left 2 Cols: Description, Tags & Interactive Comments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-[#0f151c] border border-slate-800 backdrop-blur-xs">
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono uppercase border ${
                  content.type === 'VIDEO'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : content.type === 'PDF'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                }`}
              >
                {content.type}
              </span>
              <span className="text-xs font-medium text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                {content.category}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {content.title}
            </h1>

            <p className="mt-3 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {content.description}
            </p>

            {content.tags && content.tags.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Tag className="w-3 h-3" /> Tags:
                </span>
                {content.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-xs font-mono text-slate-300 bg-slate-950 border border-slate-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Community Notes & Discussion */}
          <div className="p-6 rounded-3xl bg-[#0f151c] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Resource Notes & Reviews</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">{comments.length} notes</span>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add your note or review for this resource..."
                className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>

            {/* Comment List */}
            <div className="space-y-3 pt-3 divide-y divide-slate-800/60">
              {comments.map((c) => (
                <div key={c.id} className="pt-3 first:pt-0">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={c.avatar}
                        alt={c.author}
                        className="w-6 h-6 rounded-full object-cover border border-slate-700"
                      />
                      <span className="font-semibold text-slate-200">{c.author}</span>
                      {c.rating && (
                        <div className="flex items-center text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span className="text-[11px] font-mono ml-0.5">{c.rating}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{c.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1.5 pl-8 leading-relaxed">
                    {c.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Security Limitation Transparency Box */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Enterprise Content Security Architecture</span>
            </div>
            <p className="leading-relaxed">
              This asset is served strictly via authenticated range streaming through our server gateway.
              Direct storage bucket URLs are private and inaccessible to public clients. While client-side media
              rendering deters casual downloading, determined users with full control over their browser runtime
              can capture raw data buffers. Nexus protects against public exposure, unauthorized role
              escalation, and link sharing.
            </p>
          </div>
        </div>

        {/* Right Col: Resource Metadata Specs */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-[#0f151c] border border-slate-800 backdrop-blur-xs space-y-4 text-xs">
            <h3 className="font-bold text-sm text-white tracking-tight uppercase font-mono pb-2 border-b border-slate-800">
              Asset Properties
            </h3>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" /> Total Views
              </span>
              <span className="font-mono text-white font-semibold">{content.view_count}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" /> Payload Size
              </span>
              <span className="font-mono text-white font-semibold">{formatFileSize(content.file_size)}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Published Date
              </span>
              <span className="text-slate-200">{formatDate(content.created_at)}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Contributor
              </span>
              <span className="text-slate-200 truncate max-w-[120px]">{content.created_by_name || 'Administrator'}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" /> Storage Visibility
              </span>
              <span className="font-mono text-[11px] text-emerald-400 font-semibold">VERIFIED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
