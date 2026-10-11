import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle2, XCircle, Clock, ShieldAlert, HeartCrack, Truck, Sparkles } from 'lucide-react';
import { EmergencyRequest } from '../../types';

interface IncomingAlertModalProps {
  request: EmergencyRequest | null;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onClose: () => void;
}

export const IncomingAlertModal: React.FC<IncomingAlertModalProps> = ({
  request,
  onAccept,
  onReject,
  onClose,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  useEffect(() => {
    if (!request) return;
    setSecondsRemaining(60);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [request]);

  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border-2 border-rose-500 overflow-hidden"
      >
        {/* Pulsing Emergency Header */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center animate-bounce">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-rose-200">
                CRITICAL INCOMING DISPATCH ALERT
              </span>
              <h3 className="text-xl font-black">
                {request.emergencyType.toUpperCase()} EMERGENCY — {request.urgency.toUpperCase()}
              </h3>
            </div>
          </div>

          <div className="bg-black/30 px-3 py-1.5 rounded-xl border border-white/20 text-center">
            <div className="text-[10px] text-rose-200 uppercase font-mono">Auto-Expire</div>
            <div className="text-lg font-mono font-bold">{secondsRemaining}s</div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-slate-800">
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-rose-800 font-bold uppercase">From Requesting Facility:</span>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">{request.requestingHospitalName}</div>
              <div className="text-xs text-slate-600">Patient: {request.patientSummary || 'Critical Transfer'} {request.notes ? `• Notes: ${request.notes}` : ''}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Ambulance ETA</div>
              <div className="text-xl font-extrabold text-rose-600 font-mono">
                {request.etaMinutes || 12} min
              </div>
            </div>
          </div>

          {/* Requested Resources Checklist */}
          <div>
            <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Requested Assets to Lock & Reserve:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {request.requiredResources.map((res, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#3BC9C4]" />
                  <span>
                    {res.quantity}x {res.resourceType.toUpperCase().replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Suitability Notice */}
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-teal-900">
            <Sparkles className="w-4 h-4 text-[#3BC9C4] shrink-0 mt-0.5" />
            <p>
              <strong>AI Match Recommendation:</strong> Your hospital has confirmed availability for all requested assets with high confidence. Accepting this request will lock these resources for 15 minutes.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={() => onReject(request.id)}
              className="py-3.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4 text-rose-500" />
              <span>Decline Request</span>
            </button>

            <button
              onClick={() => onAccept(request.id)}
              className="py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-700/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>ACCEPT & RESERVE ASSETS</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
