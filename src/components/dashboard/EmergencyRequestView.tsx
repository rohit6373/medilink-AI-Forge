import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Flame,
  Heart,
  Wind,
  Brain,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  MapPin,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { useMediLink } from '../../context/MediLinkContext';
import {
  EmergencyCategory,
  UrgencyLevel,
  EmergencyRequest,
  HospitalMatchResult,
  AiRecommendationResponse,
} from '../../types';
import { ConfidenceBadge } from '../common/StatusBadge';
import { getAiRecommendations } from '../../services/aiService';
import { EmergencyRouteMap } from '../maps/EmergencyRouteMap';
import { X } from 'lucide-react';

export const EmergencyRequestView: React.FC<{ onNavigateToOutgoing: () => void }> = ({ onNavigateToOutgoing }) => {
  const { currentHospital, hospitals, createEmergencyRequest, sendRequestToHospital } = useMediLink();
  const [routePreviewHospital, setRoutePreviewHospital] = useState<HospitalMatchResult | null>(null);

  // Form State
  const [category, setCategory] = useState<EmergencyCategory>('trauma');
  const [urgency, setUrgency] = useState<UrgencyLevel>('critical');
  const [patientAge, setPatientAge] = useState(38);
  const [patientGender, setPatientGender] = useState<'M' | 'F' | 'Other'>('M');
  const [clinicalNotes, setClinicalNotes] = useState('Severe multi-trauma MVC victim, unstable vitals, blunt thoracic trauma, requiring immediate surgical stabilization.');

  // Required Resources Checkboxes / Quantities
  const [needIcu, setNeedIcu] = useState(true);
  const [icuCount, setIcuCount] = useState(1);
  const [needBlood, setNeedBlood] = useState(true);
  const [bloodGroup, setBloodGroup] = useState('O-');
  const [bloodCount, setBloodCount] = useState(2);
  const [needVent, setNeedVent] = useState(true);
  const [ventCount, setVentCount] = useState(1);
  const [specialistType, setSpecialistType] = useState('Trauma Surgeon');

  // AI Matching state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiResult, setAiResult] = useState<AiRecommendationResponse | null>(null);
  const [dispatchedSuccess, setDispatchedSuccess] = useState<string | null>(null);

  if (!currentHospital) return null;

  const buildRequiredResources = () => {
    const list: EmergencyRequest['requiredResources'] = [];
    if (needIcu) list.push({ resourceType: 'icu', quantity: icuCount });
    if (needBlood) list.push({ resourceType: 'blood', quantity: bloodCount, bloodGroup });
    if (needVent) list.push({ resourceType: 'ventilator', quantity: ventCount });
    return list;
  };

  const handleEvaluateMatches = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEvaluating(true);
    setAiResult(null);

    const requiredResources = buildRequiredResources();
    const requiredSpecialties = specialistType && specialistType !== 'None' ? [specialistType] : [];

    const draftRequest: Partial<EmergencyRequest> = {
      emergencyType: category,
      urgency,
      requiredResources,
      requiredSpecialties,
      patientSummary: `Age: ${patientAge}, Gender: ${patientGender}. ${clinicalNotes}`,
    };

    try {
      const results = await getAiRecommendations(
        draftRequest,
        hospitals.filter((h) => h.id !== currentHospital.id),
        { latitude: currentHospital.latitude, longitude: currentHospital.longitude }
      );
      setAiResult(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleDispatchRequest = (targetMatch: HospitalMatchResult) => {
    const requiredResources = buildRequiredResources();
    const requiredSpecialties = specialistType && specialistType !== 'None' ? [specialistType] : [];

    const newReq = createEmergencyRequest({
      requestingHospitalId: currentHospital.id,
      requestingHospitalName: currentHospital.name,
      targetHospitalId: targetMatch.hospital.id,
      targetHospitalName: targetMatch.hospital.name,
      emergencyType: category,
      urgency,
      patientSummary: `Patient: ${patientAge}yo ${patientGender}. Clinical Summary: ${clinicalNotes}`,
      requiredResources,
      requiredSpecialties,
      patientLocation: {
        address: `${currentHospital.name} Emergency Triage Bay`,
        latitude: currentHospital.latitude,
        longitude: currentHospital.longitude,
      },
      matchScore: targetMatch.overallScore,
      etaMinutes: targetMatch.etaMinutes,
      recommendedHospitalId: targetMatch.hospital.id,
    });

    sendRequestToHospital(newReq.id, targetMatch.hospital.id);

    setDispatchedSuccess(`Emergency request dispatched to ${targetMatch.hospital.name}!`);
    setTimeout(() => {
      setDispatchedSuccess(null);
      onNavigateToOutgoing();
    }, 1800);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF0ED] border border-[#F0D5CB] text-[#C87D55] text-xs font-semibold uppercase tracking-widest mb-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Urgent Inter-Hospital Coordination</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A3D34]">Create Emergency Request & AI Matching</h2>
        <p className="text-xs sm:text-sm text-[#707565] mt-1">
          Specify patient clinical urgency and required assets. MediLink AI computes the optimal regional match with live ETA.
        </p>
      </div>

      {dispatchedSuccess && (
        <div className="p-4 rounded-2xl bg-[#F1F3EB] border border-[#D9E2D5] text-[#5F8575] text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#5F8575]" />
          <span>{dispatchedSuccess} Redirecting to active requests tracking...</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Emergency Request Form */}
        <div className="lg:col-span-6 bg-white rounded-[32px] p-6 sm:p-8 border border-[#E5E2D9] shadow-sm space-y-5">
          <form onSubmit={handleEvaluateMatches} className="space-y-4 text-[#3A3D34]">
            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-[#3A3D34] mb-2">Emergency Category *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'trauma', label: 'Trauma / MVC', icon: Flame, color: 'text-[#C87D55]' },
                  { id: 'cardiac', label: 'Cardiac STEMI', icon: Heart, color: 'text-[#D98C71]' },
                  { id: 'respiratory', label: 'Respiratory', icon: Wind, color: 'text-[#8C947A]' },
                  { id: 'neurological', label: 'Neurological', icon: Brain, color: 'text-[#707565]' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = category === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCategory(item.id as EmergencyCategory)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#3A3D34] text-[#F9F7F2] border-[#3A3D34] shadow-sm font-serif'
                          : 'bg-[#F9F7F2] text-[#3A3D34] border-[#E5E2D9] hover:border-[#DCD7CD]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? 'text-[#8C947A]' : item.color}`} />
                      <div className="text-[11px] font-semibold">{item.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Urgency selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#3A3D34] mb-1.5">Urgency Level</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                  className="w-full bg-[#F9F7F2] border border-[#E5E2D9] rounded-2xl px-3 py-2 text-xs font-semibold text-[#C87D55] focus:outline-none focus:border-[#8C947A]"
                >
                  <option value="critical">🔴 CRITICAL (&lt;15m)</option>
                  <option value="high">🟠 HIGH (&lt;30m)</option>
                  <option value="medium">🟡 MEDIUM (Stable)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3A3D34] mb-1.5">Patient Age</label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(Number(e.target.value))}
                  className="w-full bg-[#F9F7F2] border border-[#E5E2D9] rounded-2xl px-3 py-2 text-xs font-semibold text-[#3A3D34]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3A3D34] mb-1.5">Gender</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value as any)}
                  className="w-full bg-[#F9F7F2] border border-[#E5E2D9] rounded-2xl px-3 py-2 text-xs text-[#3A3D34]"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Clinical Notes */}
            <div>
              <label className="block text-xs font-semibold text-[#3A3D34] mb-1.5">Clinical Handoff Summary</label>
              <textarea
                rows={2}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                className="w-full bg-[#F9F7F2] border border-[#E5E2D9] rounded-2xl p-3 text-xs text-[#3A3D34] focus:outline-none focus:border-[#8C947A]"
              />
            </div>

            {/* Required Resources Selection */}
            <div className="space-y-3 pt-2 border-t border-[#E5E2D9]">
              <label className="block text-xs font-semibold text-[#3A3D34]">Required Critical Resources</label>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9]">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#3A3D34] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={needIcu}
                      onChange={(e) => setNeedIcu(e.target.checked)}
                      className="rounded text-[#8C947A] accent-[#8C947A]"
                    />
                    <span>ICU Bed</span>
                  </label>
                  {needIcu && (
                    <input
                      type="number"
                      min={1}
                      value={icuCount}
                      onChange={(e) => setIcuCount(Number(e.target.value))}
                      className="w-16 bg-white border border-[#DCD7CD] rounded-lg p-1 text-xs text-center font-bold"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9]">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#3A3D34] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={needBlood}
                      onChange={(e) => setNeedBlood(e.target.checked)}
                      className="rounded text-[#8C947A] accent-[#8C947A]"
                    />
                    <span>Blood Units</span>
                  </label>
                  {needBlood && (
                    <div className="flex items-center gap-2">
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="bg-white border border-[#DCD7CD] rounded-lg p-1 text-xs font-bold text-[#C87D55]"
                      >
                        <option value="O-">O- (Universal)</option>
                        <option value="O+">O+</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="AB+">AB+</option>
                      </select>
                      <input
                        type="number"
                        min={1}
                        value={bloodCount}
                        onChange={(e) => setBloodCount(Number(e.target.value))}
                        className="w-14 bg-white border border-[#DCD7CD] rounded-lg p-1 text-xs text-center font-bold"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9]">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#3A3D34] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={needVent}
                      onChange={(e) => setNeedVent(e.target.checked)}
                      className="rounded text-[#8C947A] accent-[#8C947A]"
                    />
                    <span>Mechanical Ventilator</span>
                  </label>
                  {needVent && (
                    <input
                      type="number"
                      min={1}
                      value={ventCount}
                      onChange={(e) => setVentCount(Number(e.target.value))}
                      className="w-16 bg-white border border-[#DCD7CD] rounded-lg p-1 text-xs text-center font-bold"
                    />
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9]">
                  <label className="block text-xs font-semibold text-[#3A3D34] mb-1.5">Required Specialist on Duty</label>
                  <select
                    value={specialistType}
                    onChange={(e) => setSpecialistType(e.target.value)}
                    className="w-full bg-white border border-[#DCD7CD] rounded-xl p-2.5 text-xs font-medium text-[#3A3D34]"
                  >
                    <option value="Trauma Surgeon">Trauma Surgeon</option>
                    <option value="Cardiologist">Cardiologist (Cath Lab Active)</option>
                    <option value="Neurologist">Neurologist / Neurosurgeon</option>
                    <option value="Pulmonologist">Pulmonologist / Intensivist</option>
                    <option value="None">None required</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isEvaluating}
              className="w-full bg-[#8C947A] hover:bg-[#788066] text-[#F9F7F2] font-serif font-bold py-3.5 rounded-full shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isEvaluating ? 'Evaluating Regional Network...' : 'Find Best AI Match'}</span>
            </button>
          </form>
        </div>

        {/* Right: AI Match Results & Hospital Cards */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-[#3A3D34] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8C947A]" />
              <span>Network Recommendations</span>
            </h3>
            <span className="text-xs text-[#707565]">Ranked by Clinical Feasibility</span>
          </div>

          {!aiResult && !isEvaluating && (
            <div className="bg-[#F1EDE4] border-2 border-dashed border-[#DCD7CD] rounded-[32px] p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#F9F7F2] text-[#8C947A] flex items-center justify-center mx-auto shadow-2xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-base font-serif font-bold text-[#3A3D34]">Ready to Compute Matches</h4>
              <p className="text-xs text-[#707565] max-w-sm mx-auto">
                Fill the request parameters on the left and click &ldquo;Find Best AI Match&rdquo; to evaluate real-time hospital capacity and transit ETAs.
              </p>
            </div>
          )}

          {isEvaluating && (
            <div className="bg-white border border-[#E5E2D9] rounded-[32px] p-12 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full border-3 border-[#8C947A] border-t-transparent animate-spin mx-auto"></div>
              <div className="text-sm font-serif font-bold text-[#3A3D34]">Evaluating 5 Regional Facilities...</div>
              <p className="text-xs text-[#707565]">Checking ICU beds, blood stock, surgeon shifts, and traffic routes</p>
            </div>
          )}

          {aiResult && (
            <div className="space-y-4">
              {aiResult.rankedHospitals.map((rec, index) => {
                const isTop = index === 0;
                return (
                  <motion.div
                    key={rec.hospital.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={`bg-white rounded-[32px] p-6 sm:p-7 border transition-all ${
                      isTop
                        ? 'border-2 border-[#8C947A] shadow-sm'
                        : 'border-[#E5E2D9] shadow-2xs opacity-90'
                    }`}
                  >
                    {/* Badge */}
                    <div className="flex items-center justify-between">
                      {isTop ? (
                        <span className="text-xs font-bold text-[#5F8575] uppercase bg-[#F1F3EB] px-3 py-1 rounded-full border border-[#D9E2D5]">
                          ★ RECOMMENDED BEST MATCH
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-[#707565] uppercase bg-[#F1EDE4] px-2.5 py-0.5 rounded-full">
                          Rank #{index + 1}
                        </span>
                      )}
                      <div className="text-right">
                        <span className="text-2xl font-serif font-bold text-[#3A3D34]">
                          {rec.overallScore}%
                        </span>
                        <span className="text-[10px] text-[#707565] block -mt-1">Match Score</span>
                      </div>
                    </div>

                    {/* Hospital Name & Info */}
                    <div className="mt-3">
                      <h4 className="text-lg font-serif font-bold text-[#3A3D34]">{rec.hospital.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-[#707565] mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#8C947A]" />
                          {rec.distanceKm} km away
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-[#5F8575]">
                          <Clock className="w-3.5 h-3.5" />
                          ETA: {rec.etaMinutes} min
                        </span>
                        <span>•</span>
                        <ConfidenceBadge confidence={rec.confidence} />
                      </div>
                    </div>

                    {/* AI Explanation */}
                    <div className="p-3.5 rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9] text-xs text-[#707565] mt-3 font-serif italic leading-relaxed">
                      &ldquo;{rec.aiExplanation}&rdquo;
                    </div>

                    {/* Satisfied Requirements */}
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-[#5F8575]">
                      {rec.satisfiedRequirements.map((am, i) => (
                        <span key={i} className="bg-[#F1F3EB] px-2.5 py-0.5 rounded-full border border-[#D9E2D5]">
                          ✓ {am}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRoutePreviewHospital(rec)}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-[#F1EDE4] hover:bg-[#EAE4D8] text-[#3A3D34] text-xs font-semibold border border-[#DCD7CD] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#8C947A]" />
                        <span>Preview Route Map</span>
                      </button>

                      <button
                        onClick={() => handleDispatchRequest(rec)}
                        className={`flex-1 w-full py-2.5 rounded-full font-serif font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          isTop
                            ? 'bg-[#3A3D34] hover:bg-[#2A2D25] text-[#F9F7F2] shadow-sm'
                            : 'bg-[#8C947A] hover:bg-[#788066] text-[#F9F7F2]'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Request ({rec.etaMinutes}m ETA)</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Route Preview Modal */}
      {routePreviewHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-[#FAF8F5] rounded-[32px] w-full max-w-3xl shadow-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D5]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#8C947A] text-white flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#3A3D34]">
                    Transit Route to {routePreviewHospital.hospital.name}
                  </h3>
                  <p className="text-xs text-[#707565]">
                    {routePreviewHospital.distanceKm} km • {routePreviewHospital.etaMinutes} mins estimated transit duration
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRoutePreviewHospital(null)}
                className="p-2 rounded-full bg-[#F1EDE4] text-[#707565] hover:text-[#3A3D34] hover:bg-[#EAE4D8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <EmergencyRouteMap
              originHospital={currentHospital}
              destinationHospital={routePreviewHospital.hospital}
              emergencyType={category}
              urgency={urgency}
              ambulance={{
                vehicleNumber: 'MED-SIM-01',
                type: 'Advanced Life Support (ALS)',
              }}
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRoutePreviewHospital(null)}
                className="px-5 py-2 rounded-full text-xs font-semibold text-[#707565] hover:text-[#3A3D34]"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  handleDispatchRequest(routePreviewHospital);
                  setRoutePreviewHospital(null);
                }}
                className="px-6 py-2.5 rounded-full bg-[#3A3D34] hover:bg-[#2A2D25] text-white font-serif font-bold text-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm & Dispatch to {routePreviewHospital.hospital.name}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
