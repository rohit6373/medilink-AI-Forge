import React, { useState, useEffect } from 'react';
import { Network, Plus, LogIn, Menu, X, Activity, Flame } from 'lucide-react';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenOnboarding: () => void;
  onOpenSimulation?: () => void;
  onNavigateDashboard: () => void;
  isLoggedIn?: boolean;
  activeHospitalName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLogin,
  onOpenOnboarding,
  onOpenSimulation,
  onNavigateDashboard,
  isLoggedIn = false,
  activeHospitalName = 'CityCare Hospital',
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Overview', href: '#hero' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Matching Engine', href: '#emergency-matching' },
    { name: 'Network Map', href: '#network-map' },
    { name: 'Simulation', href: '#simulation' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#F9F7F2]/95 backdrop-blur-md shadow-sm border-b border-[#E5E0D5]'
          : 'bg-[#F9F7F2] border-b border-[#E5E0D5]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Wordmark */}
        <a href="#hero" className="flex items-center gap-3.5 group cursor-pointer">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#8C947A] text-[#F9F7F2] shadow-sm group-hover:scale-105 transition-transform">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#3A3D34] italic">
                MediLink
              </span>
              <span className="bg-[#F1EDE4] text-[#8C947A] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#DCD7CD] uppercase tracking-wider">
                Network
              </span>
            </div>
            <p className="text-[11px] text-[#8C947A] font-medium tracking-wide uppercase">
              Emergency Resource Coordination
            </p>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs font-semibold uppercase tracking-wider text-[#707565] hover:text-[#3A3D34] hover:bg-[#F1EDE4] px-4 py-2 rounded-full transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          {onOpenSimulation && (
            <button
              onClick={onOpenSimulation}
              className="text-xs font-semibold uppercase tracking-wider text-[#C87D55] bg-[#FAF0ED] hover:bg-[#F5E5DF] px-3.5 py-2 rounded-full border border-[#F0D5CB] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-[#D98C71]" />
              <span>Simulation</span>
            </button>
          )}

          {isLoggedIn ? (
            <button
              onClick={onNavigateDashboard}
              className="flex items-center gap-2 bg-[#8C947A] hover:bg-[#7D856B] text-white font-semibold text-xs uppercase tracking-wider px-4 py-2.5 rounded-full shadow-sm transition-all cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Command Center</span>
              <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-mono">
                {activeHospitalName.split(' ')[0]}
              </span>
            </button>
          ) : (
            <>
              <button
                onClick={onOpenLogin}
                className="text-xs font-semibold uppercase tracking-wider text-[#3A3D34] hover:bg-[#E8E2D6] bg-[#F1EDE4] px-4 py-2.5 rounded-full border border-[#DCD7CD] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#8C947A]" />
                <span>Login</span>
              </button>

              <button
                onClick={onNavigateDashboard}
                className="text-xs font-semibold uppercase tracking-wider text-white bg-[#8C947A] hover:bg-[#7D856B] px-4 py-2.5 rounded-full shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Command Center</span>
              </button>
            </>
          )}

          <button
            onClick={onOpenOnboarding}
            className="flex items-center gap-1.5 bg-[#3A3D34] hover:bg-[#2A2D25] text-[#F9F7F2] font-semibold text-xs uppercase tracking-widest px-5 py-2.5 rounded-full shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Hospital</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onOpenOnboarding}
            className="p-2 rounded-full bg-[#3A3D34] text-white font-bold"
            title="Add Your Hospital"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#3A3D34] hover:bg-[#F1EDE4] rounded-full"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#F9F7F2] border-b border-[#E5E0D5] px-6 pt-3 pb-6 space-y-4">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#707565] hover:text-[#3A3D34] hover:bg-[#F1EDE4] px-4 py-2.5 rounded-2xl text-sm font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E5E0D5] flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateDashboard();
              }}
              className="w-full py-3 px-4 rounded-full bg-[#8C947A] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Activity className="w-4 h-4" />
              <span>Access Command Center</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenOnboarding();
              }}
              className="w-full py-3 px-4 rounded-full bg-[#3A3D34] text-white font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your Hospital</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="w-full py-2.5 px-4 rounded-full bg-[#F1EDE4] text-[#3A3D34] hover:bg-[#E8E2D6] font-medium text-xs uppercase tracking-wider border border-[#DCD7CD] flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-[#8C947A]" />
              <span>Hospital Login</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
