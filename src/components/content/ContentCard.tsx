import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Video,
  FileText,
  Code2,
  ArrowRight,
  Eye,
  HardDrive,
  Clock,
  Star,
  Heart,
  User,
} from 'lucide-react';
import { ContentItem } from '../../types';

interface ContentCardProps {
  content: ContentItem;
  onSelect: (content: ContentItem) => void;
  index?: number;
  onToggleFavorite?: (id: string, isFav: boolean) => void;
  isFavorited?: boolean;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  content,
  onSelect,
  index = 0,
  onToggleFavorite,
  isFavorited = false,
}) => {
  const [favorited, setFavorited] = useState(isFavorited);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !favorited;
    setFavorited(next);
    if (onToggleFavorite) {
      onToggleFavorite(content.id, next);
    }
  };

  const isVideo = content.type === 'VIDEO';
  const isPdf = content.type === 'PDF';
  const isHtml = content.type === 'HTML';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.05, 0.3) }}
      onClick={() => onSelect(content)}
      className="group relative flex flex-col justify-between p-5 rounded-2xl bg-[#0f151c]/90 hover:bg-[#141d27] border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-emerald-950/20 cursor-pointer overflow-hidden backdrop-blur-xs"
    >
      {/* Ambient background glow on hover */}
      <div
        className={`absolute -right-16 -top-16 w-36 h-36 rounded-full blur-3xl opacity-0 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none ${
          isVideo ? 'bg-amber-500' : isPdf ? 'bg-emerald-500' : 'bg-teal-500'
        }`}
      />

      {/* Header Info */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Type Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wide border ${
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
            <span>{content.type}</span>
          </div>

          {/* Category Pill & Favorite Button */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60 truncate max-w-[130px]">
              {content.category}
            </span>

            <button
              onClick={handleFavoriteClick}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                favorited
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  : 'bg-slate-900/60 text-slate-500 hover:text-rose-400 border-slate-800 hover:border-slate-700'
              }`}
              title={favorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-rose-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white tracking-tight line-clamp-2 group-hover:text-emerald-300 transition-colors">
          {content.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {content.description}
        </p>

        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {content.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium font-mono text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800"
              >
                #{tag}
              </span>
            ))}
            {content.tags.length > 3 && (
              <span className="text-[10px] text-slate-500 py-0.5">
                +{content.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          {/* Rating */}
          <div className="flex items-center gap-1 text-amber-400 font-semibold text-xs">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{content.rating ? content.rating.toFixed(1) : '4.9'}</span>
          </div>

          {/* File Size */}
          <div className="flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatFileSize(content.file_size)}</span>
          </div>

          {/* Duration or Page Count */}
          {isVideo && content.duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{content.duration}</span>
            </div>
          )}

          {isPdf && content.page_count && (
            <div className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>{content.page_count} pgs</span>
            </div>
          )}

          {/* Views */}
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>{content.view_count}</span>
          </div>
        </div>

        {/* View Action Link */}
        <div className="flex items-center gap-1 text-emerald-400 group-hover:translate-x-1 transition-transform font-medium">
          <span className="text-xs">Open</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.div>
  );
};
