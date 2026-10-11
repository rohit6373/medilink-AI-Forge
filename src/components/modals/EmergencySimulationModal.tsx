import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Play,
  RotateCcw,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Building2,
  Truck,
  HeartPulse,
} from 'lucide-react';
import { useMediLink } from '../../context/MediLinkContext';
import { EmergencyRouteMap } from '../maps/EmergencyRouteMap';

interface EmergencySimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencySimulationModal: React.FC<EmergencySimulationModalProps> = ({ isOpen, onClose }) => {
  const { runSimulationScenario, activeSimulationStep, isSimulating, resetDataToDemo, hospitals } = useMediLink();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const cityCare = hospitals.find((h) => h.id === 'hosp-1') || hospitals[0];
  const apex = hospitals.find((h) => h.id === 'hosp-4') || hospitals[3] || hospitals[0];
  const lifeline = hospitals.find((h) => h.id === 'hosp-3') || hospitals[2] || hospitals[0];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStep < 5) {
      timer = setTimeout(() => {
        handleNextStep();
      }, 4500);
    } else if (currentStep >= 5) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep]);

  if (!isOpen) return null;

  const handleNextStep = () => {
    if (currentStep < 5) {
      const next = currentStep + 1;
      setCurrentStep(next);
      runSimulationScenario(next);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(1);
    resetDataToDemo();
  };

  const steps = [
    {
      num: 1,
      title: 'Incident Occurrence & Dispatch',
      desc: 'Multi-vehicle collision on Highway 101. CityCare Hospital triage receives 3 critical trauma victims and broadcasts an emergency asset request for 1 ICU Bed + 2 units O- Blood + Trauma Surgeon.',
      status: 'DISPATCHED',
      badgeColor: 'bg-rose-500',
    },
    {
      num: 2,
      title: 'AI Multi-Hospital Evaluation',
      desc: 'MediLink continuously calculates availability, clinical suitability, and real-time transit ETA across all 5 verified facilities. Apex Emergency ranks #1 (94% Match score, 10 min ETA).',
      status: 'MATCH COMPUTED (94%)',
      badgeColor: 'bg-[#3BC9C4]',
    },
    {
      num: 3,
      title: 'One-Click Acceptance & Lock',
      desc: 'Apex Emergency accepts the transfer. MediLink locks 1 ICU Bed + 2 units O- Blood into RESERVED status with an active 15:00 countdown timer, preventing race conditions.',
      status: 'RESOURCES RESERVED',
      badgeColor: 'bg-amber-500',
    },
    {
      num: 4,
      title: 'Dynamic Cascade Re-routing',
      desc: 'A secondary acute cardiac emergency occurs in the area. Because Apex is now near capacity, MediLink automatically recalculates and seamlessly routes the new cardiac request to LifeLine Medical!',
      status: 'DYNAMIC RE-ROUTE',
      badgeColor: 'bg-indigo-500',
    },
    {
      num: 5,
      title: 'Transfer Completion & Handoff',
      desc: 'Ambulance arrives at Apex Emergency. The reserved ICU bed transitions cleanly to OCCUPIED. Complete audit trail logged to compliance ledger.',
      status: 'TRANSIT COMPLETE',
      badgeColor: 'bg-emerald-500',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 text-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-slate-950 px-6 sm:px-8 py-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white">Live Emergency Simulation Mode</h3>
                <span className="text-[10px] font-mono bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800 font-bold">
                  HACKATHON DEMO
                </span>
              </div>
              <p className="text-xs text-slate-400">Step {currentStep} of 5 — Full Lifecycle Inter-Hospital Coordination</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Pills */}
        <div className="px-6 sm:px-8 py-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          {steps.map((st) => (
            <button
              key={st.num}
              onClick={() => {
                setCurrentStep(st.num);
                runSimulationScenario(st.num);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentStep === st.num
                  ? 'bg-[#3E8FC4] text-white shadow-md'
                  : currentStep > st.num
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800/60 text-slate-400'
              }`}
            >
              <span>{st.num}</span>
              <span className="hidden sm:inline">{st.status}</span>
            </button>
          ))}
        </div>

        {/* Active Step Showcase Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase text-[#3BC9C4] tracking-wider">
                  Scenario Phase {currentStep}
                </span>
                <h4 className="text-2xl font-bold text-white mt-1">{steps[currentStep - 1].title}</h4>
              </div>
              <span className={`text-xs font-bold text-white px-3 py-1 rounded-full ${steps[currentStep - 1].badgeColor}`}>
                {steps[currentStep - 1].status}
              </span>
            </div>

            <p className="text-sm text-slate-300 mt-4 leading-relaxed">
              {steps[currentStep - 1].desc}
            </p>

            {/* Interactive Visual State Changes per step */}
            {currentStep === 1 && (
              <div className="mt-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <div>
                    <strong className="text-white">Active Alert Broadcast:</strong> CityCare Hospital requesting 1 ICU Bed + 2U O- Blood.
                  </div>
                </div>
                <span className="font-mono text-rose-300">Searching Network...</span>
              </div>
            )}

            {currentStep === 2 && (
              <div className="mt-6 p-4 rounded-xl bg-teal-950/40 border border-[#3BC9C4]/40 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#3BC9C4] font-bold">★ AI Match Engine Ranking</span>
                  <span className="font-mono text-emerald-400 font-bold">Score: 94%</span>
                </div>
                <div className="text-slate-300">
                  Apex Emergency Hospital: 8 ICU Beds • 12U O- Blood • Trauma Team Active • 10m ETA.
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="mt-6 p-4 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Apex Emergency: ICU Bed & Blood Locked into RESERVED status</span>
                </div>
                <span className="font-mono font-bold text-amber-400 bg-black/40 px-2 py-1 rounded">
                  Lock Expiry: 14:59
                </span>
              </div>
            )}

            {currentStep === 4 && (
              <div className="mt-6 p-4 rounded-xl bg-indigo-950/40 border border-indigo-700/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-300 font-bold">Dynamic Multi-Hospital Recalculation</span>
                  <span className="text-amber-400 font-bold">Apex at 90% Capacity</span>
                </div>
                <div className="text-slate-300">
                  New cardiac event automatically routed to <strong>LifeLine Medical (88% Match)</strong> without human intervention delays.
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="mt-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Handoff Verified: Bed marked OCCUPIED • Ambulance returned to Standby</span>
                </div>
                <span className="text-slate-400 font-mono">Telemetry OK</span>
              </div>
            )}

            {/* Live Map Route Visualizer for Simulation */}
            <div className="mt-6 pt-4 border-t border-slate-700/60">
              <div className="text-xs font-bold text-slate-300 mb-3 flex items-center justify-between">
                <span>Live Emergency Corridor & Coordination View:</span>
                <span className="text-[#3BC9C4] font-mono text-[11px]">
                  {currentStep === 4 ? 'Dynamic Re-route: LifeLine Medical' : 'Target: Apex Emergency Hospital'}
                </span>
              </div>
              <EmergencyRouteMap
                originHospital={cityCare}
                destinationHospital={currentStep === 4 ? lifeline : apex}
                emergencyType={currentStep === 4 ? 'Secondary Acute Cardiac' : 'Multi-Trauma MVC Incident'}
                urgency="critical"
                ambulance={{
                  vehicleNumber: currentStep === 4 ? 'MED-AMB-202' : 'MED-CC-101',
                  type: 'Advanced Life Support (ALS)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer Navigation Controls */}
        <div className="bg-slate-950 px-6 sm:px-8 py-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo State</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <Play className={`w-3.5 h-3.5 ${isPlaying ? 'text-amber-400' : 'text-emerald-400'}`} />
              <span>{isPlaying ? 'Pause Auto-Play' : 'Auto-Play Scenario'}</span>
            </button>

            {currentStep < 5 ? (
              <button
                onClick={handleNextStep}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#3E8FC4] to-[#3BC9C4] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <span>Advance to Step {currentStep + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Close Simulation
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
