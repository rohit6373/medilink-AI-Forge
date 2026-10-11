import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Plus,
  Activity,
  ShieldCheck,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Truck,
  Building2,
  Layers,
} from 'lucide-react';

interface HeroSectionProps {
  onAccessDashboard?: () => void;
  onLaunchLiveDemo?: () => void;
  onOpenOnboarding: () => void;
  onStartSimulation?: () => void;
  onOpenSimulation?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onAccessDashboard,
  onLaunchLiveDemo,
  onOpenOnboarding,
  onStartSimulation,
  onOpenSimulation,
}) => {
  const handleLaunch = onLaunchLiveDemo || onAccessDashboard || (() => {});
  const handleSimulation = onOpenSimulation || onStartSimulation || (() => {});

  return (
    <section id="hero" className="relative bg-[#F9F7F2] text-[#3A3D34] pt-12 pb-20 lg:pt-16 lg:pb-28 overflow-hidden border-b border-[#E5E0D5]">
      {/* Ambient background botanical/geometric texture */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-natural-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#E5E0D5" strokeWidth="0.8" />
              <circle cx="24" cy="24" r="1.2" fill="#DCD7CD" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-natural-grid)" />
        </svg>
      </div>

      {/* Subtle organic warmth glows */}
      <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-[#E8E2D6]/40 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#F1F3EB]/60 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* LEFT COLUMN: Headlines & CTAs */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6">
            {/* Small Real-time Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F1EDE4] border border-[#DCD7CD] text-xs font-semibold text-[#5F8575]"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8C947A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8C947A]"></span>
              </span>
              <span className="tracking-widest uppercase text-[10px] text-[#3A3D34]">Real-Time Regional Medical Mesh</span>
            </motion.div>

            {/* Large Serif Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#3A3D34] leading-[1.12] tracking-tight font-normal"
            >
              Emergency resources,{' '}
              <span className="italic text-[#8C947A] font-serif">
                synchronized in real time.
              </span>
            </motion.h1>

            {/* Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-[#707565] max-w-xl leading-relaxed"
            >
              MediLink connects verified hospitals into a unified coordination mesh. Clinical teams discover live ICU capacity, blood units, specialists, and ambulances to dispatch transfers when every second counts.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3.5 pt-2"
            >
              <button
                onClick={handleLaunch}
                className="flex items-center gap-2.5 bg-[#3A3D34] hover:bg-[#2A2D25] text-[#F9F7F2] font-semibold px-6 py-3.5 rounded-full shadow-sm transition-all cursor-pointer text-xs uppercase tracking-widest"
              >
                <span>Launch Live Command</span>
                <ArrowRight className="w-4 h-4 text-[#8C947A]" />
              </button>

              <button
                onClick={onOpenOnboarding}
                className="flex items-center gap-2 bg-[#F1EDE4] hover:bg-[#E8E2D6] text-[#3A3D34] font-semibold px-5 py-3.5 rounded-full border border-[#DCD7CD] transition-all cursor-pointer text-xs uppercase tracking-wider"
              >
                <Plus className="w-4 h-4 text-[#8C947A]" />
                <span>+ Register Facility</span>
              </button>
            </motion.div>

            {/* Subtext and Quick Simulation Trigger */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[#707565]"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#8C947A]" />
                <span>Certified for clinical operations & emergency dispatchers.</span>
              </div>
              <span className="hidden sm:inline text-[#DCD7CD]">•</span>
              <button
                onClick={handleSimulation}
                className="text-[#C87D55] hover:underline font-semibold flex items-center gap-1 cursor-pointer bg-[#FAF0ED] px-3 py-1 rounded-full border border-[#F0D5CB]"
              >
                <Zap className="w-3.5 h-3.5 text-[#D98C71]" />
                <span>Run Trauma Simulation</span>
              </button>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Natural Tones Command Center Visual Frame */}
          <div className="lg:col-span-6 xl:col-span-6 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative w-full max-w-xl mx-auto"
            >
              {/* Main Command Center Frame */}
              <div className="relative rounded-[36px] bg-white border border-[#E5E2D9] shadow-sm p-6 sm:p-7">
                {/* Header Bar */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E5E0D5]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-[#D98C71]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#D4A373]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#8C947A]"></div>
                    <span className="text-xs font-mono text-[#707565] pl-2 uppercase tracking-wider">
                      MESH_TELEMETRY // LIVE
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#5F8575] bg-[#F1F3EB] px-3 py-1 rounded-full border border-[#D5DDD0] flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C947A] animate-pulse"></span>
                    Synced (5 Facilities)
                  </span>
                </div>

                {/* Simulated Emergency Request Card */}
                <div className="bg-[#FAF0ED] border border-[#F0D5CB] rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#C87D55] flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#D98C71]" />
                      Active Inbound Trauma
                    </span>
                    <span className="text-[11px] text-[#C87D55] font-mono font-medium">INCIDENT #TR-882</span>
                  </div>
                  <p className="text-xs text-[#3A3D34] mt-1.5 font-medium leading-relaxed">
                    Required: <strong>1 Critical ICU Bed</strong> + <strong>3 units O- Blood</strong> + <strong>Trauma Surgeon</strong> + <strong>ALS Unit</strong>
                  </p>
                </div>

                {/* AI Recommendation Result Card */}
                <div className="bg-[#F1EDE4] border border-[#DCD7CD] rounded-2xl p-5 relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F8575] bg-[#F1F3EB] px-2.5 py-0.5 rounded-full border border-[#D5DDD0]">
                        Top Match // Algorithmic Allocation
                      </span>
                      <h4 className="text-lg font-serif font-bold text-[#3A3D34] mt-1.5">Apex Emergency Hospital</h4>
                      <p className="text-xs text-[#707565] flex items-center gap-2 mt-0.5">
                        <span>Distance: 4.8 km</span>
                        <span>•</span>
                        <span className="text-[#5F8575] font-semibold flex items-center gap-0.5">
                          <Clock className="w-3 h-3 text-[#8C947A]" /> ETA: 10 min
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-serif text-[#3A3D34] leading-none font-bold">
                        94%
                      </div>
                      <span className="text-[10px] text-[#707565] font-medium tracking-wide uppercase">Match Score</span>
                    </div>
                  </div>

                  {/* Resource Match Chips */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3.5 border-t border-[#DCD7CD] text-xs">
                    <div className="flex items-center gap-1.5 text-[#3A3D34]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#8C947A]" />
                      <span>ICU: 8 Beds Available</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#3A3D34]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#8C947A]" />
                      <span>Blood: 12 units O-</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#3A3D34]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#8C947A]" />
                      <span>Trauma Surgeon On-Call</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#3A3D34]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#8C947A]" />
                      <span>ALS Unit En Route</span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-4 pt-3.5 border-t border-[#DCD7CD] flex items-center justify-between">
                    <span className="text-[11px] text-[#707565]">
                      Confidence: <strong className="text-[#3A3D34]">High (Verified 1 min ago)</strong>
                    </span>
                    <button
                      onClick={handleLaunch}
                      className="text-xs bg-[#3A3D34] hover:bg-[#2A2D25] text-white font-semibold px-4 py-1.5 rounded-full transition-colors cursor-pointer uppercase tracking-wider"
                    >
                      Request Resources →
                    </button>
                  </div>
                </div>

                {/* Network Nodes Mini Telemetry */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="bg-[#F9F7F2] border border-[#E5E2D9] rounded-2xl p-2.5">
                    <div className="text-[10px] text-[#8C947A] font-semibold uppercase tracking-wide">CityCare</div>
                    <div className="text-xs font-bold text-[#3A3D34] mt-0.5 font-mono">4 ICU / 11m</div>
                  </div>
                  <div className="bg-[#FAF0ED] border border-[#F0D5CB] rounded-2xl p-2.5">
                    <div className="text-[10px] text-[#C87D55] font-semibold uppercase tracking-wide">Metro Gen</div>
                    <div className="text-xs font-bold text-[#C87D55] mt-0.5 font-mono">0 ICU (Full)</div>
                  </div>
                  <div className="bg-[#F9F7F2] border border-[#E5E2D9] rounded-2xl p-2.5">
                    <div className="text-[10px] text-[#8C947A] font-semibold uppercase tracking-wide">LifeLine</div>
                    <div className="text-xs font-bold text-[#3A3D34] mt-0.5 font-mono">6 ICU / 14m</div>
                  </div>
                </div>
              </div>

              {/* Floating Badge 1: ICU Available */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -left-4 sm:-left-6 bg-white border border-[#E5E2D9] rounded-2xl p-3 shadow-md flex items-center gap-2.5 z-20"
              >
                <div className="w-8 h-8 rounded-full bg-[#F1F3EB] text-[#5F8575] flex items-center justify-center">
                  <HeartPulse className="w-4 h-4 text-[#8C947A]" />
                </div>
                <div>
                  <div className="text-xs font-serif font-bold text-[#3A3D34]">ICU Capacity</div>
                  <div className="text-[10px] text-[#5F8575] font-medium tracking-wide">8 Verified Beds</div>
                </div>
              </motion.div>

              {/* Floating Badge 2: Hospital D */}
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-4 -right-4 sm:-right-6 bg-white border border-[#E5E2D9] rounded-2xl p-3 shadow-md flex items-center gap-2.5 z-20"
              >
                <div className="w-8 h-8 rounded-full bg-[#F1EDE4] text-[#3A3D34] flex items-center justify-center">
                  <Truck className="w-4 h-4 text-[#8C947A]" />
                </div>
                <div>
                  <div className="text-xs font-serif font-bold text-[#3A3D34]">Apex Facility — 10 min</div>
                  <div className="text-[10px] text-[#8C947A] font-medium tracking-wide">94% Feasibility Score</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const WaveDivider: React.FC<{ flip?: boolean; color?: string }> = ({
  flip = false,
  color = '#F9F7F2',
}) => {
  return (
    <div
      className={`w-full overflow-hidden leading-none -mt-1 ${flip ? 'rotate-180' : ''}`}
      style={{ color }}
    >
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="relative block w-full h-8 sm:h-12"
        fill="currentColor"
      >
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
      </svg>
    </div>
  );
};
