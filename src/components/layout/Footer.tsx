import React, { useState } from 'react';
import { Network, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onOpenOnboarding: () => void;
  onOpenLogin?: () => void;
  onNavigateDashboard?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenOnboarding,
  onOpenLogin,
  onNavigateDashboard,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#3A3D34] text-[#F9F7F2] relative border-t border-[#4A4E43]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-16 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-[#4A4E43]">
          {/* Col 1: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#8C947A] text-[#F9F7F2]">
                <Network className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#F9F7F2] italic">
                MediLink
              </span>
            </div>

            <p className="text-sm text-[#DCD7CD] max-w-sm leading-relaxed">
              Real-time inter-hospital emergency resource coordination network enabling certified clinical teams to discover, request, reserve, and allocate critical assets when minutes matter.
            </p>

            <div className="flex items-center gap-2 pt-2 text-xs text-[#8C947A] bg-[#2A2D25] border border-[#4A4E43] px-3.5 py-1.5 rounded-full w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8C947A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8C947A]"></span>
              </span>
              <span className="font-medium text-[#F9F7F2]">Network Telemetry: Operational (5 Verified Nodes)</span>
            </div>
          </div>

          {/* Col 2: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#8C947A] font-semibold">Platform</h4>
            <ul className="space-y-2 text-sm text-[#DCD7CD]">
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  Protocol Workflow
                </a>
              </li>
              <li>
                <a href="#emergency-matching" className="hover:text-white transition-colors">
                  Emergency Matching
                </a>
              </li>
              <li>
                <a href="#resources" className="hover:text-white transition-colors">
                  Reservation Locks
                </a>
              </li>
              <li>
                <a href="#network-map" className="hover:text-white transition-colors">
                  Topology Map
                </a>
              </li>
              <li>
                <a href="#simulation" className="hover:text-white transition-colors">
                  Interactive Simulation
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Hospitals */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#8C947A] font-semibold">Coordination</h4>
            <ul className="space-y-2 text-sm text-[#DCD7CD]">
              <li>
                <button
                  onClick={onOpenOnboarding}
                  className="hover:text-[#8C947A] font-semibold transition-colors cursor-pointer text-left flex items-center gap-1 text-[#8C947A]"
                >
                  <span>+ Register Facility</span>
                </button>
              </li>
              {onOpenLogin && (
                <li>
                  <button
                    onClick={onOpenLogin}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Hospital Login
                  </button>
                </li>
              )}
              {onNavigateDashboard && (
                <li>
                  <button
                    onClick={onNavigateDashboard}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Command Dashboard
                  </button>
                </li>
              )}
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Regional Integration Desk
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#8C947A] font-semibold">Network Bulletin</h4>
            <p className="text-xs text-[#DCD7CD] leading-relaxed">
              Subscribe to regional protocol updates and telemetry specifications.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="hospital.admin@med.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#2A2D25] border border-[#4A4E43] rounded-full py-2.5 pl-4 pr-10 text-xs text-[#F9F7F2] placeholder-[#8A8D82] focus:outline-none focus:border-[#8C947A]"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#8C947A] hover:bg-[#7D856B] text-white px-3 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                  title="Subscribe"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              {subscribed && (
                <p className="text-xs text-[#8C947A] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Subscribed successfully!
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Clinical Disclaimer Banner */}
        <div className="mt-8 p-6 rounded-[28px] bg-[#2A2D25] border border-[#4A4E43] text-xs text-[#DCD7CD] flex items-start gap-3.5">
          <ShieldCheck className="w-5 h-5 text-[#8C947A] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#F9F7F2]">Clinical Decision Support Notice:</strong> MediLink provides real-time resource visibility, operational matching, and logistics coordination for authorized healthcare personnel. Final admission, triage categorization, transfer authorization, and medical treatment decisions remain the sole responsibility of licensed attending physicians and qualified medical authorities.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-[#4A4E43] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A8D82]">
          <p>© 2026 MediLink. Emergency Resource Coordination Network. Natural Tones Architecture.</p>
          <div className="flex items-center gap-6">
            <a href="#contact" className="hover:text-[#DCD7CD] transition-colors">
              Privacy Protocol
            </a>
            <a href="#contact" className="hover:text-[#DCD7CD] transition-colors">
              Terms of Coordination
            </a>
            <a href="#contact" className="hover:text-[#DCD7CD] transition-colors">
              Security Compliance
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
