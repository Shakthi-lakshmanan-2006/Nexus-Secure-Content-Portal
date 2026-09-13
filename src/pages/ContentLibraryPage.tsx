import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  LayoutGrid,
  List,
  FolderOpen,
  Filter,
  Video,
  FileText,
  Code2,
  HardDrive,
  Eye,
  Clock,
  ArrowRight,
  UploadCloud,
} from 'lucide-react';
import { ContentItem, ContentType } from '../types';
import { ContentCard } from '../components/content/ContentCard';

interface ContentLibraryPageProps {
  contents: ContentItem[];
  onSelectContent: (content: ContentItem) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onUploadClick?: () => void;
}

export const ContentLibraryPage: React.FC<ContentLibraryPageProps> = ({
  contents,
  onSelectContent,
  searchQuery,
  onSearchChange,
  onUploadClick,
}) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'VIEWS' | 'TITLE'>('NEWEST');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');

  // Derive unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    contents.forEach((c) => set.add(c.category));
    return Array.from(set);
  }, [contents]);

  // Filtering & Sorting
  const filteredContents = useMemo(() => {
    return contents
      .filter((item) => {
        // Search filter (title, description, tags, category)
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          !q ||
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.tags?.some((t) => t.toLowerCase().includes(q));

        // Type filter
        const matchesType = selectedType === 'ALL' || item.type === selectedType;

        // Category filter
        const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

        return matchesQuery && matchesType && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'VIEWS') {
          return b.view_count - a.view_count;
        }
        if (sortBy === 'TITLE') {
          return a.title.localeCompare(b.title);
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [contents, searchQuery, selectedType, selectedCategory, sortBy]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Search Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Content Library</h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse, search, and stream verified enterprise training, videos, and documentation.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Global Search Input (In-Page) */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search keyword, tag, title..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0f151c] border border-slate-800 text-xs text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
          </div>

          {onUploadClick && (
            <button
              onClick={onUploadClick}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-md shadow-emerald-950/30"
            >
              <UploadCloud className="w-4 h-4" />
              <span className="hidden sm:inline">Upload</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & View Controls Bar */}
      <div className="p-4 rounded-2xl bg-[#0f151c] border border-slate-800 backdrop-blur-xs flex flex-wrap items-center justify-between gap-4">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Types' },
            { id: 'VIDEO', label: 'Videos', icon: Video },
            { id: 'PDF', label: 'PDFs', icon: FileText },
            { id: 'HTML', label: 'HTML Guides', icon: Code2 },
          ].map((t) => {
            const active = selectedType === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right side dropdowns & view toggle */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-hidden text-xs cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c} className="bg-slate-900">{c}</option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'NEWEST' | 'VIEWS' | 'TITLE')}
            className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 focus:outline-hidden cursor-pointer"
          >
            <option value="NEWEST" className="bg-slate-900">Newest Added</option>
            <option value="VIEWS" className="bg-slate-900">Most Viewed</option>
            <option value="TITLE" className="bg-slate-900">Title (A-Z)</option>
          </select>

          {/* Grid/List Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'GRID' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'LIST' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Result Count Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
        <span>{filteredContents.length} resources verified in catalog</span>
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="text-emerald-400 hover:underline cursor-pointer"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Content Grid or List View */}
      {filteredContents.length === 0 ? (
        <div className="text-center py-20 bg-[#0f151c]/60 rounded-3xl border border-dashed border-slate-800 p-8">
          <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No matching resources</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            We couldn&apos;t find any assets matching your search keywords or filter criteria. Try clearing your filters or upload a new resource.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setSelectedType('ALL');
                setSelectedCategory('ALL');
                onSearchChange('');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
            {onUploadClick && (
              <button
                onClick={onUploadClick}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Upload Content
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredContents.map((content, idx) => (
            <ContentCard
              key={content.id}
              content={content}
              onSelect={onSelectContent}
              index={idx}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="divide-y divide-slate-800/80 rounded-2xl bg-[#0f151c] border border-slate-800 overflow-hidden">
          {filteredContents.map((content) => (
            <div
              key={content.id}
              onClick={() => onSelectContent(content)}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/50 cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-xl border mt-0.5 shrink-0 ${
                    content.type === 'VIDEO'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : content.type === 'PDF'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                  }`}
                >
                  {content.type === 'VIDEO' && <Video className="w-5 h-5" />}
                  {content.type === 'PDF' && <FileText className="w-5 h-5" />}
                  {content.type === 'HTML' && <Code2 className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white hover:text-emerald-300 transition-colors">
                      {content.title}
                    </h4>
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {content.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{content.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-center shrink-0 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>{content.view_count} views</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-medium">
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
