import React from 'react';
import { Activity, ShieldCheck, HelpCircle, PhoneCall, LogIn } from 'lucide-react';

interface UtilityBarProps {
  onOpenSimulation: () => void;
}

export const UtilityBar: React.FC<UtilityBarProps> = ({ onOpenSimulation }) => {
  return (
    <div className="bg-[#F1EDE4] text-[#3A3D34] text-xs py-2 px-4 sm:px-8 border-b border-[#E5E0D5]">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left Status */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8C947A] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8C947A]"></span>
          </span>
          <span className="font-semibold text-[#3A3D34]">Emergency Coordination Network</span>
          <span className="hidden sm:inline-block text-[#DCD7CD]">|</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[#5F8575] font-medium">
            <Activity className="w-3.5 h-3.5" />
            Operational Telemetry (24/7 Mesh Active)
          </span>
        </div>

        {/* Right Links */}
        <div className="flex items-center gap-4 sm:gap-6 text-[#707565]">
          <a
            href="#contact"
            className="hover:text-[#3A3D34] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <PhoneCall className="w-3 h-3 text-[#8C947A]" />
            <span>Hospital Support</span>
          </a>

          <a
            href="#network-map"
            className="hover:text-[#3A3D34] transition-colors hidden md:flex items-center gap-1"
          >
            <ShieldCheck className="w-3 h-3 text-[#8C947A]" />
            <span>Network Status</span>
          </a>

          <button
            onClick={onOpenSimulation}
            className="flex items-center gap-1 text-[#3A3D34] hover:bg-[#E8E2D6] font-medium transition-colors cursor-pointer bg-white px-2.5 py-0.5 rounded-full border border-[#DCD7CD]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D98C71]"></span>
            <span>Simulate Emergency</span>
          </button>
        </div>
      </div>
    </div>
  );
};
