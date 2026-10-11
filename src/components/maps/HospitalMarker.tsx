import React from 'react';
import { Hospital } from '../../types';
import { Building2, ShieldCheck, Clock, CheckCircle2, AlertTriangle, Sparkles, Navigation } from 'lucide-react';

export type MarkerVariant = 'verified' | 'pending' | 'recommended' | 'selected' | 'requesting' | 'user';

export interface HospitalMarkerProps {
  hospital: Hospital;
  variant?: MarkerVariant;
  matchScore?: number;
  etaMinutes?: number;
  isSelected?: boolean;
  isRecommended?: boolean;
  isRequesting?: boolean;
  onClick?: () => void;
}

export const HospitalMarkerContent: React.FC<{
  hospital: Hospital;
  variant?: MarkerVariant;
  matchScore?: number;
  etaMinutes?: number;
  isSelected?: boolean;
  isRecommended?: boolean;
  isRequesting?: boolean;
}> = ({
  hospital,
  matchScore,
  etaMinutes,
  isSelected,
  isRecommended,
  isRequesting,
}) => {
  const isVerified = hospital.verificationStatus === 'verified';
  const icuAvailable = hospital.resources.find((r) => r.type === 'icu')?.availableQuantity ?? 0;

  let pinBg = 'bg-[#3A3D34] text-[#F9F7F2] border-[#2A2D25]';
  let badge = null;

  if (isRequesting) {
    pinBg = 'bg-[#D98C71] text-white border-white ring-4 ring-[#D98C71]/40 animate-bounce';
    badge = (
      <span className="bg-[#B05C42] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
        INCIDENT
      </span>
    );
  } else if (isRecommended) {
    pinBg = 'bg-[#5F8575] text-white border-white ring-4 ring-[#5F8575]/40 shadow-lg';
    badge = (
      <span className="bg-[#3A3D34] text-[#F9F7F2] text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
        <Sparkles className="w-2.5 h-2.5 text-[#8C947A]" />
        {matchScore ? `${matchScore}%` : 'TOP MATCH'}
      </span>
    );
  } else if (isSelected) {
    pinBg = 'bg-[#8C947A] text-white border-[#F9F7F2] ring-4 ring-[#8C947A]/30 scale-105';
  } else if (isVerified) {
    pinBg = 'bg-[#3A3D34] text-[#F9F7F2] border-[#8C947A] hover:bg-[#2A2D25]';
  } else {
    pinBg = 'bg-[#B07D38] text-white border-[#8D642D]';
  }

  return (
    <div className="relative group cursor-pointer select-none transition-transform hover:scale-110">
      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl border-2 shadow-md ${pinBg} transition-all`}>
        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          {isRequesting ? (
            <AlertTriangle className="w-3 h-3 text-white" />
          ) : isVerified ? (
            <ShieldCheck className="w-3 h-3 text-[#8C947A]" />
          ) : (
            <Clock className="w-3 h-3 text-white" />
          )}
        </div>

        <div className="flex flex-col text-left pr-0.5">
          <div className="flex items-center gap-1">
            <span className="font-serif font-bold text-xs leading-none max-w-[110px] truncate">
              {hospital.name.split(' ')[0]}
            </span>
            {badge}
          </div>
          <span className="text-[10px] opacity-85 leading-tight mt-0.5">
            {icuAvailable} ICU • {etaMinutes ? `${etaMinutes}m ETA` : hospital.type.split(' ')[0]}
          </span>
        </div>
      </div>
      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#3A3D34] mx-auto -mt-0.5" />
    </div>
  );
};

export const HospitalMarker: React.FC<HospitalMarkerProps> = (props) => {
  const { onClick } = props;
  return (
    <div onClick={onClick} className="cursor-pointer">
      <HospitalMarkerContent {...props} />
    </div>
  );
};

export const UserGpsMarker: React.FC<{ latitude: number; longitude: number; label?: string }> = ({
  label = 'Your Location',
}) => {
  return (
    <div className="relative group cursor-pointer select-none">
      <div className="relative flex items-center justify-center">
        <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-sky-400 opacity-60"></span>
        <div className="w-5 h-5 rounded-full bg-sky-500 border-2 border-white shadow-lg flex items-center justify-center text-white">
          <Navigation className="w-2.5 h-2.5" />
        </div>
      </div>
      <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-[#3A3D34] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow whitespace-nowrap">
        {label}
      </div>
    </div>
  );
};
