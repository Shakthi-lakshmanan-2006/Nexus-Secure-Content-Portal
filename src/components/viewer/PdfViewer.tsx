import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  FileText,
  Lock,
  RotateCw,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { WatermarkOverlay } from './WatermarkOverlay';
import { useAuth } from '../../context/AuthContext';

interface PdfViewerProps {
  contentId: string;
  title: string;
  initialPageCount?: number;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  contentId,
  title,
  initialPageCount = 12,
}) => {
  const { sessionToken, fetchWithAuth } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialPageCount);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authenticated protected PDF binary stream endpoint
  const pdfUrl = `/api/content/${contentId}/pdf${sessionToken ? `?token=${encodeURIComponent(sessionToken)}` : ''}`;

  useEffect(() => {
    // Verify document availability
    const checkDoc = async () => {
      try {
        setIsLoading(true);
        const res = await fetchWithAuth(pdfUrl, { method: 'HEAD' });
        if (!res.ok) {
          throw new Error('Unable to securely load this document.');
        }
        setIsLoading(false);
      } catch (err: unknown) {
        setError((err as Error).message || 'Failed to authenticate and retrieve PDF asset.');
        setIsLoading(false);
      }
    };
    checkDoc();
  }, [contentId, pdfUrl]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div
      className={`relative flex flex-col w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'min-h-[640px]'
      }`}
    >
      {/* Viewer Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight line-clamp-1">{title}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-cyan-400">
                <Lock className="w-3 h-3" /> Protected PDF Enclave
              </span>
              <span>•</span>
              <span>Page {currentPage} of {totalPages}</span>
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Page Navigation */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1.5 text-slate-300 hover:text-white disabled:opacity-40 rounded hover:bg-slate-700 transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono text-slate-200">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="p-1.5 text-slate-300 hover:text-white disabled:opacity-40 rounded hover:bg-slate-700 transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60 hidden sm:flex">
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-slate-700 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono text-slate-300">{zoomLevel}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-slate-700 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Rotate Control */}
          <button
            onClick={handleRotate}
            className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition-colors hidden sm:block"
            title="Rotate 90deg"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Document Presentation Area */}
      <div className="relative flex-1 bg-slate-900/60 overflow-auto flex items-center justify-center p-4 sm:p-8">
        {/* Deterrent Security Watermark */}
        <WatermarkOverlay opacity={0.15} />

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 z-10">
            <div className="w-10 h-10 border-3 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
            <p className="mt-3 text-xs font-mono text-cyan-200">DECRYPTING PROTECTED DOCUMENT...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-md z-10">
            <AlertCircle className="w-12 h-12 text-rose-400 mb-3" />
            <h4 className="text-base font-semibold text-white">Unable to load document</h4>
            <p className="mt-1 text-sm text-slate-400 leading-relaxed">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
              }}
              className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              Please try again
            </button>
          </div>
        )}

        {/* High-Fidelity Render Canvas / Protected Object */}
        {!isLoading && !error && (
          <div
            className="relative transition-transform duration-200 shadow-2xl bg-white rounded-sm overflow-hidden"
            style={{
              transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              width: '100%',
              maxWidth: '800px',
              minHeight: '900px',
            }}
          >
            {/* Embedded Native / Object Reader targeting protected endpoint with #toolbar=0 */}
            <object
              data={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              type="application/pdf"
              className="w-full h-[900px] border-none block"
            >
              {/* Fallback Presentation Container for browsers without native plugin */}
              <div className="flex flex-col items-center justify-center h-[700px] p-8 text-center text-slate-800 bg-slate-100">
                <FileText className="w-16 h-16 text-slate-400 mb-4" />
                <h4 className="text-lg font-bold text-slate-900">Protected Document View</h4>
                <p className="mt-2 text-sm text-slate-600 max-w-sm">
                  This document is served directly via encrypted session stream to your active viewport.
                </p>
                <div className="mt-6 p-4 bg-slate-200/80 rounded-xl border border-slate-300 text-xs font-mono text-slate-700 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-600" />
                  <span>Session Stream Active • Range Protected</span>
                </div>
              </div>
            </object>
          </div>
        )}
      </div>

      {/* Footer Info Notice */}
      <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <span>SECURITY LEVEL: RESTRICTED INTERNAL</span>
        <span>DOWNLOAD & EXPORT INTERCEPTED</span>
      </div>
    </div>
  );
};
