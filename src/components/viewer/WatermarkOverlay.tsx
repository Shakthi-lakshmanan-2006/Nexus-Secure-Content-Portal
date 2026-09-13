import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

interface WatermarkOverlayProps {
  opacity?: number;
  className?: string;
}

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({
  opacity = 0.12,
  className = '',
}) => {
  const { user } = useAuth();
  const userIdentifier = user?.email || 'authenticated-user@nexus.internal';
  const timestamp = new Date().toISOString().split('T')[0];

  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden z-20 flex flex-col justify-between p-6 ${className}`}
      style={{ opacity }}
    >
      {/* Top watermark watermark */}
      <div className="flex justify-between items-center text-[11px] font-mono tracking-wider uppercase text-slate-300">
        <div className="flex items-center gap-1.5 bg-slate-950/40 px-2.5 py-1 rounded backdrop-blur-xs border border-white/5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>NEXUS SECURE VAULT</span>
        </div>
        <div className="bg-slate-950/40 px-2.5 py-1 rounded backdrop-blur-xs border border-white/5">
          ID: {userIdentifier}
        </div>
      </div>

      {/* Center diagonal repeating watermark */}
      <div className="absolute inset-0 flex items-center justify-center -rotate-12 pointer-events-none">
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-widest text-slate-100 uppercase">
            NEXUS RESTRICTED ACCESS
          </div>
          <div className="text-xs sm:text-sm font-mono tracking-wider text-slate-300 mt-1">
            LICENSED TO {userIdentifier} • {timestamp}
          </div>
        </div>
      </div>

      {/* Bottom watermark */}
      <div className="flex justify-between items-center text-[10px] font-mono tracking-wider uppercase text-slate-400">
        <div>CONFIDENTIAL • INTERNAL USE ONLY</div>
        <div>AUTHORIZED CLIENT SESSION</div>
      </div>
    </div>
  );
};
