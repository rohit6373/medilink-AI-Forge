import React, { useState, useMemo, useRef } from 'react';
import {
  Building2,
  MapPin,
  LocateFixed,
  Search,
  Filter,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Navigation,
  Sparkles,
  Layers,
  ArrowRight,
  Truck,
  HeartPulse,
  Activity,
  Maximize2,
  RotateCcw,
  Zap,
  Route,
  AlertCircle,
  X,
  Compass,
  ZoomIn,
  ZoomOut,
  Phone,
  Bed,
} from 'lucide-react';
import { useMediLink } from '../../context/MediLinkContext';
import { Hospital } from '../../types';
import { useGoogleMaps, DEFAULT_MAP_CENTER } from './GoogleMapsProvider';
import { calculateDistanceKm, estimateEtaMinutes } from '../../services/aiService';
import { ResourceStatusBadge, VerificationBadge, ConfidenceBadge } from '../common/StatusBadge';
import { ApiKeyNoticeBanner } from './ApiKeyNoticeBanner';

interface HospitalNetworkMapProps {
  onSelectHospital?: (hospitalId: string) => void;
  onRequestTransfer?: (hospitalId: string) => void;
  onViewRoute?: (hospitalId: string) => void;
  recommendedHospitalId?: string;
  requestingHospitalId?: string;
  compact?: boolean;
}

export const HospitalNetworkMap: React.FC<HospitalNetworkMapProps> = ({
  onSelectHospital,
  onRequestTransfer,
  onViewRoute,
  recommendedHospitalId,
  requestingHospitalId,
  compact = false,
}) => {
  const { hospitals, currentHospital, switchHospital } = useMediLink();
  const {
    userLocation,
    isLocating,
    requestUserLocation,
    selectedMapHospitalId,
    setSelectedMapHospitalId,
  } = useGoogleMaps();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [radiusFilter, setRadiusFilter] = useState<number>(50); // km
  const [activeInfoWindowHospital, setActiveInfoWindowHospital] = useState<Hospital | null>(null);

  // Active Routing Overlay State
  const [activeRoutingTarget, setActiveRoutingTarget] = useState<Hospital | null>(null);

  // Zoom and Pan Controls
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDragging = useRef<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Reference coordinates for distance calculation (User location if available, otherwise current hospital)
  const referencePoint = useMemo(() => {
    if (userLocation) {
      return { lat: userLocation.latitude, lng: userLocation.longitude, label: 'Your GPS' };
    }
    if (currentHospital) {
      return { lat: currentHospital.latitude, lng: currentHospital.longitude, label: currentHospital.name };
    }
    return { lat: DEFAULT_MAP_CENTER.lat, lng: DEFAULT_MAP_CENTER.lng, label: 'Metro Center' };
  }, [userLocation, currentHospital]);

  // Active selected hospital
  const activeSelectedHospital = useMemo(() => {
    if (selectedMapHospitalId) {
      return hospitals.find((h) => h.id === selectedMapHospitalId) || hospitals[0];
    }
    return currentHospital || hospitals[0];
  }, [selectedMapHospitalId, hospitals, currentHospital]);

  // Filtered & Sorted hospitals
  const filteredHospitals = useMemo(() => {
    return hospitals
      .map((h) => {
        const dist = calculateDistanceKm(referencePoint.lat, referencePoint.lng, h.latitude, h.longitude);
        const eta = estimateEtaMinutes(dist, 'critical');
        return { hospital: h, distanceKm: dist, etaMinutes: eta };
      })
      .filter(({ hospital, distanceKm }) => {
        // Search filter
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matchName = hospital.name.toLowerCase().includes(term);
          const matchCity = hospital.city.toLowerCase().includes(term);
          const matchService = hospital.services.some((s) => s.toLowerCase().includes(term));
          if (!matchName && !matchCity && !matchService) return false;
        }

        // Verification filter
        if (verificationFilter === 'verified' && hospital.verificationStatus !== 'verified') return false;
        if (verificationFilter === 'pending' && hospital.verificationStatus !== 'pending') return false;

        // Radius filter
        if (distanceKm > radiusFilter) return false;

        // Resource filter
        if (resourceFilter === 'icu') {
          const icu = hospital.resources.find((r) => r.type === 'icu');
          if (!icu || icu.availableQuantity <= 0) return false;
        }
        if (resourceFilter === 'ventilator') {
          const vent = hospital.resources.find((r) => r.type === 'ventilator');
          if (!vent || vent.availableQuantity <= 0) return false;
        }
        if (resourceFilter === 'blood_o_neg') {
          const b = hospital.bloodInventory.find((bi) => bi.group === 'O-');
          if (!b || b.unitsAvailable <= 0) return false;
        }

        return true;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [hospitals, referencePoint, searchTerm, verificationFilter, resourceFilter, radiusFilter]);

  // Dynamic Geographic Coordinate Projection to SVG Canvas Space (800 x 600)
  const svgBounds = useMemo(() => {
    const allLats = hospitals.map((h) => h.latitude);
    const allLngs = hospitals.map((h) => h.longitude);
    if (userLocation) {
      allLats.push(userLocation.latitude);
      allLngs.push(userLocation.longitude);
    }

    const minLat = Math.min(...allLats);
    const maxLat = Math.max(...allLats);
    const minLng = Math.min(...allLngs);
    const maxLng = Math.max(...allLngs);

    const latMargin = Math.max(0.02, (maxLat - minLat) * 0.15);
    const lngMargin = Math.max(0.02, (maxLng - minLng) * 0.15);

    return {
      minLat: minLat - latMargin,
      maxLat: maxLat + latMargin,
      minLng: minLng - lngMargin,
      maxLng: maxLng + lngMargin,
    };
  }, [hospitals, userLocation]);

  const projectToSvg = (lat: number, lng: number) => {
    const width = 800;
    const height = 550;
    const padding = 60;

    const xNorm = (lng - svgBounds.minLng) / (svgBounds.maxLng - svgBounds.minLng || 1);
    const yNorm = (svgBounds.maxLat - lat) / (svgBounds.maxLat - svgBounds.minLat || 1);

    const x = padding + xNorm * (width - padding * 2);
    const y = padding + yNorm * (height - padding * 2);

    return { x, y };
  };

  const handleTriggerRoute = (hospital: Hospital) => {
    setActiveRoutingTarget(hospital);
    if (onViewRoute) {
      onViewRoute(hospital.id);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPanOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setActiveRoutingTarget(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls / Filters */}
      <div className="bg-white rounded-3xl p-5 border border-[#E5E0D5] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#3A3D34] text-[#F9F7F2] flex items-center justify-center font-bold">
              <Compass className="w-5 h-5 text-[#8C947A]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#3A3D34]">
                Regional Medical Network Topology
              </h3>
              <p className="text-xs text-[#707565]">
                Real-time visual node mesh &bull; {filteredHospitals.length} active healthcare facilities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => requestUserLocation()}
              disabled={isLocating}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                userLocation
                  ? 'bg-[#EBF3EE] text-[#5F8575] border-[#D9E2D5]'
                  : 'bg-white hover:bg-[#F9F7F2] text-[#3A3D34] border-[#DCD7CD]'
              }`}
            >
              <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : userLocation ? 'GPS Active' : 'Use My GPS'}</span>
            </button>

            <button
              onClick={resetView}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-[#F9F7F2] text-[#3A3D34] border border-[#DCD7CD] transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Grid</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[#F1EDE4]">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8A8D82] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search hospital or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F9F7F2] border border-[#DCD7CD] rounded-xl text-xs text-[#3A3D34] focus:outline-none focus:border-[#8C947A]"
            />
          </div>

          {/* Verification Filter */}
          <div className="flex items-center bg-[#F9F7F2] rounded-xl p-1 border border-[#DCD7CD] text-xs">
            <button
              onClick={() => setVerificationFilter('all')}
              className={`flex-1 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                verificationFilter === 'all' ? 'bg-white text-[#3A3D34] font-bold shadow-2xs' : 'text-[#707565]'
              }`}
            >
              All Nodes
            </button>
            <button
              onClick={() => setVerificationFilter('verified')}
              className={`flex-1 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                verificationFilter === 'verified' ? 'bg-[#5F8575] text-white font-bold shadow-2xs' : 'text-[#707565]'
              }`}
            >
              Verified
            </button>
          </div>

          {/* Critical Resource Filter */}
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#F9F7F2] border border-[#DCD7CD] rounded-xl text-xs text-[#3A3D34] focus:outline-none focus:border-[#8C947A] cursor-pointer"
          >
            <option value="all">Filter by Resource (Any)</option>
            <option value="icu">ICU Bed Available</option>
            <option value="ventilator">Ventilator Available</option>
            <option value="blood_o_neg">O- Blood Inventory</option>
          </select>

          {/* Radius Filter */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#F9F7F2] border border-[#DCD7CD] rounded-xl text-xs">
            <span className="text-[#707565] shrink-0 font-medium">Radius:</span>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={radiusFilter}
              onChange={(e) => setRadiusFilter(Number(e.target.value))}
              className="w-full accent-[#8C947A] cursor-pointer"
            />
            <span className="font-mono font-bold text-[#3A3D34] shrink-0">{radiusFilter}km</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Radar/Mesh Visualizer + Hospital Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Interactive Medical Network Topology Visualizer */}
        <div
          className={`${
            compact ? 'lg:col-span-12' : 'lg:col-span-7'
          } bg-[#232720] rounded-3xl border border-[#3E4336] shadow-md overflow-hidden relative flex flex-col`}
        >
          {/* Top Canvas Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#3E4336] bg-[#1E221B]/90 z-20 text-xs text-[#EAE6DD]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8C947A] animate-pulse" />
              <span className="font-mono text-[11px] text-[#A6AC9B]">
                REGIONAL MEDICAL MESH &bull; {filteredHospitals.length} TRACKED FACILITIES
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#2B3025] rounded-lg border border-[#3E4336]">
                <button
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                  className="p-1.5 text-[#EAE6DD] hover:text-white cursor-pointer transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono px-1.5 text-[#A6AC9B]">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                  className="p-1.5 text-[#EAE6DD] hover:text-white cursor-pointer transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive SVG Canvas Area */}
          <div
            className="w-full flex-1 min-h-[460px] lg:min-h-[540px] relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <svg
              className="w-full h-full absolute inset-0"
              viewBox="0 0 800 550"
              preserveAspectRatio="xMidYMid meet"
              style={{
                transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                transformOrigin: 'center center',
                transition: isDragging.current ? 'none' : 'transform 0.15s ease-out',
              }}
            >
              <defs>
                {/* Background Grid Pattern */}
                <pattern id="medicalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2F3529" strokeWidth="0.75" />
                </pattern>
                {/* Radial Glow Gradient */}
                <radialGradient id="meshGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#8C947A" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#232720" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Background */}
              <rect width="800" height="550" fill="#232720" />
              <rect width="800" height="550" fill="url(#medicalGrid)" />
              <circle cx="400" cy="275" r="260" fill="url(#meshGlow)" />

              {/* Concentric Radar Distance Rings */}
              <circle cx="400" cy="275" r="100" fill="none" stroke="#373D2F" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx="400" cy="275" r="180" fill="none" stroke="#373D2F" strokeWidth="1" strokeDasharray="4,4" />
              <circle cx="400" cy="275" r="260" fill="none" stroke="#373D2F" strokeWidth="1" strokeDasharray="5,5" />

              {/* Compass Axis Lines */}
              <line x1="400" y1="20" x2="400" y2="530" stroke="#33392C" strokeWidth="1" strokeDasharray="2,4" />
              <line x1="40" y1="275" x2="760" y2="275" stroke="#33392C" strokeWidth="1" strokeDasharray="2,4" />

              {/* Compass Cardinal Labels */}
              <text x="400" y="35" textAnchor="middle" fill="#69715E" fontSize="10" fontFamily="monospace" fontWeight="bold">N</text>
              <text x="750" y="278" textAnchor="middle" fill="#69715E" fontSize="10" fontFamily="monospace" fontWeight="bold">E</text>
              <text x="400" y="525" textAnchor="middle" fill="#69715E" fontSize="10" fontFamily="monospace" fontWeight="bold">S</text>
              <text x="50" y="278" textAnchor="middle" fill="#69715E" fontSize="10" fontFamily="monospace" fontWeight="bold">W</text>

              {/* Inter-Hospital Transit Corridors (Mesh Links) */}
              {hospitals.map((h1, i) =>
                hospitals.slice(i + 1).map((h2) => {
                  const p1 = projectToSvg(h1.latitude, h1.longitude);
                  const p2 = projectToSvg(h2.latitude, h2.longitude);
                  const isHighlighted =
                    (activeRoutingTarget && (h1.id === activeRoutingTarget.id || h2.id === activeRoutingTarget.id)) ||
                    (recommendedHospitalId && (h1.id === recommendedHospitalId || h2.id === recommendedHospitalId));

                  return (
                    <line
                      key={`${h1.id}-${h2.id}`}
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke={isHighlighted ? '#D98C71' : '#3D4435'}
                      strokeWidth={isHighlighted ? 2.5 : 1}
                      strokeDasharray={isHighlighted ? '6,3' : '2,2'}
                      strokeOpacity={isHighlighted ? 0.95 : 0.4}
                    />
                  );
                })
              )}

              {/* Active Corridor Route Overlay if routing target is selected */}
              {activeRoutingTarget && currentHospital && (
                (() => {
                  const pOrig = projectToSvg(currentHospital.latitude, currentHospital.longitude);
                  const pDest = projectToSvg(activeRoutingTarget.latitude, activeRoutingTarget.longitude);
                  const midX = (pOrig.x + pDest.x) / 2;
                  const midY = (pOrig.y + pDest.y) / 2 - 20;

                  return (
                    <g>
                      <path
                        d={`M ${pOrig.x} ${pOrig.y} Q ${midX} ${midY} ${pDest.x} ${pDest.y}`}
                        fill="none"
                        stroke="#5F8575"
                        strokeWidth="3.5"
                        strokeDasharray="6,4"
                        className="animate-pulse"
                      />
                      <circle cx={pDest.x} cy={pDest.y} r="22" fill="#5F8575" fillOpacity="0.2" className="animate-ping" />
                    </g>
                  );
                })()
              )}

              {/* User GPS Location Beacon */}
              {userLocation && (
                (() => {
                  const pos = projectToSvg(userLocation.latitude, userLocation.longitude);
                  return (
                    <g transform={`translate(${pos.x}, ${pos.y})`}>
                      <circle r="16" fill="#3E8FC4" fillOpacity="0.25" className="animate-ping" />
                      <circle r="8" fill="#3E8FC4" stroke="#FFFFFF" strokeWidth="2" />
                      <text y="22" textAnchor="middle" fill="#71B2DF" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
                        Your Location
                      </text>
                    </g>
                  );
                })()
              )}

              {/* Hospital Nodes */}
              {filteredHospitals.map(({ hospital, distanceKm, etaMinutes }) => {
                const pos = projectToSvg(hospital.latitude, hospital.longitude);
                const isSelected = hospital.id === activeSelectedHospital?.id;
                const isRecommended = hospital.id === recommendedHospitalId;
                const isRequesting = hospital.id === requestingHospitalId;
                const isRoutingTarget = hospital.id === activeRoutingTarget?.id;

                let nodeColor = '#8C947A';
                if (isRequesting) nodeColor = '#D98C71';
                else if (isRecommended) nodeColor = '#5F8575';
                else if (isSelected) nodeColor = '#A4AC91';

                const icu = hospital.resources.find((r) => r.type === 'icu')?.availableQuantity || 0;

                return (
                  <g
                    key={hospital.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveInfoWindowHospital(hospital);
                      setSelectedMapHospitalId(hospital.id);
                    }}
                    className="cursor-pointer transition-transform hover:scale-110"
                  >
                    {/* Pulsing ring for recommended or target */}
                    {(isRecommended || isRoutingTarget || isRequesting) && (
                      <circle r="24" fill={nodeColor} fillOpacity="0.25" className="animate-pulse" />
                    )}

                    {/* Outer Node Shield */}
                    <circle
                      r="16"
                      fill="#2A2F24"
                      stroke={nodeColor}
                      strokeWidth={isSelected || isRecommended ? 3 : 2}
                    />

                    {/* Node Core */}
                    <circle r="8" fill={nodeColor} />

                    {/* Hospital Name & Quick Info Tag */}
                    <rect
                      x="-65"
                      y="20"
                      width="130"
                      height="26"
                      rx="8"
                      fill="#1E221B"
                      fillOpacity="0.95"
                      stroke={isSelected ? nodeColor : '#3D4435'}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="33"
                      textAnchor="middle"
                      fill="#F9F7F2"
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {hospital.name.length > 17 ? `${hospital.name.slice(0, 16)}…` : hospital.name}
                    </text>
                    <text
                      x="0"
                      y="43"
                      textAnchor="middle"
                      fill="#A6AC9B"
                      fontSize="8"
                      fontFamily="monospace"
                    >
                      {icu} ICU &bull; {distanceKm.toFixed(1)}km ({etaMinutes}m)
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Float Popover Inspector on Canvas */}
            {activeInfoWindowHospital && (
              <div className="absolute bottom-5 left-5 right-5 sm:right-auto sm:max-w-sm bg-[#1E221B]/95 backdrop-blur-md border border-[#3E4336] p-4 rounded-2xl shadow-xl z-30 text-[#F9F7F2]">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-serif font-bold text-sm text-white">
                        {activeInfoWindowHospital.name}
                      </span>
                      {activeInfoWindowHospital.verificationStatus === 'verified' && (
                        <ShieldCheck className="w-4 h-4 text-[#8C947A]" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#A6AC9B] mt-0.5">
                      {activeInfoWindowHospital.address}, {activeInfoWindowHospital.city}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveInfoWindowHospital(null)}
                    className="p-1 text-[#A6AC9B] hover:text-white rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Resource Meters */}
                <div className="grid grid-cols-3 gap-2 my-3 text-center">
                  <div className="p-2 rounded-xl bg-[#282E22] border border-[#384030]">
                    <div className="text-[10px] text-[#A6AC9B]">ICU Beds</div>
                    <div className="font-mono font-bold text-sm text-[#8C947A]">
                      {activeInfoWindowHospital.resources.find((r) => r.type === 'icu')?.availableQuantity ?? 0}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#282E22] border border-[#384030]">
                    <div className="text-[10px] text-[#A6AC9B]">Ventilators</div>
                    <div className="font-mono font-bold text-sm text-[#71B2DF]">
                      {activeInfoWindowHospital.resources.find((r) => r.type === 'ventilator')?.availableQuantity ?? 0}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#282E22] border border-[#384030]">
                    <div className="text-[10px] text-[#A6AC9B]">O- Blood</div>
                    <div className="font-mono font-bold text-sm text-[#D98C71]">
                      {activeInfoWindowHospital.bloodInventory.find((b) => b.group === 'O-')?.unitsAvailable ?? 0}u
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-[#384030]">
                  <button
                    onClick={() => {
                      if (onSelectHospital) onSelectHospital(activeInfoWindowHospital.id);
                      else switchHospital(activeInfoWindowHospital.id);
                    }}
                    className="flex-1 py-1.5 px-2 bg-[#3A3D34] hover:bg-[#4A4E43] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer text-center"
                  >
                    Switch Node
                  </button>
                  <button
                    onClick={() => handleTriggerRoute(activeInfoWindowHospital)}
                    className="flex-1 py-1.5 px-2 bg-[#5F8575] hover:bg-[#4E6F62] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Route className="w-3.5 h-3.5" />
                    <span>Route</span>
                  </button>
                  {onRequestTransfer && (
                    <button
                      onClick={() => onRequestTransfer(activeInfoWindowHospital.id)}
                      className="py-1.5 px-3 bg-[#D98C71] hover:bg-[#C87D55] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Transfer
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          <div className="flex items-center justify-between px-5 py-2.5 border-t border-[#3E4336] bg-[#1E221B] text-[11px] text-[#A6AC9B]">
            <span>Click any node to inspect resource meters or establish an emergency corridor</span>
            <span className="text-[#8C947A] font-mono">Ref: {referencePoint.label}</span>
          </div>
        </div>

        {/* Right: Hospital Directory Cards List */}
        {!compact && (
          <div className="lg:col-span-5 space-y-3.5">
            <div className="flex items-center justify-between text-xs text-[#707565]">
              <span className="font-semibold text-[#3A3D34]">
                Directory Facilities ({filteredHospitals.length})
              </span>
              <span>Sorted by Proximity</span>
            </div>

            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {filteredHospitals.map(({ hospital, distanceKm, etaMinutes }) => {
                const isSelected = hospital.id === activeSelectedHospital?.id;
                const isRecommended = hospital.id === recommendedHospitalId;
                const icu = hospital.resources.find((r) => r.type === 'icu')?.availableQuantity || 0;
                const oNeg = hospital.bloodInventory.find((b) => b.group === 'O-')?.unitsAvailable || 0;

                return (
                  <div
                    key={hospital.id}
                    onClick={() => {
                      setSelectedMapHospitalId(hospital.id);
                      setActiveInfoWindowHospital(hospital);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#8C947A] shadow-md ring-2 ring-[#8C947A]/20'
                        : isRecommended
                        ? 'bg-[#F4F7F2] border-[#5F8575] shadow-xs'
                        : 'bg-white border-[#E5E0D5] hover:border-[#8C947A] shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-serif font-bold text-sm text-[#3A3D34]">
                            {hospital.name}
                          </h4>
                          {isRecommended && (
                            <span className="bg-[#5F8575] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              TOP MATCH
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#707565] mt-0.5">
                          {hospital.type} &bull; {hospital.city}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-[#3A3D34]">
                          {distanceKm.toFixed(1)} km
                        </div>
                        <div className="text-[11px] text-[#5F8575] font-semibold">
                          ~{etaMinutes} min ETA
                        </div>
                      </div>
                    </div>

                    {/* Resources Row */}
                    <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#F1EDE4] text-xs">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F9F7F2] text-[#3A3D34] font-medium text-[11px]">
                        <Bed className="w-3 h-3 text-[#8C947A]" />
                        {icu} ICU Beds
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F9F7F2] text-[#3A3D34] font-medium text-[11px]">
                        <HeartPulse className="w-3 h-3 text-[#D98C71]" />
                        {oNeg}u O- Blood
                      </span>
                      <span className="ml-auto">
                        <VerificationBadge status={hospital.verificationStatus} />
                      </span>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectHospital) onSelectHospital(hospital.id);
                          else switchHospital(hospital.id);
                        }}
                        className="flex-1 py-1.5 rounded-xl bg-[#F1EDE4] hover:bg-[#EAE4D8] text-[#3A3D34] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Select Node
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTriggerRoute(hospital);
                        }}
                        className="py-1.5 px-3 rounded-xl bg-[#5F8575] hover:bg-[#4E6F62] text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Route className="w-3.5 h-3.5" />
                        <span>Corridor</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
