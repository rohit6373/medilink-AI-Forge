import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';

export const ApiKeyNoticeBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return null;
  }

  return (
    <div className="bg-[#F1F3EB] border border-[#D9E2D5] rounded-2xl p-3 text-xs text-[#5F8575] flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#5F8575] shrink-0" />
        <span>
          <strong className="font-semibold">MediLink Autonomous Network:</strong> Real-time corridor telemetry, high-precision facility positioning, and automated dispatch active.
        </span>
      </div>
      <span className="text-[10px] font-mono bg-white text-[#5F8575] px-2.5 py-0.5 rounded-full border border-[#D9E2D5] font-semibold flex items-center gap-1">
        <Activity className="w-2.5 h-2.5 animate-pulse" />
        Mesh Synchronized
      </span>
    </div>
  );
};
