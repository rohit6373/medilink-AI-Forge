import React from 'react';
import { motion } from 'motion/react';
import {
  Flame,
  Heart,
  Wind,
  Brain,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const EmergencyMatchingSection: React.FC = () => {
  const categories = [
    {
      title: 'TRAUMA',
      subtitle: 'Mass Casualty, MVC & Penetrating Injury',
      icon: Flame,
      color: 'text-[#D98C71]',
      bg: 'bg-[#FAF0ED]',
      border: 'border-[#F0D5CB]',
      priorities: ['ICU Bed', 'Trauma Bay', 'Trauma Surgeon', 'Blood (O-/A+)', 'Trauma OT', 'CT Imaging', 'ALS Ambulance', 'Rapid ETA'],
    },
    {
      title: 'CARDIAC',
      subtitle: 'Acute STEMI, Arrest & Cardiogenic Shock',
      icon: Heart,
      color: 'text-[#C87D55]',
      bg: 'bg-[#FAF0ED]',
      border: 'border-[#F0D5CB]',
      priorities: ['Interventional Cardiology', 'Cath Lab Suite', 'Cardiac ICU Bed', 'Emergency Bay', 'Lucas CPR Unit', 'Ambulance ETA'],
    },
    {
      title: 'RESPIRATORY',
      subtitle: 'ARDS, Acute Failure & Inhalation',
      icon: Wind,
      color: 'text-[#5F8575]',
      bg: 'bg-[#F1F3EB]',
      border: 'border-[#D9E2D5]',
      priorities: ['Mechanical Ventilator', 'High-Flow Oxygen', 'Pulmonologist / Intensivist', 'ICU Bed', 'Blood Gas Telemetry'],
    },
    {
      title: 'NEUROLOGICAL',
      subtitle: 'Acute Stroke, Hemorrhage & Brain Injury',
      icon: Brain,
      color: 'text-[#3A3D34]',
      bg: 'bg-[#F1EDE4]',
      border: 'border-[#DCD7CD]',
      priorities: ['On-Duty Neurologist', 'Rapid CT/MRI Imaging', 'Neuro ICU Bed', 'Emergency Resuscitation', 'ALS Ambulance'],
    },
  ];

  return (
    <section id="emergency-matching" className="bg-[#F9F7F2] py-20 lg:py-28 border-b border-[#E5E0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F1EDE4] border border-[#DCD7CD] text-[#707565] text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#8C947A]" />
            <span>Specialty Matching Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#3A3D34] tracking-tight">
            Matching that understands clinical acuity
          </h2>
          <p className="text-base sm:text-lg text-[#707565] leading-relaxed">
            MediLink interprets emergency-specific priority protocols to match the exact combination of specialties, surgical suites, and blood units required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white rounded-[32px] p-7 border border-[#E5E2D9] shadow-sm hover:border-[#8C947A]/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-full ${cat.bg} ${cat.color} flex items-center justify-center mb-5`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-[11px] font-semibold tracking-widest text-[#707565] uppercase">Emergency Profile</div>
                  <h3 className="text-xl font-serif font-bold text-[#3A3D34] mt-1">{cat.title}</h3>
                  <p className="text-xs text-[#707565] mt-1 mb-5 leading-relaxed">{cat.subtitle}</p>

                  <div className="space-y-2 pt-3 border-t border-[#E5E2D9]">
                    <div className="text-[11px] font-semibold text-[#3A3D34] uppercase tracking-wider">
                      Required Asset Rules:
                    </div>
                    {cat.priorities.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-[#3A3D34]">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${cat.color} shrink-0`} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const AiRecommendationShowcase: React.FC<{ onAccessDashboard?: () => void }> = ({ onAccessDashboard }) => {
  const scores = [
    { label: 'Resource Match', score: 100, color: 'bg-[#8C947A]' },
    { label: 'Emergency Suitability', score: 95, color: 'bg-[#5F8575]' },
    { label: 'Transit ETA Factor', score: 92, color: 'text-[#3A3D34] bg-[#3A3D34]' },
    { label: 'Availability Confidence', score: 98, color: 'bg-[#8C947A]' },
    { label: 'Proximity / Distance', score: 89, color: 'bg-[#B07D38]' },
  ];

  return (
    <section id="ai-recommendation" className="bg-[#F1EDE4] py-20 lg:py-28 border-b border-[#E5E0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#DCD7CD] text-[#707565] text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#8C947A]" />
            <span>Matching Recommendation Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#3A3D34] tracking-tight">
            Find the optimal operational match
          </h2>
          <p className="text-base sm:text-lg text-[#707565] leading-relaxed">
            Transparent scoring and clinical logistics breakdowns give dispatchers confidence in emergency routing decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Ranked Match Card */}
          <div className="lg:col-span-6 bg-white rounded-[32px] p-8 sm:p-9 border border-[#E5E2D9] shadow-sm flex flex-col justify-between">
            <div>
              {/* Emergency Header */}
              <div className="bg-[#FAF0ED] border border-[#F0D5CB] rounded-2xl p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-[#D98C71]" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#C87D55]">
                    Active Request: Critical Trauma
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-[#D98C71] bg-white px-2.5 py-0.5 rounded-full border border-[#F0D5CB] uppercase tracking-wider">
                  Critical
                </span>
              </div>

              {/* Top Hospital Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#5F8575] bg-[#F1F3EB] px-3.5 py-1 rounded-full border border-[#D9E2D5]">
                  Recommended Facility
                </span>
                <span className="text-xs font-medium text-[#707565] bg-[#F1EDE4] px-3 py-1 rounded-full border border-[#DCD7CD]">
                  Verified Node
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-5">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-[#3A3D34]">CityCare Center</h3>
                  <p className="text-xs text-[#707565] mt-1">Multi-Specialty Regional Trauma Center</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-serif text-[#3A3D34]">94%</div>
                  <span className="text-xs text-[#707565] font-medium">Overall Match</span>
                </div>
              </div>

              {/* Requirement Checkpoints */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-[#E5E2D9] text-xs text-[#3A3D34]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8C947A]" />
                  <span>ICU Available (4 Beds)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8C947A]" />
                  <span>Blood Available (O- & A+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8C947A]" />
                  <span>Trauma Surgeon On Duty</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8C947A]" />
                  <span>Ambulance Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8C947A]" />
                  <span>Emergency Bay Open</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8C947A]" />
                  <span>Trauma OT Suite Open</span>
                </div>
              </div>

              {/* Distance & ETA Telemetry */}
              <div className="grid grid-cols-3 gap-3 mt-6 p-4 rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9] text-center">
                <div>
                  <div className="text-xs text-[#707565]">Distance</div>
                  <div className="text-base font-serif font-bold text-[#3A3D34] mt-0.5">8.2 km</div>
                </div>
                <div>
                  <div className="text-xs text-[#707565]">Transit ETA</div>
                  <div className="text-base font-serif font-bold text-[#8C947A] mt-0.5">11 min</div>
                </div>
                <div>
                  <div className="text-xs text-[#707565]">Confidence</div>
                  <div className="text-base font-serif font-bold text-[#5F8575] mt-0.5">High (2m ago)</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onAccessDashboard?.()}
              className="w-full mt-6 bg-[#3A3D34] hover:bg-[#2A2D25] text-[#F9F7F2] font-serif font-bold py-4 rounded-full shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide"
            >
              <span>Access Emergency Dashboard →</span>
            </button>
          </div>

          {/* Right: AI Explanation & Score Breakdown */}
          <div className="lg:col-span-6 bg-white rounded-[32px] p-8 sm:p-9 border border-[#E5E2D9] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-[#F1EDE4] text-[#8C947A] flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-serif font-bold text-[#3A3D34]">
                  Clinical Routing Evaluation
                </h4>
              </div>

              <div className="p-5 rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9] text-sm text-[#707565] leading-relaxed italic font-serif">
                &ldquo;CityCare currently satisfies all high-priority requirements for this trauma emergency. It has confirmed ICU capacity, blood availability, trauma specialists, and the fastest suitable ambulance ETA among verified regional hospitals.&rdquo;
              </div>

              {/* Score Breakdown Bars */}
              <div className="mt-6 space-y-4">
                <div className="text-xs font-semibold text-[#707565] uppercase tracking-wider">
                  Transparent Score Breakdown (Overall: 94%)
                </div>

                {scores.map((sc) => (
                  <div key={sc.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium text-[#3A3D34]">
                      <span>{sc.label}</span>
                      <span className="font-serif font-bold">{sc.score}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#F1EDE4] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${sc.score}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className={`h-full ${sc.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5E2D9] flex items-center justify-between text-xs text-[#707565]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#8C947A]" />
                Deterministic Clinical Scoring
              </span>
              <span className="font-medium text-[#3A3D34]">Real-Time Verified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const EtaAwareSection: React.FC = () => {
  return (
    <section className="bg-[#F9F7F2] py-20 border-b border-[#E5E0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-[#3A3D34] text-[#F9F7F2] rounded-[36px] p-8 sm:p-12 border border-[#4A4E43] shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Explanation */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2A2D25] border border-[#4A4E43] text-[#8C947A] text-xs font-semibold uppercase tracking-widest">
                <Clock className="w-3.5 h-3.5" />
                <span>ETA-Aware Logistics Intelligence</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif tracking-tight">
                The nearest facility is not always the fastest route
              </h2>
              <p className="text-sm sm:text-base text-[#DCD7CD] leading-relaxed">
                A hospital 5 km away in heavy congestion with an overloaded triage area may take 27 minutes. MediLink analyzes dynamic traffic, ambulance dispatch staging, and facility readiness to identify the truly optimal clinical path.
              </p>
            </div>

            {/* Right Comparison Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Hospital B (Nearest but slower) */}
              <div className="bg-[#2A2D25] border border-[#4A4E43] rounded-2xl p-5 relative">
                <span className="text-[10px] font-semibold uppercase text-[#D98C71] tracking-wider">
                  Nearest Distance (Sub-optimal)
                </span>
                <h4 className="text-lg font-serif font-bold text-[#F9F7F2] mt-1">Facility B</h4>
                <div className="mt-3 space-y-1 text-xs text-[#DCD7CD]">
                  <p>Distance: <strong>5 km</strong></p>
                  <p className="text-[#D98C71] font-semibold">Transit ETA: 27 min (Congested)</p>
                  <p className="text-[#8A8D82]">ER Capacity: High Wait Time</p>
                </div>
                <div className="mt-4 text-xs text-[#D98C71] bg-[#FAF0ED]/10 p-2.5 rounded-xl border border-[#D98C71]/30">
                  ✗ Slower arrival & congested triage
                </div>
              </div>

              {/* Hospital C (Selected by MediLink) */}
              <div className="bg-[#2A2D25] border-2 border-[#8C947A] rounded-2xl p-5 shadow-sm relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase text-[#8C947A] tracking-wider">
                    MediLink Choice (Optimal)
                  </span>
                  <span className="text-xs bg-[#8C947A] text-white font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Selected
                  </span>
                </div>
                <h4 className="text-lg font-serif font-bold text-[#F9F7F2] mt-1">Facility C</h4>
                <div className="mt-3 space-y-1 text-xs text-[#DCD7CD]">
                  <p>Distance: <strong>10 km (Arterial Route)</strong></p>
                  <p className="text-[#8C947A] font-semibold">Transit ETA: 11 min</p>
                  <p className="text-[#DCD7CD]">Resource: 100% Prepared & Reserved</p>
                </div>
                <div className="mt-4 text-xs text-[#8C947A] bg-[#8C947A]/20 p-2.5 rounded-xl border border-[#8C947A]/40">
                  ✓ 16 minutes saved for patient
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ReservationShowcase: React.FC = () => {
  return (
    <section id="resources" className="bg-[#F1EDE4] py-20 lg:py-28 border-b border-[#E5E0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#DCD7CD] text-[#B07D38] text-xs font-semibold uppercase tracking-widest">
            <span>Atomic Reservation Guarantee</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#3A3D34] tracking-tight">
            Reserve critical resources in real time
          </h2>
          <p className="text-base sm:text-lg text-[#707565] leading-relaxed">
            Atomic reservation locks prevent double-booking across facilities, guaranteeing that when the ambulance arrives, the bed and team are waiting.
          </p>
        </div>

        {/* Interactive Reservation Flow Display */}
        <div className="bg-white rounded-[32px] p-8 sm:p-12 border border-[#E5E2D9] shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            {/* Step 1 */}
            <div className="bg-[#F9F7F2] border border-[#E5E2D9] rounded-2xl p-5 text-center">
              <span className="text-[10px] font-semibold text-[#707565] uppercase tracking-wider">Hospital A</span>
              <div className="text-sm font-serif font-bold text-[#3A3D34] mt-1">
                &ldquo;Request ICU + Ventilator for incoming trauma.&rdquo;
              </div>
              <div className="mt-3 text-xs text-[#8C947A] font-medium">Request Dispatched</div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex justify-center text-[#8A8D82]">
              <ArrowRight className="w-8 h-8" />
            </div>

            {/* Step 2 */}
            <div className="bg-[#F9F7F2] border border-[#E5E2D9] rounded-2xl p-5 text-center">
              <span className="text-[10px] font-semibold text-[#707565] uppercase tracking-wider">Hospital D Accepts</span>
              <div className="text-sm font-serif font-bold text-[#3A3D34] mt-1">
                ICU & Ventilator Accepted for Transfer
              </div>
              <div className="mt-3 inline-block text-xs font-semibold bg-[#F1F3EB] text-[#5F8575] px-3 py-1 rounded-full border border-[#D9E2D5]">
                One-Click Approval
              </div>
            </div>

            {/* Step 3: State Shift */}
            <div className="bg-[#3A3D34] text-[#F9F7F2] rounded-2xl p-5 text-center border border-[#4A4E43]">
              <div className="text-xs text-[#DCD7CD]">Inventory Shift</div>
              <div className="flex items-center justify-center gap-2 my-2 font-serif font-bold text-sm">
                <span className="text-[#8C947A]">AVAILABLE</span>
                <span className="text-[#8A8D82]">→</span>
                <span className="text-[#B07D38]">RESERVED</span>
              </div>
              <div className="text-xs text-[#FAF0ED] font-medium bg-[#2A2D25] py-1 px-2.5 rounded-full border border-[#4A4E43] inline-flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#B07D38]" />
                <span>Expires in: 14:32</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E5E2D9] text-center text-xs text-[#707565] max-w-2xl mx-auto leading-relaxed">
            When patient transfer completes, the resource shifts seamlessly to <strong>OCCUPIED</strong>. If the transfer is cancelled or the 15-minute timer expires, the resource is automatically restored to <strong>AVAILABLE</strong>.
          </div>
        </div>
      </div>
    </section>
  );
};
