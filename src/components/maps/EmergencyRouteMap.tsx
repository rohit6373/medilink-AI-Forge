import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck,
  Navigation,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Building2,
  Activity,
  ShieldCheck,
  Compass,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { Hospital, Ambulance } from '../../types';
import { calculateDistanceKm, estimateEtaMinutes } from '../../services/aiService';
import { fetchEmergencyRoute, LatLngPoint, ItineraryStep } from '../../services/routesService';

interface EmergencyRouteMapProps {
  originHospital: Hospital;
  destinationHospital: Hospital;
  ambulance?: Partial<Ambulance>;
  emergencyType?: string;
  urgency?: string;
  onArrived?: () => void;
}

export const EmergencyRouteMap: React.FC<EmergencyRouteMapProps> = ({
  originHospital,
  destinationHospital,
  ambulance,
  emergencyType = 'Trauma / Critical Transfer',
  urgency = 'critical',
  onArrived,
}) => {
  // Transit Animation State
  const [progress, setProgress] = useState(0.18); // 0 to 1
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  // Route calculation data
  const [routePath, setRoutePath] = useState<LatLngPoint[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryStep[]>([]);
  const [realDistanceKm, setRealDistanceKm] = useState<number | null>(null);
  const [realDurationMins, setRealDurationMins] = useState<number | null>(null);

  // Compute route corridor
  useEffect(() => {
    let isCancelled = false;

    async function computeRoute() {
      const result = await fetchEmergencyRoute(
        { lat: originHospital.latitude, lng: originHospital.longitude, name: originHospital.name },
        { lat: destinationHospital.latitude, lng: destinationHospital.longitude, name: destinationHospital.name },
        urgency
      );

      if (isCancelled) return;
      setRealDistanceKm(result.distanceKm);
      setRealDurationMins(result.durationMinutes);
      setRoutePath(result.path);
      setItinerary(result.itinerary);
    }

    computeRoute();

    return () => {
      isCancelled = true;
    };
  }, [originHospital, destinationHospital, urgency]);

  // Fallback calculations using Haversine
  const fallbackDistanceKm = calculateDistanceKm(
    originHospital.latitude,
    originHospital.longitude,
    destinationHospital.latitude,
    destinationHospital.longitude
  );
  const fallbackEtaMinutes = estimateEtaMinutes(fallbackDistanceKm, urgency);

  const displayTotalDistanceKm = realDistanceKm ?? fallbackDistanceKm;
  const displayBaseEtaMinutes = realDurationMins ?? fallbackEtaMinutes;

  // Animated progress loop
  useEffect(() => {
    let animationFrame: number;
    let lastTime = performance.now();

    const updateProgress = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isPlaying) {
        setProgress((prev) => {
          const step = delta * 0.04 * speedMultiplier;
          const next = prev + step;
          if (next >= 1) {
            setIsPlaying(false);
            if (onArrived) onArrived();
            return 1;
          }
          return next;
        });
      }

      animationFrame = requestAnimationFrame(updateProgress);
    };

    animationFrame = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, speedMultiplier, onArrived]);

  // Dynamic remaining ETA calculation
  const etaRemainingMinutes = Math.max(0, Math.round(displayBaseEtaMinutes * (1 - progress)));

  const handleResetRoute = () => {
    setProgress(0);
    setIsPlaying(true);
  };

  const vehicleId = ambulance?.vehicleNumber || 'MED-ALS-104';
  const vehicleType = ambulance?.type || 'Advanced Life Support (ALS)';

  // Calculate coordinates along corridor for the SVG curve
  // Normalized 700 x 360 SVG view
  const svgCorridor = useMemo(() => {
    const startX = 90;
    const startY = 260;
    const endX = 610;
    const endY = 90;
    const ctrl1X = 260;
    const ctrl1Y = 320;
    const ctrl2X = 440;
    const ctrl2Y = 60;

    // Cubic bezier interpolation at t = progress
    const t = progress;
    const cx = 3 * (ctrl1X - startX);
    const bx = 3 * (ctrl2X - ctrl1X) - cx;
    const ax = endX - startX - cx - bx;

    const cy = 3 * (ctrl1Y - startY);
    const by = 3 * (ctrl2Y - ctrl1Y) - cy;
    const ay = endY - startY - cy - by;

    const ambX = ax * Math.pow(t, 3) + bx * Math.pow(t, 2) + cx * t + startX;
    const ambY = ay * Math.pow(t, 3) + by * Math.pow(t, 2) + cy * t + startY;

    // Tangent angle
    const dx = 3 * ax * Math.pow(t, 2) + 2 * bx * t + cx;
    const dy = 3 * ay * Math.pow(t, 2) + 2 * by * t + cy;
    const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

    return {
      startX,
      startY,
      endX,
      endY,
      ctrl1X,
      ctrl1Y,
      ctrl2X,
      ctrl2Y,
      ambX,
      ambY,
      angleDeg,
      pathString: `M ${startX} ${startY} C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${endX} ${endY}`,
    };
  }, [progress]);

  return (
    <div className="space-y-4">
      {/* Route Status HUD */}
      <div className="bg-[#2D3128] text-[#F9F7F2] rounded-3xl p-5 sm:p-6 border border-[#3E4336] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D98C71] text-white flex items-center justify-center font-bold shrink-0 animate-pulse">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                  Active Emergency Corridor: {vehicleId}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D98C71] text-white uppercase tracking-wider">
                  {progress >= 1 ? 'ARRIVED AT DESTINATION' : 'EN ROUTE (PRIORITY WAVE)'}
                </span>
              </div>
              <p className="text-xs text-[#A6AC9B] mt-0.5">
                {vehicleType} &bull; Dispatch for {emergencyType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="text-right">
              <span className="text-[10px] uppercase text-[#8A8D82] font-semibold">Corridor ETA</span>
              <div className="text-xl font-serif font-bold text-[#8C947A]">
                {progress >= 1 ? '0 min' : `${etaRemainingMinutes} min`}
              </div>
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-xl bg-[#3E4336] hover:bg-[#4E5445] text-white transition-colors cursor-pointer"
              title={isPlaying ? 'Pause Transit' : 'Resume Transit'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-[#8C947A]" />}
            </button>

            <button
              onClick={handleResetRoute}
              className="p-2.5 rounded-xl bg-[#3E4336] hover:bg-[#4E5445] text-white transition-colors cursor-pointer"
              title="Re-run Transit Simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Telemetry */}
        <div className="space-y-2 pt-2 border-t border-[#3E4336]">
          <div className="flex items-center justify-between text-xs text-[#DCD7CD]">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#D98C71] animate-ping" />
              <span>
                {originHospital.name} &rarr; {destinationHospital.name}
              </span>
            </div>
            <div className="font-mono text-[11px] text-[#A6AC9B]">
              {(displayTotalDistanceKm * progress).toFixed(1)} / {displayTotalDistanceKm.toFixed(1)} km &bull; {Math.round(progress * 100)}% Traversed
            </div>
          </div>

          <div className="w-full bg-[#1E221B] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#3E4336]">
            <div
              className="bg-gradient-to-r from-[#8C947A] via-[#D98C71] to-[#5F8575] h-full rounded-full transition-all duration-100 ease-out"
              style={{ width: `${Math.min(100, Math.max(2, progress * 100))}%` }}
            />
          </div>

          {/* Telemetry Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
            <div className="bg-[#1E221B] p-2 rounded-xl border border-[#3E4336] flex items-center justify-between">
              <span className="text-[#8A8D82]">Transit Speed:</span>
              <span className="font-mono font-bold text-[#8C947A]">
                {progress >= 1 ? '0 km/h' : urgency === 'critical' ? '68 km/h (Priority)' : '48 km/h'}
              </span>
            </div>

            <div className="bg-[#1E221B] p-2 rounded-xl border border-[#3E4336] flex items-center justify-between">
              <span className="text-[#8A8D82]">Optical Siren:</span>
              <span className="font-mono font-bold text-[#5F8575] flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#5F8575]" /> ACTIVE
              </span>
            </div>

            <div className="bg-[#1E221B] p-2 rounded-xl border border-[#3E4336] flex items-center justify-between">
              <span className="text-[#8A8D82]">Green Wave:</span>
              <span className="font-mono font-bold text-[#D98C71] flex items-center gap-1">
                <Radio className="w-3 h-3 text-[#D98C71]" /> PREEMPTED
              </span>
            </div>

            <div className="bg-[#1E221B] p-2 rounded-xl border border-[#3E4336] flex items-center justify-between">
              <span className="text-[#8A8D82]">Sim Speed:</span>
              <button
                onClick={() => setSpeedMultiplier((s) => (s === 1 ? 2 : s === 2 ? 4 : 1))}
                className="font-mono font-bold text-white hover:text-[#8C947A] cursor-pointer"
              >
                {speedMultiplier}x Speed &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Emergency Priority Corridor Visualizer Canvas */}
      <div className="h-[360px] sm:h-[420px] rounded-3xl overflow-hidden border border-[#3E4336] bg-[#1E221B] relative shadow-md">
        <svg
          className="w-full h-full"
          viewBox="0 0 700 360"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="corridorGrid" width="35" height="35" patternUnits="userSpaceOnUse">
              <path d="M 35 0 L 0 0 0 35" fill="none" stroke="#2A2F24" strokeWidth="0.75" />
            </pattern>
            {/* Glow Filter */}
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid */}
          <rect width="700" height="360" fill="#1E221B" />
          <rect width="700" height="360" fill="url(#corridorGrid)" />

          {/* Highway Corridor Buffer Band */}
          <path
            d={svgCorridor.pathString}
            fill="none"
            stroke="#2B3124"
            strokeWidth="32"
            strokeLinecap="round"
          />
          <path
            d={svgCorridor.pathString}
            fill="none"
            stroke="#384030"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Active Priority Signal Corridor (Glowing Line) */}
          <path
            d={svgCorridor.pathString}
            fill="none"
            stroke="#D98C71"
            strokeWidth="4"
            strokeDasharray="8,5"
            filter="url(#routeGlow)"
            className="animate-pulse"
          />

          {/* Traversed Track (Solid Green) */}
          <path
            d={svgCorridor.pathString}
            fill="none"
            stroke="#5F8575"
            strokeWidth="4"
            strokeDasharray={`${Math.max(1, 800 * progress)}, 1000`}
          />

          {/* Origin Facility Node */}
          <g transform={`translate(${svgCorridor.startX}, ${svgCorridor.startY})`}>
            <circle r="18" fill="#2A2F24" stroke="#8C947A" strokeWidth="2.5" />
            <circle r="8" fill="#8C947A" />
            <rect
              x="-60"
              y="24"
              width="120"
              height="28"
              rx="8"
              fill="#2A2F24"
              stroke="#3E4336"
              strokeWidth="1"
            />
            <text x="0" y="38" textAnchor="middle" fill="#F9F7F2" fontSize="10" fontWeight="bold">
              {originHospital.name.length > 16 ? `${originHospital.name.slice(0, 15)}…` : originHospital.name}
            </text>
            <text x="0" y="48" textAnchor="middle" fill="#8C947A" fontSize="8" fontFamily="monospace">
              DISPATCH ORIGIN
            </text>
          </g>

          {/* Destination Facility Node */}
          <g transform={`translate(${svgCorridor.endX}, ${svgCorridor.endY})`}>
            <circle r="22" fill="#5F8575" fillOpacity="0.2" className="animate-ping" />
            <circle r="18" fill="#2A2F24" stroke="#5F8575" strokeWidth="3" />
            <circle r="8" fill="#5F8575" />
            <rect
              x="-65"
              y="-42"
              width="130"
              height="28"
              rx="8"
              fill="#2A2F24"
              stroke="#5F8575"
              strokeWidth="1"
            />
            <text x="0" y="-28" textAnchor="middle" fill="#F9F7F2" fontSize="10" fontWeight="bold">
              {destinationHospital.name.length > 17 ? `${destinationHospital.name.slice(0, 16)}…` : destinationHospital.name}
            </text>
            <text x="0" y="-18" textAnchor="middle" fill="#5F8575" fontSize="8" fontFamily="monospace" fontWeight="bold">
              TRAUMA RECEIVING BAY
            </text>
          </g>

          {/* Intermediate Checkpoint Waypoint 1 */}
          <g transform="translate(270, 240)">
            <circle r="5" fill="#3E4336" stroke="#8A8D82" strokeWidth="1.5" />
            <text x="0" y="-10" textAnchor="middle" fill="#8A8D82" fontSize="8" fontFamily="monospace">
              Sector 4 Express Lane
            </text>
          </g>

          {/* Intermediate Checkpoint Waypoint 2 */}
          <g transform="translate(460, 130)">
            <circle r="5" fill="#3E4336" stroke="#8A8D82" strokeWidth="1.5" />
            <text x="0" y="-10" textAnchor="middle" fill="#8A8D82" fontSize="8" fontFamily="monospace">
              Hospital Transit Gate
            </text>
          </g>

          {/* Moving Ambulance Beacon */}
          <g
            transform={`translate(${svgCorridor.ambX}, ${svgCorridor.ambY}) rotate(${svgCorridor.angleDeg})`}
          >
            {/* Siren Ping Wave */}
            <circle r="20" fill="#D98C71" fillOpacity="0.3" className="animate-ping" />
            {/* Ambulance Body */}
            <rect
              x="-16"
              y="-10"
              width="32"
              height="20"
              rx="5"
              fill="#D98C71"
              stroke="#FFFFFF"
              strokeWidth="2"
              filter="url(#routeGlow)"
            />
            {/* Siren Light */}
            <circle cx="2" cy="0" r="3" fill="#FFFFFF" className="animate-pulse" />
            {/* Vehicle Front Windshield */}
            <rect x="8" y="-7" width="5" height="14" rx="2" fill="#2A2F24" />
          </g>

          {/* Static Ambulance Label Tag above icon */}
          <g transform={`translate(${svgCorridor.ambX}, ${svgCorridor.ambY - 26})`}>
            <rect
              x="-45"
              y="-10"
              width="90"
              height="20"
              rx="6"
              fill="#1E221B"
              fillOpacity="0.95"
              stroke="#D98C71"
              strokeWidth="1"
            />
            <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">
              {progress >= 1 ? 'ARRIVED' : `${vehicleId} • ${etaRemainingMinutes}m`}
            </text>
          </g>
        </svg>

        {/* Live Overlay HUD Info */}
        <div className="absolute top-4 left-4 bg-[#1E221B]/90 backdrop-blur-sm border border-[#3E4336] px-3 py-1.5 rounded-xl text-[11px] text-[#A6AC9B] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#5F8575] animate-pulse" />
          <span>Priority Green Wave Active &bull; Emergency Corridor Priority</span>
        </div>
      </div>

      {/* Itinerary Steps Breakdown */}
      {itinerary.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-[#E5E0D5] shadow-xs space-y-3">
          <h4 className="font-serif font-bold text-sm text-[#3A3D34] flex items-center gap-2">
            <Navigation className="w-4 h-4 text-[#8C947A]" />
            <span>Turn-by-Turn Emergency Navigation Corridor</span>
          </h4>
          <div className="space-y-2">
            {itinerary.map((step, idx) => {
              const isPast = progress > (idx + 1) / itinerary.length;
              return (
                <div
                  key={step.id || idx}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                    isPast
                      ? 'bg-[#F9F7F2] border-[#E5E0D5] text-[#8A8D82]'
                      : 'bg-white border-[#8C947A] text-[#3A3D34] font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#3A3D34] text-white flex items-center justify-center text-[10px] font-mono shrink-0">
                      {idx + 1}
                    </span>
                    <span>{step.instruction}</span>
                  </div>
                  <div className="font-mono text-[11px] text-[#707565] shrink-0 ml-3">
                    {step.distanceText} &bull; {step.durationText}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
