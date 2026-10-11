import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Truck,
  HeartPulse,
  Flame,
  ArrowRight,
  RefreshCw,
  MapPin,
  LocateFixed,
  Layers,
  Route,
  Navigation,
  Sparkles,
  Compass,
} from 'lucide-react';
import { useMediLink } from '../../context/MediLinkContext';
import { Hospital } from '../../types';
import { ResourceStatusBadge, ConfidenceBadge, VerificationBadge } from '../common/StatusBadge';
import { useGoogleMaps, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../maps/GoogleMapsProvider';
import { calculateDistanceKm, estimateEtaMinutes } from '../../services/aiService';
import { RealTimeRoutingAssistant } from '../navigation/RealTimeRoutingAssistant';
import { ComputedRouteResult } from '../../services/routesService';

export interface RealTimeResourceNetworkProps {
  onAccessDashboard?: () => void;
  onOpenOnboarding?: () => void;
}

export const RealTimeResourceNetwork: React.FC<RealTimeResourceNetworkProps> = ({
  onAccessDashboard,
  onOpenOnboarding,
}) => {
  const { hospitals, switchHospital } = useMediLink();
  const [activeTab, setActiveTab] = useState<'navigator' | 'mesh'>('navigator');
  const [selectedHospital, setSelectedHospital] = useState<Hospital>(hospitals[0] || hospitals[0]);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [activeInfoHospital, setActiveInfoHospital] = useState<Hospital | null>(null);
  const [activeComputedRoute, setActiveComputedRoute] = useState<ComputedRouteResult | null>(null);

  const {
    hasApiKey,
    userLocation,
    isLocating,
    requestUserLocation,
    mapCenter,
    setMapCenter,
    mapZoom,
    setMapZoom,
  } = useGoogleMaps();

  const handleSelectMarker = (h: Hospital) => {
    setSelectedHospital(h);
    setActiveInfoHospital(h);
    setMapCenter({ lat: h.latitude, lng: h.longitude });
    setMapZoom(14);
  };

  const handleLocateUser = async () => {
    const loc = await requestUserLocation();
    if (loc) {
      setMapCenter({ lat: loc.latitude, lng: loc.longitude });
      setMapZoom(14);
    }
  };

  return (
    <section id="network-map" className="bg-[#F9F7F2] py-20 lg:py-28 border-b border-[#E5E0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F1EDE4] border border-[#DCD7CD] text-[#707565] text-xs font-semibold uppercase tracking-widest">
            <Activity className="w-3.5 h-3.5 text-[#8C947A]" />
            <span>Real-Time Autonomous Regional Logistics & Mesh</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#3A3D34] tracking-tight">
            Real-time navigation & resource mesh
          </h2>
          <p className="text-base sm:text-lg text-[#707565] leading-relaxed">
            Compute live traffic-optimized emergency routes with mid-route supply stops, or inspect hospital telemetry across the regional health network.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex items-center p-1.5 rounded-full bg-white border border-[#E5E2D9] shadow-xs mt-4">
            <button
              onClick={() => setActiveTab('navigator')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-serif font-bold transition-all cursor-pointer ${
                activeTab === 'navigator'
                  ? 'bg-[#3A3D34] text-white shadow-xs'
                  : 'text-[#707565] hover:text-[#3A3D34]'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-[#8C947A]" />
              <span>Real-Time Routing Assistant</span>
            </button>

            <button
              onClick={() => setActiveTab('mesh')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-serif font-bold transition-all cursor-pointer ${
                activeTab === 'mesh'
                  ? 'bg-[#3A3D34] text-white shadow-xs'
                  : 'text-[#707565] hover:text-[#3A3D34]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#8C947A]" />
              <span>Facility Telemetry Inspector</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Interactive Medical Network Mesh Canvas */}
          <div className="lg:col-span-6 bg-[#2A2D25] rounded-[36px] p-4 sm:p-6 border border-[#4A4E43] shadow-sm relative min-h-[560px] flex flex-col justify-between overflow-hidden">
            {/* Header Controls Overlay */}
            <div className="flex flex-wrap items-center justify-between gap-2 z-10 mb-3">
              <div className="flex items-center gap-2 bg-[#3A3D34]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#4A4E43]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8C947A] animate-ping"></span>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#F9F7F2]">
                  {activeTab === 'navigator' ? 'LIVE ROUTE CORRIDOR' : `MESH (${hospitals.length} NODES)`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLocateUser}
                  disabled={isLocating}
                  className="flex items-center gap-1.5 bg-[#3A3D34]/90 hover:bg-[#4A4E43] text-[#F9F7F2] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#4A4E43] transition-colors cursor-pointer"
                  title="Center on your GPS location"
                >
                  <LocateFixed className={`w-3.5 h-3.5 text-[#8C947A] ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Locating...' : userLocation ? 'GPS Active' : 'GPS'}</span>
                </button>
              </div>
            </div>

            {/* Interactive SVG Hospital Topology Mesh Area */}
            <div className="relative w-full h-[440px] sm:h-[480px] rounded-2xl overflow-hidden border border-[#4A4E43]/60 bg-[#1E201B]">
              <svg className="w-full h-full" viewBox="0 0 600 440" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <pattern id="landingMeshGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#2B3025" strokeWidth="0.75" />
                  </pattern>
                  <radialGradient id="radarRadial" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#8C947A" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#1E201B" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Radar Grid and Concentric Rings */}
                <rect width="600" height="440" fill="#1E201B" />
                <rect width="600" height="440" fill="url(#landingMeshGrid)" />
                <circle cx="300" cy="220" r="180" fill="url(#radarRadial)" />
                <circle cx="300" cy="220" r="80" fill="none" stroke="#33392C" strokeWidth="1" strokeDasharray="3,3" />
                <circle cx="300" cy="220" r="150" fill="none" stroke="#33392C" strokeWidth="1" strokeDasharray="4,4" />

                {/* Inter-Hospital Connections */}
                {hospitals.map((h1, i) =>
                  hospitals.slice(i + 1).map((h2) => {
                    const p1 = (() => {
                      const xNorm = (h1.longitude - -122.46) / 0.08;
                      const yNorm = (37.80 - h1.latitude) / 0.06;
                      return { x: 50 + xNorm * 500, y: 40 + yNorm * 360 };
                    })();
                    const p2 = (() => {
                      const xNorm = (h2.longitude - -122.46) / 0.08;
                      const yNorm = (37.80 - h2.latitude) / 0.06;
                      return { x: 50 + xNorm * 500, y: 40 + yNorm * 360 };
                    })();

                    return (
                      <line
                        key={`line-${h1.id}-${h2.id}`}
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke="#33392C"
                        strokeWidth="1"
                        strokeDasharray="2,3"
                        strokeOpacity="0.6"
                      />
                    );
                  })
                )}

                {/* Active Priority Corridor Path */}
                {activeComputedRoute && (
                  (() => {
                    const pOrig = (() => {
                      const h = selectedHospital;
                      const xNorm = (h.longitude - -122.46) / 0.08;
                      const yNorm = (37.80 - h.latitude) / 0.06;
                      return { x: 50 + xNorm * 500, y: 40 + yNorm * 360 };
                    })();
                    const otherH = hospitals.find((h) => h.id !== selectedHospital?.id) || hospitals[1];
                    const pDest = (() => {
                      const xNorm = (otherH.longitude - -122.46) / 0.08;
                      const yNorm = (37.80 - otherH.latitude) / 0.06;
                      return { x: 50 + xNorm * 500, y: 40 + yNorm * 360 };
                    })();
                    const midX = (pOrig.x + pDest.x) / 2;
                    const midY = (pOrig.y + pDest.y) / 2 - 25;

                    return (
                      <g>
                        <path
                          d={`M ${pOrig.x} ${pOrig.y} Q ${midX} ${midY} ${pDest.x} ${pDest.y}`}
                          fill="none"
                          stroke="#D98C71"
                          strokeWidth="3.5"
                          strokeDasharray="6,4"
                          className="animate-pulse"
                        />
                        <circle cx={pDest.x} cy={pDest.y} r="20" fill="#D98C71" fillOpacity="0.2" className="animate-ping" />
                      </g>
                    );
                  })()
                )}

                {/* User Location Beacon */}
                {userLocation && (
                  (() => {
                    const xNorm = (userLocation.longitude - -122.46) / 0.08;
                    const yNorm = (37.80 - userLocation.latitude) / 0.06;
                    const x = 50 + xNorm * 500;
                    const y = 40 + yNorm * 360;
                    return (
                      <g transform={`translate(${x}, ${y})`}>
                        <circle r="14" fill="#3E8FC4" fillOpacity="0.3" className="animate-ping" />
                        <circle r="6" fill="#3E8FC4" stroke="#FFFFFF" strokeWidth="2" />
                      </g>
                    );
                  })()
                )}

                {/* Hospital Nodes */}
                {hospitals.map((h) => {
                  const xNorm = (h.longitude - -122.46) / 0.08;
                  const yNorm = (37.80 - h.latitude) / 0.06;
                  const x = 50 + xNorm * 500;
                  const y = 40 + yNorm * 360;
                  const isSelected = h.id === selectedHospital?.id;
                  const icu = h.resources.find((r) => r.type === 'icu')?.availableQuantity || 0;

                  return (
                    <g
                      key={h.id}
                      transform={`translate(${x}, ${y})`}
                      onClick={() => handleSelectMarker(h)}
                      className="cursor-pointer"
                    >
                      {isSelected && (
                        <circle r="22" fill="#8C947A" fillOpacity="0.3" className="animate-pulse" />
                      )}
                      <circle
                        r="14"
                        fill="#2A2F24"
                        stroke={isSelected ? '#F9F7F2' : '#8C947A'}
                        strokeWidth={isSelected ? 3 : 2}
                      />
                      <circle r="6" fill={isSelected ? '#8C947A' : '#5F8575'} />

                      {/* Info Label */}
                      <rect
                        x="-55"
                        y="18"
                        width="110"
                        height="24"
                        rx="7"
                        fill="#1E201B"
                        fillOpacity="0.9"
                        stroke={isSelected ? '#8C947A' : '#3E4336'}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="30"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        {h.name.split(' ')[0]}
                      </text>
                      <text
                        x="0"
                        y="39"
                        textAnchor="middle"
                        fill="#8C947A"
                        fontSize="7.5"
                        fontFamily="monospace"
                      >
                        {icu} ICU Beds
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Popover overlay for currently active hospital info */}
              {activeInfoHospital && (
                <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs bg-[#242920]/95 backdrop-blur-md p-3 rounded-2xl border border-[#3E4336] text-white shadow-lg text-xs space-y-2 z-20">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm truncate">{activeInfoHospital.name}</span>
                    <button
                      onClick={() => setActiveInfoHospital(null)}
                      className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="text-[11px] text-[#A6AC9B]">{activeInfoHospital.address}</div>
                  <div className="flex gap-1.5 pt-1">
                    <button
                      onClick={() => {
                        setSelectedHospital(activeInfoHospital);
                        setActiveInfoHospital(null);
                        setActiveTab('navigator');
                      }}
                      className="flex-1 bg-[#D98C71] hover:bg-[#C87D55] text-white text-[11px] font-bold py-1 px-2 rounded-xl text-center cursor-pointer"
                    >
                      Route Here &rarr;
                    </button>
                    <button
                      onClick={() => {
                        setSelectedHospital(activeInfoHospital);
                        setActiveInfoHospital(null);
                        setActiveTab('mesh');
                      }}
                      className="flex-1 bg-[#3A3D34] hover:bg-[#4A4E43] text-white text-[11px] font-bold py-1 px-2 rounded-xl text-center cursor-pointer"
                    >
                      Telemetry
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Bar */}
            <div className="flex items-center justify-between text-xs text-[#8A8D82] border-t border-[#4A4E43] pt-3 mt-3">
              <span className="text-[11px]">
                {activeComputedRoute ? `${activeComputedRoute.distanceKm} km emergency corridor • ${activeComputedRoute.durationMinutes} min ETA` : 'Click any facility to view live telemetry and route'}
              </span>
              <span className="text-[#8C947A] font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8C947A] animate-pulse" />
                {hospitals.length} Facilities Synced
              </span>
            </div>
          </div>

          {/* Right: Real-Time Routing Assistant OR Hospital Telemetry Inspector */}
          <div className="lg:col-span-6">
            {activeTab === 'navigator' ? (
              <RealTimeRoutingAssistant
                initialOriginId={selectedHospital?.id}
                initialDestinationId={hospitals.find((h) => h.id !== selectedHospital?.id)?.id || hospitals[1]?.id}
                onRouteUpdated={(result) => setActiveComputedRoute(result)}
                onSelectHospital={(h) => setSelectedHospital(h)}
              />
            ) : (
              <div className="bg-white rounded-[32px] p-7 sm:p-8 border border-[#E5E2D9] shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <VerificationBadge status={selectedHospital?.verificationStatus || 'verified'} />
                    <h3 className="text-2xl font-serif font-bold text-[#3A3D34] mt-2">{selectedHospital?.name}</h3>
                    <p className="text-xs text-[#707565]">{selectedHospital?.address}, {selectedHospital?.city}</p>
                  </div>
                  <div className="w-11 h-11 rounded-full bg-[#F1EDE4] text-[#8C947A] flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>

                {/* Quick Metrics */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="bg-[#F9F7F2] p-3.5 rounded-2xl border border-[#E5E2D9]">
                    <div className="text-xs text-[#707565]">Facility Type</div>
                    <div className="text-sm font-serif font-bold text-[#3A3D34] mt-0.5">{selectedHospital?.type}</div>
                  </div>
                  <div className="bg-[#F9F7F2] p-3.5 rounded-2xl border border-[#E5E2D9]">
                    <div className="text-xs text-[#707565]">Emergency Hotline</div>
                    <div className="text-sm font-medium text-[#3A3D34] mt-0.5">{selectedHospital?.emergencyPhone}</div>
                  </div>
                </div>

                {/* Live Resources List */}
                <div className="mt-6 space-y-3">
                  <div className="text-xs font-semibold uppercase text-[#707565] tracking-wider">
                    Live Resource Telemetry
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {selectedHospital?.resources.map((res) => (
                      <div
                        key={res.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9] text-xs"
                      >
                        <div>
                          <div className="font-serif font-bold text-[#3A3D34]">{res.name}</div>
                          <div className="text-[11px] text-[#707565]">
                            {res.availableQuantity} of {res.totalQuantity} units • Verified {res.lastVerified}
                          </div>
                        </div>
                        <ResourceStatusBadge status={res.status} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blood Availability Chips */}
                <div className="mt-6 pt-4 border-t border-[#E5E2D9]">
                  <div className="text-xs font-semibold text-[#3A3D34] mb-2">Blood Bank Inventory:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedHospital?.bloodInventory.map((b) => (
                      <span
                        key={b.group}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          b.units > 5 ? 'bg-[#F1F3EB] text-[#5F8575] border border-[#D9E2D5]' : 'bg-[#FAF0ED] text-[#C87D55] border border-[#F0D5CB]'
                        }`}
                      >
                        {b.group}: {b.units}U
                      </span>
                    ))}
                  </div>
                </div>

                {/* Navigation Button */}
                <button
                  onClick={() => setActiveTab('navigator')}
                  className="w-full mt-6 bg-[#3A3D34] hover:bg-[#2A2D25] text-[#F9F7F2] font-serif font-bold py-3.5 rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Navigation className="w-4 h-4 text-[#8C947A]" />
                  <span>Launch Navigation Assistant to {selectedHospital?.name.split(' ')[0]}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export const ResourceStatusSystem: React.FC = () => {
  return (
    <section className="bg-[#F1EDE4] py-16 border-b border-[#E5E0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h3 className="text-2xl sm:text-3xl font-serif text-[#3A3D34]">
            Standardized Resource Telemetry States
          </h3>
          <p className="text-sm text-[#707565]">
            Every critical asset across the MediLink network supports four unambiguous operational states with verified telemetry confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-[28px] border border-[#E5E2D9] shadow-sm">
            <ResourceStatusBadge status="available" />
            <h4 className="text-base font-serif font-bold text-[#3A3D34] mt-3">AVAILABLE</h4>
            <p className="text-xs text-[#707565] mt-1">
              Ready for immediate allocation. Telemetry verified within minutes.
            </p>
            <div className="mt-4 pt-3 border-t border-[#E5E2D9] flex items-center justify-between text-[11px] text-[#707565]">
              <span>Confidence:</span>
              <ConfidenceBadge confidence="HIGH" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-[28px] border border-[#E5E2D9] shadow-sm">
            <ResourceStatusBadge status="reserved" />
            <h4 className="text-base font-serif font-bold text-[#3A3D34] mt-3">RESERVED</h4>
            <p className="text-xs text-[#707565] mt-1">
              Locked under active emergency request. 15-minute countdown running.
            </p>
            <div className="mt-4 pt-3 border-t border-[#E5E2D9] flex items-center justify-between text-[11px] text-[#707565]">
              <span>Expiry Lock:</span>
              <span className="font-serif font-bold text-[#B07D38]">14:32 remaining</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[28px] border border-[#E5E2D9] shadow-sm">
            <ResourceStatusBadge status="occupied" />
            <h4 className="text-base font-serif font-bold text-[#3A3D34] mt-3">OCCUPIED</h4>
            <p className="text-xs text-[#707565] mt-1">
              Currently occupied by patient. Automatic rerouting in effect.
            </p>
            <div className="mt-4 pt-3 border-t border-[#E5E2D9] flex items-center justify-between text-[11px] text-[#707565]">
              <span>Rerouting:</span>
              <span className="text-[#D98C71] font-semibold">Active</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[28px] border border-[#E5E2D9] shadow-sm">
            <ResourceStatusBadge status="unknown" />
            <h4 className="text-base font-serif font-bold text-[#3A3D34] mt-3">UNKNOWN / STALE</h4>
            <p className="text-xs text-[#707565] mt-1">
              Unverified for &gt;2 hours. Match algorithm discounts ranking weight.
            </p>
            <div className="mt-4 pt-3 border-t border-[#E5E2D9] flex items-center justify-between text-[11px] text-[#707565]">
              <span>Confidence:</span>
              <ConfidenceBadge confidence="LOW" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const SimulationSection: React.FC<{ onStartSimulation?: () => void }> = ({ onStartSimulation }) => {
  return (
    <section id="simulation" className="bg-[#3A3D34] text-[#F9F7F2] py-20 border-b border-[#4A4E43] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="bg-[#2A2D25] rounded-[36px] p-8 sm:p-12 border border-[#4A4E43] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF0ED]/10 border border-[#D98C71]/30 text-[#D98C71] text-xs font-semibold uppercase tracking-widest">
              <Flame className="w-3.5 h-3.5 text-[#D98C71]" />
              <span>Live Demonstration Environment</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif tracking-tight">
              Interactive emergency simulation mode
            </h2>
            <p className="text-sm sm:text-base text-[#DCD7CD] leading-relaxed">
              Experience the full 4-stage coordination lifecycle: Mass trauma incoming at CityCare → AI recommends Apex (94% Match) → Reservation locked (Available → Reserved) → Second emergency saturates Apex → MediLink dynamically recalculates to LifeLine Medical!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <button
              onClick={() => onStartSimulation?.()}
              className="flex items-center justify-center gap-2.5 bg-[#8C947A] hover:bg-[#788066] text-[#F9F7F2] font-serif font-bold text-base px-8 py-4 rounded-full shadow-sm transition-all cursor-pointer tracking-wide"
            >
              <Flame className="w-5 h-5 text-white" />
              <span>Start Emergency Simulation</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export const CtaSection: React.FC<{ onOpenOnboarding?: () => void; onAccessDashboard?: () => void }> = ({
  onOpenOnboarding,
  onAccessDashboard,
}) => {
  return (
    <section className="bg-[#F1EDE4] py-24 text-[#3A3D34] border-b border-[#E5E0D5] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center space-y-6">
        <h2 className="text-3xl sm:text-5xl font-serif text-[#3A3D34] tracking-tight">
          Join the MediLink Regional Mesh
        </h2>
        <p className="text-base sm:text-lg text-[#707565] max-w-2xl mx-auto leading-relaxed">
          Connect your hospital to a real-time network built to help healthcare teams coordinate critical resources faster when seconds matter.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onOpenOnboarding?.()}
            className="flex items-center gap-2 bg-[#8C947A] hover:bg-[#788066] text-[#F9F7F2] font-serif font-bold text-base px-8 py-4 rounded-full shadow-sm transition-all cursor-pointer"
          >
            <span>+ Add Your Hospital</span>
          </button>
          <button
            onClick={() => onAccessDashboard?.()}
            className="flex items-center gap-2 bg-white hover:bg-[#FAF8F5] text-[#3A3D34] font-serif font-semibold text-base px-8 py-4 rounded-full border border-[#DCD7CD] transition-all cursor-pointer shadow-sm"
          >
            <span>Access MediLink</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    hospitalName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fullName && formData.email) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ fullName: '', hospitalName: '', email: '', phone: '', message: '' });
      }, 5000);
    }
  };

  return (
    <section id="contact" className="bg-[#F9F7F2] py-20 lg:py-28 border-b border-[#E5E0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F1EDE4] border border-[#DCD7CD] text-[#707565] text-xs font-semibold uppercase tracking-widest">
              <span>Network Support & Integration</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#3A3D34] tracking-tight">
              Connect with MediLink
            </h2>
            <p className="text-base text-[#707565] leading-relaxed">
              Have questions about joining the regional network or integrating your hospital&apos;s EHR/EMR telemetry? Our medical coordination team is ready to assist.
            </p>

            <div className="space-y-3 pt-4 text-sm text-[#3A3D34]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#F1EDE4] text-[#8C947A] flex items-center justify-center font-bold font-serif text-xs">
                  24/7
                </div>
                <span>Emergency Coordination Desk: +1 (800) MEDI-LINK</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#F1F3EB] text-[#5F8575] flex items-center justify-center font-bold text-xs">
                  @
                </div>
                <span>Hospital Integration: network@medilink.org</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-[#E5E2D9] shadow-sm">
              {submitted ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#F1F3EB] text-[#5F8575] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-[#3A3D34]">Message Sent Successfully</h3>
                  <p className="text-sm text-[#707565] max-w-md mx-auto">
                    Thank you. A MediLink regional coordinator will contact your hospital administration shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#3A3D34] mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Dr. Robert Chen"
                        className="w-full bg-[#F9F7F2] border border-[#E5E2D9] rounded-2xl px-4 py-3 text-sm text-[#3A3D34] focus:outline-none focus:border-[#8C947A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#3A3D34] mb-1.5">Hospital / Medical Center *</label>
                      <input
                        type="text"
                        required
                        value={formData.hospitalName}
                        onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                        placeholder="City Memorial Hospital"
                        className="w-full bg-[#F9F7F2] border border-[#E5E2D9] rounded-2xl px-4 py-3 text-sm text-[#3A3D34] focus:outline-none focus:border-[#8C947A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#3A3D34] mb-1.5">Official Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="r.chen@cityhospital.org"
                        className="w-full bg-[#F9F7F2] border border-[#E5E2D9] rounded-2xl px-4 py-3 text-sm text-[#3A3D34] focus:outline-none focus:border-[#8C947A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#3A3D34] mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 019-2831"
                        className="w-full bg-[#F9F7F2] border border-[#E5E2D9] rounded-2xl px-4 py-3 text-sm text-[#3A3D34] focus:outline-none focus:border-[#8C947A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3A3D34] mb-1.5">Inquiry / Message</label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Inquiring about connecting our 300-bed trauma center to the live coordination network..."
                      className="w-full bg-[#F9F7F2] border border-[#E5E2D9] rounded-2xl px-4 py-3 text-sm text-[#3A3D34] focus:outline-none focus:border-[#8C947A]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#3A3D34] hover:bg-[#2A2D25] text-[#F9F7F2] font-serif font-bold py-4 rounded-full shadow-sm transition-all cursor-pointer text-sm tracking-wide"
                  >
                    SEND MESSAGE
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
