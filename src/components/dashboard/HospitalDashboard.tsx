import React, { useState } from 'react';
import {
  Layers,
  Send,
  Inbox,
  Clock,
  Users,
  Truck,
  MapPin,
  Sparkles,
  BarChart3,
  FileText,
  Building2,
  Settings,
  Flame,
  LogOut,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Search,
  Globe,
} from 'lucide-react';
import { useMediLink } from '../../context/MediLinkContext';
import { ResourceManagementView } from './ResourceManagementView';
import { EmergencyRequestView } from './EmergencyRequestView';
import { IncomingRequestsView, OutgoingRequestsView, ReservationsView } from './IncomingRequestsView';
import { SpecialistsView, AmbulancesView, NetworkMapView } from './SpecialistsView';
import { AiAssistantView } from './AiAssistantView';
import { AnalyticsView, AuditLogsView, HospitalProfileView, HospitalSettingsView } from './AnalyticsView';
import { HealthcareSearchView } from '../search/HealthcareSearchView';
import { VerificationBadge } from '../common/StatusBadge';

type DashboardTab =
  | 'resources'
  | 'create_request'
  | 'incoming_requests'
  | 'outgoing_requests'
  | 'reservations'
  | 'specialists'
  | 'ambulances'
  | 'network_map'
  | 'healthcare_search'
  | 'ai_assistant'
  | 'analytics'
  | 'audit_logs'
  | 'profile'
  | 'settings';

interface HospitalDashboardProps {
  onBackToLanding: () => void;
  onOpenSimulation: () => void;
  onOpenOnboarding: () => void;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({
  onBackToLanding,
  onOpenSimulation,
  onOpenOnboarding,
}) => {
  const {
    hospitals,
    currentHospital,
    switchHospital,
    requests,
    reservations,
  } = useMediLink();

  const [activeTab, setActiveTab] = useState<DashboardTab>('resources');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [hospitalDropdownOpen, setHospitalDropdownOpen] = useState(false);

  if (!currentHospital) return null;

  const incomingRequests = requests.filter(
    (r) => r.targetHospitalId === currentHospital.id || (!r.targetHospitalId && r.requestingHospitalId !== currentHospital.id)
  );
  const pendingIncomingCount = incomingRequests.filter((r) => r.status === 'pending').length;
  const activeReservationsCount = reservations.filter((r) => r.status === 'active').length;

  const navItems = [
    { id: 'resources', label: 'Resource Capacity', icon: Layers },
    { id: 'create_request', label: 'Emergency AI Match', icon: Send, highlight: true },
    { id: 'incoming_requests', label: 'Inbound Requests', icon: Inbox, count: pendingIncomingCount, badgeColor: 'bg-rose-500 text-white' },
    { id: 'outgoing_requests', label: 'Outbound Transits', icon: Activity },
    { id: 'reservations', label: 'Active Reservations', icon: Clock, count: activeReservationsCount, badgeColor: 'bg-amber-500 text-white' },
    { id: 'specialists', label: 'Medical Specialists', icon: Users },
    { id: 'ambulances', label: 'Ambulance Fleet', icon: Truck },
    { id: 'network_map', label: 'Network Topology Map', icon: MapPin },
    { id: 'healthcare_search', label: 'Healthcare Search', icon: Globe, highlightGold: true },
    { id: 'ai_assistant', label: 'AI Clinical Assistant', icon: Sparkles, highlightTeal: true },
    { id: 'analytics', label: 'Operational Analytics', icon: BarChart3 },
    { id: 'audit_logs', label: 'Compliance Audit Logs', icon: FileText },
    { id: 'profile', label: 'Hospital Profile', icon: Building2 },
    { id: 'settings', label: 'Command Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex flex-col text-[#3A3D34]">
      {/* Top Application Bar */}
      <header className="bg-[#F9F7F2] text-[#3A3D34] border-b border-[#E5E0D5] sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-2 text-[#707565] hover:text-[#3A3D34] rounded-lg"
          >
            {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* MediLink Logo */}
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-2.5 text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#8C947A] text-[#F9F7F2] flex items-center justify-center font-serif font-bold text-sm shadow-sm">
              M
            </div>
            <span className="font-serif font-bold text-lg tracking-tight text-[#3A3D34]">
              Medi<span className="font-sans font-light text-[#8C947A]">Link</span>
            </span>
          </button>

          {/* Hospital Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setHospitalDropdownOpen(!hospitalDropdownOpen)}
              className="flex items-center gap-2 bg-[#F1EDE4] hover:bg-[#EAE4D8] px-3.5 py-1.5 rounded-full border border-[#DCD7CD] transition-colors text-xs font-semibold text-[#3A3D34] cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-[#8C947A]" />
              <span className="max-w-[140px] sm:max-w-[200px] truncate">{currentHospital.name}</span>
              <ChevronDown className="w-3 h-3 text-[#707565]" />
            </button>

            {hospitalDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white border border-[#E5E2D9] rounded-2xl shadow-xl p-2 z-50 space-y-1">
                <div className="text-[10px] font-semibold uppercase text-[#707565] px-3 py-1.5 tracking-wider">
                  Switch Active Hospital Node:
                </div>
                {hospitals.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      switchHospital(h.id);
                      setHospitalDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      h.id === currentHospital.id
                        ? 'bg-[#8C947A] text-[#F9F7F2] font-semibold'
                        : 'text-[#3A3D34] hover:bg-[#F9F7F2]'
                    }`}
                  >
                    <div>
                      <div className="font-serif font-bold">{h.name}</div>
                      <div className="text-[10px] opacity-75">{h.type}</div>
                    </div>
                    {h.id === currentHospital.id && <span>✓</span>}
                  </button>
                ))}

                <div className="pt-2 border-t border-[#E5E2D9]">
                  <button
                    onClick={() => {
                      setHospitalDropdownOpen(false);
                      onOpenOnboarding();
                    }}
                    className="w-full py-2 px-3 rounded-xl text-left text-xs font-semibold text-[#8C947A] hover:bg-[#F9F7F2] transition-colors"
                  >
                    + Register Another Facility
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:block">
            <VerificationBadge status={currentHospital.verificationStatus} />
          </div>
        </div>

        {/* Right Top Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setActiveTab('healthcare_search')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full border transition-all cursor-pointer ${
              activeTab === 'healthcare_search'
                ? 'bg-[#3A3D34] text-white border-[#3A3D34]'
                : 'bg-white hover:bg-[#F1EDE4] text-[#3A3D34] border-[#DCD7CD] shadow-2xs'
            }`}
            title="Search Google for public healthcare information"
          >
            <Search className="w-3.5 h-3.5 text-[#8C947A]" />
            <span className="hidden md:inline">Healthcare Search</span>
          </button>

          <button
            onClick={onOpenSimulation}
            className="flex items-center gap-1.5 bg-[#8C947A] hover:bg-[#788066] text-[#F9F7F2] font-serif font-bold text-xs px-4 py-2 rounded-full shadow-sm transition-all cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Emergency Simulation</span>
            <span className="sm:hidden">Sim</span>
          </button>

          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 text-[#707565] hover:text-[#3A3D34] text-xs font-semibold bg-[#F1EDE4] hover:bg-[#EAE4D8] px-3.5 py-2 rounded-full border border-[#DCD7CD] transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit to Home</span>
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 gap-8">
        {/* Left Sidebar (Desktop) */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as DashboardTab)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#3A3D34] text-[#F9F7F2] shadow-sm font-serif'
                    : item.highlight
                    ? 'bg-[#FAF0ED] text-[#C87D55] hover:bg-[#F7E5DF] border border-[#F0D5CB]'
                    : item.highlightGold
                    ? 'bg-[#FEF6EE] text-[#B56B2E] hover:bg-[#FCEBD8] border border-[#F9DCBA]'
                    : item.highlightTeal
                    ? 'bg-[#F1F3EB] text-[#5F8575] hover:bg-[#E5ECE0] border border-[#D9E2D5]'
                    : 'text-[#707565] hover:text-[#3A3D34] hover:bg-[#F1EDE4]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#8C947A]' : ''}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Mobile Drawer */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs flex">
            <div className="w-72 bg-[#F9F7F2] h-full p-6 space-y-2 overflow-y-auto border-r border-[#E5E0D5]">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D5]">
                <span className="font-serif font-bold text-sm text-[#3A3D34]">Command Navigation</span>
                <button onClick={() => setMobileSidebarOpen(false)} className="p-1 text-[#707565]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as DashboardTab);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#3A3D34] text-[#F9F7F2]'
                        : 'text-[#707565] hover:bg-[#F1EDE4]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count > 0 && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Pane */}
        <main className="flex-1 min-w-0">
          {activeTab === 'resources' && <ResourceManagementView />}
          {activeTab === 'create_request' && (
            <EmergencyRequestView onNavigateToOutgoing={() => setActiveTab('outgoing_requests')} />
          )}
          {activeTab === 'incoming_requests' && <IncomingRequestsView />}
          {activeTab === 'outgoing_requests' && (
            <OutgoingRequestsView onNavigateToCreate={() => setActiveTab('create_request')} />
          )}
          {activeTab === 'reservations' && <ReservationsView />}
          {activeTab === 'specialists' && <SpecialistsView />}
          {activeTab === 'ambulances' && <AmbulancesView />}
          {activeTab === 'network_map' && (
            <NetworkMapView
              onSelectHospital={(id) => {
                switchHospital(id);
                setActiveTab('resources');
              }}
            />
          )}
          {activeTab === 'healthcare_search' && (
            <HealthcareSearchView
              onNavigateTab={setActiveTab}
              onSelectHospital={(id) => {
                switchHospital(id);
              }}
            />
          )}
          {activeTab === 'ai_assistant' && <AiAssistantView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'audit_logs' && <AuditLogsView />}
          {activeTab === 'profile' && <HospitalProfileView />}
          {activeTab === 'settings' && <HospitalSettingsView />}
        </main>
      </div>
    </div>
  );
};
