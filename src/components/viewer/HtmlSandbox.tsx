import React, { useState, useEffect, useRef } from 'react';
import {
  Code2,
  Shield,
  Maximize2,
  Minimize2,
  RotateCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { WatermarkOverlay } from './WatermarkOverlay';
import { useAuth } from '../../context/AuthContext';

interface HtmlSandboxProps {
  contentId: string;
  title: string;
}

export const HtmlSandbox: React.FC<HtmlSandboxProps> = ({ contentId, title }) => {
  const { sessionToken } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authenticated sanitized HTML endpoint
  const htmlEndpoint = `/api/content/${contentId}/html${sessionToken ? `?token=${encodeURIComponent(sessionToken)}` : ''}`;

  const handleReload = () => {
    setIsLoading(true);
    setError(null);
    if (iframeRef.current) {
      const separator = htmlEndpoint.includes('?') ? '&' : '?';
      iframeRef.current.src = `${htmlEndpoint}${separator}t=${Date.now()}`;
    }
  };

  return (
    <div
      className={`relative flex flex-col w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'min-h-[700px]'
      }`}
    >
      {/* Sandbox Enclave Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight line-clamp-1">{title}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Shield className="w-3 h-3" /> DOMPurify Sanitized
              </span>
              <span>•</span>
              <span className="font-mono text-cyan-400">sandbox=&quot;allow-same-origin&quot;</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReload}
            className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition-colors"
            title="Reload Sandbox Frame"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Security Isolation Notice Banner */}
      <div className="bg-cyan-950/30 border-b border-cyan-900/40 px-4 py-2 flex items-center justify-between text-xs text-cyan-300/90">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Restricted Sandbox Enclave Active. Scripts, popups, and parent window DOM execution blocked.</span>
        </div>
        <span className="font-mono text-[10px] text-cyan-400/70 hidden sm:inline">CSP: default-src &apos;self&apos;</span>
      </div>

      {/* Presentation Stage */}
      <div className="relative flex-1 bg-slate-950 flex flex-col">
        {/* Subtle Watermark Overlay */}
        <WatermarkOverlay opacity={0.08} />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 z-20">
            <div className="w-10 h-10 border-3 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
            <p className="mt-3 text-xs font-mono text-cyan-200">SANITIZING & RENDERING HTML ENCLAVE...</p>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-20 p-6 text-center">
            <AlertCircle className="w-12 h-12 text-rose-400 mb-3" />
            <h4 className="text-base font-semibold text-white">Sandbox Initialization Failed</h4>
            <p className="mt-1 text-sm text-slate-400 leading-relaxed">{error}</p>
          </div>
        )}

        {/* The Sandboxed IFrame with strict isolate configuration */}
        <iframe
          ref={iframeRef}
          src={htmlEndpoint}
          title={title}
          sandbox="allow-same-origin"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError('Failed to fetch and sanitize remote HTML document.');
          }}
          className="w-full flex-1 min-h-[600px] border-none bg-transparent"
        />
      </div>
    </div>
  );
};
