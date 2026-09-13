import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Lock,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { WatermarkOverlay } from './WatermarkOverlay';
import { useAuth } from '../../context/AuthContext';

interface VideoPlayerProps {
  contentId: string;
  title: string;
  onEnded?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ contentId, title, onEnded }) => {
  const { sessionToken } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Protected authenticated range stream endpoint
  const streamUrl = `/api/content/${contentId}/stream${sessionToken ? `?token=${encodeURIComponent(sessionToken)}` : ''}`;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((err) => {
        console.warn('Playback request error:', err);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
    if (!nextMuted && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Fullscreen request failed:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const changePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate;
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    }
  };

  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setControlsVisible(false);
      }
    }, 3000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        skipTime(5);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        skipTime(-5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, duration, volume, isMuted, isFullscreen]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setControlsVisible(false)}
      className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl select-none group"
    >
      {/* Subtle Deterrent Watermark Overlay */}
      <WatermarkOverlay opacity={0.14} />

      {/* HTML5 Video Element with Native Range Support */}
      <video
        ref={videoRef}
        src={streamUrl}
        preload="metadata"
        playsInline
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={() => {
          if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
            setIsLoading(false);
          }
        }}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
        onError={() => {
          setIsLoading(false);
          setError('Failed to securely stream protected video. Session may be expired or asset unavailable.');
        }}
      />

      {/* Security Status Badge (Top Right) */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-xs font-medium text-cyan-300 pointer-events-none shadow-lg">
        <Lock className="w-3.5 h-3.5 text-cyan-400" />
        <span>Encrypted Stream • Range Protected</span>
      </div>

      {/* Loading Spinner */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-xs z-20 pointer-events-none">
          <div className="w-12 h-12 border-3 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          <p className="mt-3 text-xs font-mono text-cyan-200 tracking-wider">CONNECTING ENCLAVE STREAM...</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-20 p-6 text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mb-3" />
          <h4 className="text-base font-semibold text-white">Playback Interrupted</h4>
          <p className="mt-1 text-sm text-slate-400 max-w-md">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              videoRef.current?.load();
            }}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg border border-slate-700 transition-colors"
          >
            Retry Protected Connection
          </button>
        </div>
      )}

      {/* Custom Player Controls Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent p-4 transition-opacity duration-300 z-30 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress / Seek Bar */}
        <div className="relative mb-3 flex items-center group/scrub">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:h-2 transition-all focus:outline-hidden"
          />
        </div>

        {/* Buttons and Timeline */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={togglePlay}
              className="p-2 text-white hover:text-cyan-400 rounded-lg hover:bg-white/10 transition-colors"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button
              onClick={() => skipTime(-10)}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors hidden sm:block"
              title="Skip back 10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => skipTime(10)}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors hidden sm:block"
              title="Skip ahead 10s"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-1 group/vol">
              <button
                onClick={toggleMute}
                className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-hidden"
              />
            </div>

            {/* Timestamps */}
            <div className="text-xs font-mono text-slate-300 flex items-center gap-1.5 ml-2">
              <Clock className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              <span>{formatTime(currentTime)}</span>
              <span className="text-slate-500">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Playback Speed */}
            <button
              onClick={changePlaybackRate}
              className="px-2 py-1 text-xs font-mono font-medium text-slate-300 hover:text-white rounded bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors"
              title="Change Speed"
            >
              {playbackRate}x
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
