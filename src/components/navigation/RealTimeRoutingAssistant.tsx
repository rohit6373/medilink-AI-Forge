import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Navigation,
  Route as RouteIcon,
  MapPin,
  Clock,
  Truck,
  Building2,
  Sparkles,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Plus,
  Trash2,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  AlertTriangle,
  LocateFixed,
  Zap,
  Radio,
  ArrowRight,
} from 'lucide-react';
import { Hospital } from '../../types';
import { useMediLink } from '../../context/MediLinkContext';
import { useGoogleMaps, DEFAULT_MAP_CENTER } from '../maps/GoogleMapsProvider';
import {
  fetchEmergencyRoute,
  IntermediateWaypoint,
  ItineraryStep,
  ComputedRouteResult,
} from '../../services/routesService';

interface RealTimeRoutingAssistantProps {
  initialOriginId?: string;
  initialDestinationId?: string;
  onRouteUpdated?: (result: ComputedRouteResult) => void;
  onSelectHospital?: (hospital: Hospital) => void;
}

export const RealTimeRoutingAssistant: React.FC<RealTimeRoutingAssistantProps> = ({
  initialOriginId,
  initialDestinationId,
  onRouteUpdated,
  onSelectHospital,
}) => {
  const { hospitals } = useMediLink();
  const { userLocation, requestUserLocation, isLocating } = useGoogleMaps();

  // Origin & Destination selection
  const [originType, setOriginType] = useState<'hospital' | 'gps'>('hospital');
  const [selectedOriginHospitalId, setSelectedOriginHospitalId] = useState<string>(
    initialOriginId || hospitals[0]?.id || ''
  );
  const [selectedDestHospitalId, setSelectedDestHospitalId] = useState<string>(
    initialDestinationId || hospitals[1]?.id || hospitals[0]?.id || ''
  );

  // Routing preferences & traffic mode
  const [urgencyMode, setUrgencyMode] = useState<'critical' | 'urgent' | 'standard'>('critical');
  const [routingPreference, setRoutingPreference] = useState<'TRAFFIC_AWARE_OPTIMAL' | 'TRAFFIC_AWARE'>('TRAFFIC_AWARE_OPTIMAL');

  // Mid-route intermediate stops
  const [intermediateStops, setIntermediateStops] = useState<IntermediateWaypoint[]>([
    {
      id: 'stop-blood-default',
      name: 'LifeLine Blood Logistics Hub',
      lat: 37.7695,
      lng: -122.4465,
      purpose: 'Pickup 4 Units O-Negative PRBC',
      stopType: 'blood_bank',
    },
  ]);

  const [availablePresets] = useState<IntermediateWaypoint[]>([
    {
      id: 'preset-blood-1',
      name: 'LifeLine Blood Logistics Hub',
      lat: 37.7695,
      lng: -122.4465,
      purpose: 'Load 4 Units O-Negative PRBC & 2 Plasma',
      stopType: 'blood_bank',
    },
    {
      id: 'preset-oxygen-1',
      name: 'Sunrise Central Medical Depot',
      lat: 37.783,
      lng: -122.418,
      purpose: 'Collect High-Flow Ventilator E-Cylinders',
      stopType: 'oxygen_depot',
    },
    {
      id: 'preset-specialist-1',
      name: 'Apex Trauma Specialist Rendezvous',
      lat: 37.778,
      lng: -122.408,
      purpose: 'Intercept on-call Vascular Surgeon',
      stopType: 'specialist_pickup',
    },
  ]);

  // Route calculation state
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeResult, setRouteResult] = useState<ComputedRouteResult | null>(null);
  const [copiedItinerary, setCopiedItinerary] = useState(false);

  // Live Transit Simulation
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const simTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Resolve Origin coordinates
  const originCoord = React.useMemo(() => {
    if (originType === 'gps' && userLocation) {
      return {
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        name: 'Live GPS Location (Ambulance Unit 402)',
      };
    }
    const h = hospitals.find((h) => h.id === selectedOriginHospitalId) || hospitals[0];
    return {
      lat: h?.latitude || DEFAULT_MAP_CENTER.lat,
      lng: h?.longitude || DEFAULT_MAP_CENTER.lng,
      name: h?.name || 'Origin Medical Facility',
    };
  }, [originType, userLocation, selectedOriginHospitalId, hospitals]);

  // Resolve Destination coordinates
  const destCoord = React.useMemo(() => {
    const h = hospitals.find((h) => h.id === selectedDestHospitalId) || hospitals[1] || hospitals[0];
    return {
      lat: h?.latitude || DEFAULT_MAP_CENTER.lat + 0.02,
      lng: h?.longitude || DEFAULT_MAP_CENTER.lng + 0.02,
      name: h?.name || 'Destination Trauma Center',
    };
  }, [selectedDestHospitalId, hospitals]);

  // Execute Route Computation via modern Google Routes API v2
  const computeLiveRoute = async () => {
    setIsCalculating(true);
    try {
      const result = await fetchEmergencyRoute(
        originCoord,
        destCoord,
        urgencyMode,
        intermediateStops,
        routingPreference
      );
      setRouteResult(result);
      onRouteUpdated?.(result);
      setCurrentStepIndex(0);
      setSimulationProgress(0);
    } catch (err) {
      console.error('Error computing route:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  // Trigger computation on dependency changes
  useEffect(() => {
    computeLiveRoute();
  }, [
    originCoord.lat,
    originCoord.lng,
    destCoord.lat,
    destCoord.lng,
    urgencyMode,
    routingPreference,
    intermediateStops,
  ]);

  // Transit simulation loop
  useEffect(() => {
    if (isSimulating && routeResult?.itinerary && routeResult.itinerary.length > 0) {
      simTimerRef.current = setInterval(() => {
        setSimulationProgress((prev) => {
          const next = prev + 5;
          if (next >= 100) {
            setIsSimulating(false);
            setCurrentStepIndex(routeResult.itinerary.length - 1);
            return 100;
          }
          const stepIndex = Math.min(
            routeResult.itinerary.length - 1,
            Math.floor((next / 100) * routeResult.itinerary.length)
          );
          setCurrentStepIndex(stepIndex);
          return next;
        });
      }, 700);
    } else {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    }
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, [isSimulating, routeResult]);

  const handleToggleSimulation = () => {
    if (simulationProgress >= 100) {
      setSimulationProgress(0);
      setCurrentStepIndex(0);
    }
    setIsSimulating(!isSimulating);
  };

  const handleResetSimulation = () => {
    setIsSimulating(false);
    setSimulationProgress(0);
    setCurrentStepIndex(0);
  };

  const handleAddIntermediateStop = (preset: IntermediateWaypoint) => {
    if (intermediateStops.some((s) => s.id === preset.id)) return;
    setIntermediateStops([...intermediateStops, preset]);
  };

  const handleRemoveIntermediateStop = (id: string) => {
    setIntermediateStops(intermediateStops.filter((s) => s.id !== id));
  };

  const handleCopyItinerary = () => {
    if (!routeResult) return;
    const text = [
      `🚨 MEDILINK DISPATCH ITINERARY [${urgencyMode.toUpperCase()} PRIORITY]`,
      `From: ${originCoord.name}`,
      `To: ${destCoord.name}`,
      `Total Distance: ${routeResult.distanceKm} km | Estimated ETA: ${routeResult.durationMinutes} min`,
      `Intermediate Stops (${intermediateStops.length}): ${intermediateStops.map((s) => s.name).join(', ') || 'Direct'}`,
      `Live Traffic Status: ${routeResult.trafficCondition || 'Optimal Traffic Corridor'}`,
      '\nSTEP-BY-STEP MANEUVERS:',
      ...routeResult.itinerary.map(
        (step, i) => `${i + 1}. [${step.distanceText} / ${step.durationText}] ${step.instruction}`
      ),
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedItinerary(true);
    setTimeout(() => setCopiedItinerary(false), 2500);
  };

  // Maneuver icon resolver
  const renderManeuverIcon = (maneuver?: string, isStop?: boolean) => {
    if (isStop) {
      return <MapPin className="w-4 h-4 text-[#D98C71]" />;
    }
    switch (maneuver) {
      case 'TURN_RIGHT':
        return <CornerUpRight className="w-4 h-4 text-[#8C947A]" />;
      case 'TURN_LEFT':
        return <CornerUpLeft className="w-4 h-4 text-[#8C947A]" />;
      case 'MERGE':
        return <Zap className="w-4 h-4 text-[#5F8575]" />;
      case 'ARRIVE':
        return <Check className="w-4 h-4 text-[#5F8575]" />;
      case 'DEPART':
        return <Truck className="w-4 h-4 text-[#8C947A]" />;
      default:
        return <ArrowUp className="w-4 h-4 text-[#707565]" />;
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-[#E5E2D9] shadow-sm p-6 sm:p-8 space-y-6">
      {/* Header with Live Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E2D9] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F1EDE4] text-[#8C947A] flex items-center justify-center border border-[#DCD7CD]">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-serif font-bold text-[#3A3D34]">
                Real-Time Navigation & Routing Assistant
              </h3>
              <span className="bg-[#F1F3EB] text-[#5F8575] border border-[#D9E2D5] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Google Routes v2
              </span>
            </div>
            <p className="text-xs text-[#707565]">
              Live traffic-optimized emergency routing, multi-stop supply logistics, and step-by-step turn guidance.
            </p>
          </div>
        </div>

        <button
          onClick={computeLiveRoute}
          disabled={isCalculating}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F9F7F2] hover:bg-[#F1EDE4] text-[#3A3D34] text-xs font-semibold border border-[#E5E2D9] transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#8C947A] ${isCalculating ? 'animate-spin' : ''}`} />
          <span>{isCalculating ? 'Computing Path...' : 'Recalculate Path'}</span>
        </button>
      </div>

      {/* Origin & Destination Configuration Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Origin Selector */}
        <div className="p-4 rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#707565] flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#8C947A]" />
              <span>Route Origin</span>
            </span>
            <div className="flex items-center gap-1 text-[10px]">
              <button
                onClick={() => setOriginType('hospital')}
                className={`px-2 py-0.5 rounded-full font-semibold ${
                  originType === 'hospital' ? 'bg-[#3A3D34] text-white' : 'text-[#707565]'
                }`}
              >
                Facility
              </button>
              <button
                onClick={async () => {
                  setOriginType('gps');
                  await requestUserLocation();
                }}
                className={`px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                  originType === 'gps' ? 'bg-[#3A3D34] text-white' : 'text-[#707565]'
                }`}
              >
                <LocateFixed className="w-3 h-3" />
                <span>Live GPS</span>
              </button>
            </div>
          </div>

          {originType === 'hospital' ? (
            <select
              value={selectedOriginHospitalId}
              onChange={(e) => setSelectedOriginHospitalId(e.target.value)}
              className="w-full bg-white border border-[#DCD7CD] rounded-xl px-3 py-2 text-xs font-serif font-bold text-[#3A3D34] focus:outline-none focus:border-[#8C947A]"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.city})
                </option>
              ))}
            </select>
          ) : (
            <div className="p-2 bg-white rounded-xl border border-[#DCD7CD] text-xs flex items-center justify-between text-[#3A3D34]">
              <span className="truncate">
                {userLocation
                  ? `GPS: ${userLocation.latitude.toFixed(4)}° N, ${userLocation.longitude.toFixed(4)}° W`
                  : isLocating
                  ? 'Acquiring GPS Fix...'
                  : 'GPS Ready'}
              </span>
              <button
                onClick={requestUserLocation}
                className="text-[10px] text-[#8C947A] font-semibold hover:underline"
              >
                Refresh GPS
              </button>
            </div>
          )}
        </div>

        {/* Destination Selector */}
        <div className="p-4 rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#707565] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#D98C71]" />
              <span>Target Hospital / Trauma Center</span>
            </span>
          </div>

          <select
            value={selectedDestHospitalId}
            onChange={(e) => {
              setSelectedDestHospitalId(e.target.value);
              const found = hospitals.find((h) => h.id === e.target.value);
              if (found) onSelectHospital?.(found);
            }}
            className="w-full bg-white border border-[#DCD7CD] rounded-xl px-3 py-2 text-xs font-serif font-bold text-[#3A3D34] focus:outline-none focus:border-[#8C947A]"
          >
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} • {h.resources.find((r) => r.type === 'icu')?.availableQuantity || 0} ICU Beds Available
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Traffic & Priority Corridor Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Urgency & Corridor Mode */}
        <div className="flex items-center justify-between p-3 bg-[#F9F7F2] rounded-2xl border border-[#E5E2D9] text-xs">
          <span className="font-semibold text-[#707565]">Transit Mode:</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setUrgencyMode('critical')}
              className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                urgencyMode === 'critical'
                  ? 'bg-[#D98C71] text-white shadow-xs'
                  : 'bg-white text-[#707565] border border-[#E5E2D9]'
              }`}
            >
              🚨 Siren Corridor
            </button>
            <button
              onClick={() => setUrgencyMode('urgent')}
              className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                urgencyMode === 'urgent'
                  ? 'bg-[#8C947A] text-white shadow-xs'
                  : 'bg-white text-[#707565] border border-[#E5E2D9]'
              }`}
            >
              ⚡ Fast Traffic
            </button>
          </div>
        </div>

        {/* Routing Engine Preference */}
        <div className="flex items-center justify-between p-3 bg-[#F9F7F2] rounded-2xl border border-[#E5E2D9] text-xs">
          <span className="font-semibold text-[#707565]">Live Traffic Model:</span>
          <div className="flex items-center gap-1 text-[11px]">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F1F3EB] text-[#5F8575] font-semibold border border-[#D9E2D5]">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>Traffic-Aware Optimal</span>
            </span>
          </div>
        </div>
      </div>

      {/* Mid-Route Stops / Waypoints Management */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#D98C71]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#3A3D34]">
              Mid-Route Emergency Stops & Inventory Pickups ({intermediateStops.length})
            </span>
          </div>
          <span className="text-[11px] text-[#707565]">Auto-sequenced into route geometry</span>
        </div>

        {/* Active intermediate stops list */}
        {intermediateStops.length === 0 ? (
          <div className="p-3 bg-white rounded-xl border border-dashed border-[#DCD7CD] text-center text-xs text-[#707565]">
            Direct nonstop transfer selected. Add intermediate supply stops below if blood or ventilator replenishment is required.
          </div>
        ) : (
          <div className="space-y-2">
            {intermediateStops.map((stop, idx) => (
              <div
                key={stop.id}
                className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#E5E2D9] text-xs shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#FAF0ED] text-[#D98C71] font-bold text-[10px] flex items-center justify-center border border-[#F0D5CB]">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-[#3A3D34]">{stop.name}</div>
                    <div className="text-[11px] text-[#707565]">{stop.purpose}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveIntermediateStop(stop.id)}
                  className="p-1 text-[#707565] hover:text-[#D98C71] transition-colors cursor-pointer"
                  title="Remove stop"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Available Presets to Add */}
        <div className="pt-2 border-t border-[#E5E2D9]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#707565]">
            Recommended Emergency Intercept Presets:
          </span>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {availablePresets.map((preset) => {
              const isAdded = intermediateStops.some((s) => s.id === preset.id);
              return (
                <button
                  key={preset.id}
                  onClick={() => handleAddIntermediateStop(preset)}
                  disabled={isAdded}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    isAdded
                      ? 'bg-[#F1EDE4] text-[#8A8D82] border border-[#DCD7CD] cursor-default'
                      : 'bg-white hover:bg-[#F1F3EB] text-[#3A3D34] border border-[#DCD7CD] hover:border-[#8C947A]'
                  }`}
                >
                  <Plus className="w-3 h-3 text-[#8C947A]" />
                  <span>{preset.name.split(' ')[0]} ({preset.stopType === 'blood_bank' ? 'Blood' : preset.stopType === 'oxygen_depot' ? 'O2' : 'Surgeon'})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Calculated Route Overview Metrics Banner */}
      {routeResult && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#2A2D25] text-white border border-[#4A4E43]">
          <div>
            <div className="text-[10px] text-[#DCD7CD] uppercase tracking-wider">Total Distance</div>
            <div className="text-xl font-serif font-bold text-[#F9F7F2] mt-0.5">
              {routeResult.distanceKm} km
            </div>
            <div className="text-[10px] text-[#8A8D82]">{routeResult.legsCount || 1} Transit Legs</div>
          </div>

          <div>
            <div className="text-[10px] text-[#DCD7CD] uppercase tracking-wider">Estimated Transit ETA</div>
            <div className="text-xl font-serif font-bold text-[#8C947A] mt-0.5">
              {routeResult.durationMinutes} min
            </div>
            <div className="text-[10px] text-[#8C947A]">Siren Preemption Active</div>
          </div>

          <div>
            <div className="text-[10px] text-[#DCD7CD] uppercase tracking-wider">Traffic Condition</div>
            <div className="text-sm font-bold text-[#5F8575] mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#5F8575] animate-ping" />
              <span>Optimal Flow</span>
            </div>
            <div className="text-[10px] text-[#DCD7CD]">Green Wave Enabled</div>
          </div>

          <div>
            <div className="text-[10px] text-[#DCD7CD] uppercase tracking-wider">Route Protocol</div>
            <div className="text-xs font-bold text-[#F9F7F2] mt-1 truncate">
              Priority Emergency Corridor
            </div>
            <div className="text-[10px] text-[#8A8D82]">Live Bounds Fitted</div>
          </div>
        </div>
      )}

      {/* Transit Simulation Control Bar */}
      {routeResult && routeResult.itinerary.length > 0 && (
        <div className="p-4 bg-[#F9F7F2] rounded-2xl border border-[#E5E2D9] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#8C947A]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#3A3D34]">
                Active Route Transit Tracker ({Math.round(simulationProgress)}%)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleSimulation}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3A3D34] hover:bg-[#2A2D25] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isSimulating ? 'Pause Transit' : simulationProgress >= 100 ? 'Replay' : 'Simulate Transit'}</span>
              </button>

              <button
                onClick={handleResetSimulation}
                className="p-1 text-[#707565] hover:text-[#3A3D34] transition-colors cursor-pointer"
                title="Reset simulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-[#E5E2D9] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#8C947A]"
              animate={{ width: `${simulationProgress}%` }}
              transition={{ ease: 'linear', duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Structured Step-by-Step Turn-by-Turn Itinerary */}
      {routeResult && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RouteIcon className="w-4 h-4 text-[#8C947A]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#3A3D34]">
                Structured Step-by-Step Itinerary ({routeResult.itinerary.length} Maneuvers)
              </span>
            </div>

            <button
              onClick={handleCopyItinerary}
              className="flex items-center gap-1 text-xs text-[#707565] hover:text-[#3A3D34] font-semibold cursor-pointer"
            >
              {copiedItinerary ? <Check className="w-3.5 h-3.5 text-[#5F8575]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedItinerary ? 'Itinerary Copied!' : 'Copy Dispatch Plan'}</span>
            </button>
          </div>

          {/* Step list container */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {routeResult.itinerary.map((step, idx) => {
              const isActive = isSimulating && currentStepIndex === idx;
              const isPast = isSimulating && currentStepIndex > idx;

              return (
                <div
                  key={step.id}
                  className={`p-3.5 rounded-2xl border transition-all text-xs flex items-start justify-between gap-3 ${
                    step.isStop
                      ? 'bg-[#FAF0ED] border-[#F0D5CB] text-[#3A3D34]'
                      : isActive
                      ? 'bg-[#F1F3EB] border-[#8C947A] shadow-xs'
                      : isPast
                      ? 'bg-white/60 border-[#E5E2D9] opacity-75'
                      : 'bg-white border-[#E5E2D9]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                        step.isStop
                          ? 'bg-[#FAF0ED] text-[#D98C71] border-[#F0D5CB]'
                          : isActive
                          ? 'bg-[#8C947A] text-white border-[#8C947A]'
                          : 'bg-[#F1EDE4] text-[#707565] border-[#DCD7CD]'
                      }`}
                    >
                      {renderManeuverIcon(step.maneuver, step.isStop)}
                    </div>

                    <div className="space-y-1">
                      <div className={`font-medium ${step.isStop ? 'font-bold text-[#D98C71]' : 'text-[#3A3D34]'}`}>
                        {step.instruction}
                      </div>

                      {step.isStop && step.stopPurpose && (
                        <div className="inline-block bg-white px-2 py-0.5 rounded-md text-[10px] text-[#707565] border border-[#F0D5CB]">
                          📋 Checklist: {step.stopPurpose}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-serif font-bold text-[#3A3D34]">{step.distanceText}</div>
                    <div className="text-[10px] text-[#707565]">{step.durationText}</div>
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
