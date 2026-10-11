import React, { useState, useEffect } from 'react';
import { MediLinkProvider, useMediLink } from './context/MediLinkContext';
import { UtilityBar } from './components/layout/UtilityBar';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/landing/HeroSection';
import { NetworkStats } from './components/landing/NetworkStats';
import { ProblemSection, SolutionSection, HowItWorks } from './components/landing/ProblemSection';
import {
  EmergencyMatchingSection,
  AiRecommendationShowcase,
  EtaAwareSection,
  ReservationShowcase,
} from './components/landing/EmergencyMatchingSection';
import {
  RealTimeResourceNetwork,
  ResourceStatusSystem,
  SimulationSection,
  CtaSection,
  ContactSection,
} from './components/landing/RealTimeResourceNetwork';
import { HospitalDashboard } from './components/dashboard/HospitalDashboard';
import { HospitalOnboardingModal } from './components/onboarding/HospitalOnboardingModal';
import { LoginModal } from './components/auth/LoginModal';
import { EmergencySimulationModal } from './components/modals/EmergencySimulationModal';
import { IncomingAlertModal } from './components/modals/IncomingAlertModal';
import { EmergencyRequest } from './types';
import { NetworkLocationProvider } from './components/maps/GoogleMapsProvider';

const MainApp: React.FC = () => {
  const { currentHospital, requests, acceptEmergencyRequest, rejectEmergencyRequest } = useMediLink();

  const [viewMode, setViewMode] = useState<'landing' | 'dashboard'>('landing');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [activeAlertRequest, setActiveAlertRequest] = useState<EmergencyRequest | null>(null);

  // Trigger Incoming Alert Modal if there is a pending request for current hospital that hasn't been handled yet
  useEffect(() => {
    if (!currentHospital) return;
    const pendingCritical = requests.find(
      (r) => r.status === 'pending' && r.targetHospitalId === currentHospital.id
    );
    if (pendingCritical && viewMode === 'dashboard') {
      setActiveAlertRequest(pendingCritical);
    }
  }, [requests, currentHospital, viewMode]);

  return (
    <div className="min-h-screen bg-[#F9F7F2] font-sans antialiased text-[#3A3D34] selection:bg-[#8C947A] selection:text-[#F9F7F2] flex flex-col">
      {viewMode === 'landing' ? (
        <>
          <UtilityBar onOpenSimulation={() => setIsSimulationOpen(true)} />
          <Navbar
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onOpenLogin={() => setIsLoginOpen(true)}
            onOpenSimulation={() => setIsSimulationOpen(true)}
            onNavigateDashboard={() => setViewMode('dashboard')}
          />

          <main className="flex-1">
            <HeroSection
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onLaunchLiveDemo={() => setViewMode('dashboard')}
              onAccessDashboard={() => setViewMode('dashboard')}
              onOpenSimulation={() => setIsSimulationOpen(true)}
            />
            <NetworkStats />
            <ProblemSection />
            <SolutionSection />
            <HowItWorks />
            <EmergencyMatchingSection />
            <AiRecommendationShowcase onAccessDashboard={() => setViewMode('dashboard')} />
            <EtaAwareSection />
            <ReservationShowcase />
            <RealTimeResourceNetwork
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onAccessDashboard={() => setViewMode('dashboard')}
            />
            <ResourceStatusSystem />
            <SimulationSection onStartSimulation={() => setIsSimulationOpen(true)} />
            <CtaSection
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onAccessDashboard={() => setViewMode('dashboard')}
            />
            <ContactSection />
          </main>

          <Footer
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onOpenLogin={() => setIsLoginOpen(true)}
            onNavigateDashboard={() => setViewMode('dashboard')}
          />
        </>
      ) : (
        <HospitalDashboard
          onBackToLanding={() => setViewMode('landing')}
          onOpenSimulation={() => setIsSimulationOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
        />
      )}

      {/* Global Modals */}
      <HospitalOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={() => {
          setIsOnboardingOpen(false);
          setViewMode('dashboard');
        }}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={() => {
          setIsLoginOpen(false);
          setViewMode('dashboard');
        }}
      />

      <EmergencySimulationModal
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
      />

      {activeAlertRequest && (
        <IncomingAlertModal
          request={activeAlertRequest}
          onAccept={(id) => {
            acceptEmergencyRequest(id);
            setActiveAlertRequest(null);
          }}
          onReject={(id) => {
            rejectEmergencyRequest(id);
            setActiveAlertRequest(null);
          }}
          onClose={() => setActiveAlertRequest(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <MediLinkProvider>
      <NetworkLocationProvider>
        <MainApp />
      </NetworkLocationProvider>
    </MediLinkProvider>
  );
}
