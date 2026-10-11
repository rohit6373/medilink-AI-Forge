import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, LogIn, Building2, KeyRound, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import { useMediLink } from '../../context/MediLinkContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { hospitals, switchHospital } = useMediLink();
  const [hospitalCode, setHospitalCode] = useState('HOSP-1001');
  const [email, setEmail] = useState('admin@citycare.org');
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = hospitals.find(
      (h) =>
        h.hospitalIdCode.toLowerCase() === hospitalCode.trim().toLowerCase() ||
        h.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (matched) {
      switchHospital(matched.id);
      onClose();
      onSuccess();
    } else {
      // Default to first hospital if code doesn't match
      switchHospital(hospitals[0].id);
      onClose();
      onSuccess();
    }
  };

  const handleDemoLogin = (hospitalId: string) => {
    switchHospital(hospitalId);
    onClose();
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#1A2233] text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3E8FC4] to-[#3BC9C4] p-0.5">
              <div className="w-full h-full bg-[#1A2233] rounded-[10px] flex items-center justify-center">
                <LogIn className="w-5 h-5 text-[#3BC9C4]" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold">Hospital Network Login</h3>
              <p className="text-xs text-slate-400">Authorized Clinical & Dispatch Personnel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hospital ID / Code</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={hospitalCode}
                  onChange={(e) => setHospitalCode(e.target.value)}
                  placeholder="e.g. HOSP-1001"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-mono text-slate-800 focus:outline-none focus:border-[#3BC9C4]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hospital.org"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#3BC9C4]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#3BC9C4]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-[#3E8FC4]" />
                <span>Remember session</span>
              </label>
              <span className="text-[#3E8FC4] hover:underline cursor-pointer">Reset Password</span>
            </div>

            <button
              type="submit"
              className="w-full bg-[#3E8FC4] hover:bg-[#327cae] text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <span>Authenticate & Enter Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Demo Logins */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Quick 1-Click Demo Profiles
              </span>
              <span className="text-[10px] text-slate-400">Instant login</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {hospitals.slice(0, 4).map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => handleDemoLogin(h.id)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800">{h.name}</span>
                    <div className="text-[10px] text-slate-500">
                      ID: {h.hospitalIdCode} • {h.type}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#3E8FC4] hover:underline">
                    Login →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
