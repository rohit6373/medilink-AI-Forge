import React from 'react';
import { motion } from 'motion/react';
import { Eye, Zap, Target, AlertOctagon, HeartCrack, Clock3, ShieldCheck } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  const shortages = [
    'ICU Capacity',
    'Emergency Trauma Bays',
    'Blood Units (O- / A+)',
    'Mechanical Ventilators',
    'High-Flow Oxygen',
    'Ambulances (ALS / Critical)',
    'On-Duty Trauma Specialists',
    'Surgical Suites',
    'CT / Angiography Units',
  ];

  return (
    <section id="problem" className="bg-[#F9F7F2] py-20 lg:py-28 border-b border-[#E5E0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF0ED] border border-[#F0D5CB] text-[#C87D55] text-xs font-semibold uppercase tracking-widest">
            <AlertOctagon className="w-3.5 h-3.5 text-[#D98C71]" />
            <span>The Clinical Dilemma</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#3A3D34] tracking-tight">
            When minutes determine patient outcomes
          </h2>
          <p className="text-base sm:text-lg text-[#707565] leading-relaxed">
            During acute trauma, mass casualties, and multi-organ emergencies, individual facilities face sudden resource depletion. Finding available capacity through manual phone chains creates dangerous delays.
          </p>
        </div>

        {/* Shortage Badges */}
        <div className="flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto my-10">
          {shortages.map((item) => (
            <span
              key={item}
              className="px-4 py-2 rounded-full bg-white text-[#3A3D34] font-medium text-xs border border-[#E5E2D9] shadow-sm flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D98C71]"></span>
              {item}
            </span>
          ))}
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-[32px] p-8 border border-[#E5E2D9] shadow-sm hover:border-[#8C947A]/50 transition-all relative"
          >
            <div className="w-14 h-14 rounded-full bg-[#F1EDE4] text-[#3A3D34] flex items-center justify-center mb-6">
              <Eye className="w-6 h-6 text-[#8C947A]" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#3A3D34] mb-2">Resource Visibility</h3>
            <p className="text-sm text-[#707565] leading-relaxed">
              Observe real-time telemetry across neighboring hospitals with verified confidence scoring and last-updated timestamps, eliminating blind transfers.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-[32px] p-8 border border-[#E5E2D9] shadow-sm hover:border-[#8C947A]/50 transition-all relative"
          >
            <div className="w-14 h-14 rounded-full bg-[#F1F3EB] text-[#5F8575] flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-[#8C947A]" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#3A3D34] mb-2">Instant Dispatch</h3>
            <p className="text-sm text-[#707565] leading-relaxed">
              Route critical resource requests directly to clinical coordinators with high-priority audio-visual telemetry and automated lock confirmations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-[32px] p-8 border border-[#E5E2D9] shadow-sm hover:border-[#8C947A]/50 transition-all relative"
          >
            <div className="w-14 h-14 rounded-full bg-[#FAF0ED] text-[#C87D55] flex items-center justify-center mb-6">
              <Target className="w-6 h-6 text-[#D98C71]" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#3A3D34] mb-2">Optimized Routing</h3>
            <p className="text-sm text-[#707565] leading-relaxed">
              Identify the highest-compatibility medical facility rather than guessing the nearest center based solely on geographical distance.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export const SolutionSection: React.FC = () => {
  const analysisFactors = [
    { label: 'Real-Time Capacity', desc: 'ICU beds, units, ventilators, and OR suites' },
    { label: 'Triage Severity', desc: 'Trauma, Cardiac, Respiratory, Neuro protocols' },
    { label: 'Transit Time & ETA', desc: 'Emergency vehicle telemetry estimates' },
    { label: 'Clinical Specialty', desc: 'Level-1 trauma verification and surgeons on-call' },
    { label: 'Accreditation', desc: 'Exclusively routed to certified medical nodes' },
    { label: 'Data Freshness', desc: 'Confidence weighting calibrated by update recency' },
  ];

  return (
    <section className="bg-[#F1EDE4] py-20 lg:py-28 border-b border-[#E5E0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#DCD7CD] text-[#5F8575] text-xs font-semibold uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5 text-[#8C947A]" />
            <span>Unified Regional Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#3A3D34] tracking-tight">
            One network. Smarter emergency coordination.
          </h2>
          <p className="text-base sm:text-lg text-[#707565] leading-relaxed">
            MediLink connects requesting clinical teams across an integrated regional ecosystem, matching required assets to verified capacity in seconds.
          </p>
        </div>

        {/* Network Diagram */}
        <div className="bg-[#3A3D34] rounded-[36px] p-8 sm:p-12 text-[#F9F7F2] border border-[#4A4E43] shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Originating Hospital */}
            <div className="lg:col-span-3 text-center">
              <div className="bg-[#2A2D25] border border-[#4A4E43] rounded-2xl p-6">
                <div className="w-12 h-12 rounded-full bg-[#FAF0ED]/20 text-[#D98C71] flex items-center justify-center mx-auto mb-3">
                  <AlertOctagon className="w-6 h-6 text-[#D98C71]" />
                </div>
                <div className="text-xs font-semibold uppercase text-[#D98C71] tracking-wider">Requesting Center</div>
                <h4 className="text-lg font-serif font-bold text-[#F9F7F2] mt-1">Hospital A</h4>
                <p className="text-xs text-[#DCD7CD] mt-2 leading-relaxed">
                  Emergency: Critical Trauma
                  <br />
                  Required: ICU + Blood + Specialist
                </p>
              </div>
            </div>

            {/* Middle: MediLink AI Engine */}
            <div className="lg:col-span-4 text-center relative py-4 lg:py-0">
              <div className="relative z-10 bg-[#2A2D25] border-2 border-[#8C947A] rounded-3xl p-7 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-[#8C947A] text-white flex items-center justify-center mx-auto mb-3 font-extrabold shadow-sm">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="text-xs font-semibold uppercase text-[#8C947A] tracking-widest">
                  Coordination Engine
                </div>
                <h3 className="text-xl font-serif font-bold text-[#F9F7F2] mt-1">Multi-Criteria Matching</h3>
                <p className="text-xs text-[#DCD7CD] mt-2 leading-relaxed">
                  Algorithmic evaluation weighting ETA, bed availability, and specialized staff.
                </p>
              </div>
            </div>

            {/* Right: Regional Hospital Network */}
            <div className="lg:col-span-5 space-y-3">
              <div className="bg-[#2A2D25] border border-[#8C947A] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#8C947A] uppercase tracking-wider">✓ Top Match: Apex Emergency (94%)</div>
                  <div className="text-[11px] text-[#DCD7CD] mt-1">8 ICU beds • 12 units O- • Trauma Surgeon • 10m ETA</div>
                </div>
                <span className="text-xs font-bold text-[#8C947A] bg-[#8C947A]/20 px-3 py-1 rounded-full border border-[#8C947A]/40 uppercase tracking-wider">
                  Matched
                </span>
              </div>

              <div className="bg-[#2A2D25] border border-[#4A4E43] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-[#F9F7F2]">Facility B: LifeLine Medical (88% Match)</div>
                  <div className="text-[11px] text-[#8A8D82] mt-1">6 ICU beds • 8 units O- • 14m ETA</div>
                </div>
                <span className="text-[11px] text-[#8A8D82] uppercase tracking-wider">Standby</span>
              </div>

              <div className="bg-[#2A2D25] border border-[#4A4E43] rounded-2xl p-4 flex items-center justify-between opacity-70">
                <div>
                  <div className="text-xs font-medium text-[#8A8D82]">Facility C: Metro General (Occupied)</div>
                  <div className="text-[11px] text-[#8A8D82] mt-1">0 ICU beds available • 27m ETA</div>
                </div>
                <span className="text-[11px] text-[#D98C71] uppercase tracking-wider">Full</span>
              </div>
            </div>
          </div>

          {/* Bottom Continuous Factors */}
          <div className="mt-10 pt-8 border-t border-[#4A4E43] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {analysisFactors.map((factor) => (
              <div key={factor.label} className="bg-[#2A2D25] rounded-2xl p-3.5 border border-[#4A4E43]">
                <div className="text-xs font-bold text-[#F9F7F2]">{factor.label}</div>
                <div className="text-[10px] text-[#DCD7CD] mt-1 leading-tight">{factor.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Maintain Telemetry',
      desc: 'Hospitals sync live resource levels through quick-adjust controls or automated hospital information integrations.',
    },
    {
      num: '02',
      title: 'Dispatch Emergency Request',
      desc: 'Specify the clinical category, triage urgency, patient location, and exact required assets (ICU, O- Blood, Specialists).',
    },
    {
      num: '03',
      title: 'Compute Best Match',
      desc: 'MediLink calculates immediate asset availability, clinical specialty weighting, and realistic emergency vehicle ETA.',
    },
    {
      num: '04',
      title: 'Confirm & Reserve',
      desc: 'The receiving hospital accepts the request, placing the assets into an atomic RESERVED state with a countdown timer.',
    },
  ];

  return (
    <section id="how-it-works" className="bg-[#F9F7F2] py-20 lg:py-28 border-b border-[#E5E0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F1EDE4] border border-[#DCD7CD] text-[#707565] text-xs font-semibold uppercase tracking-widest">
            <span>Standard Operating Protocol</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#3A3D34] tracking-tight">
            How MediLink works
          </h2>
          <p className="text-base sm:text-lg text-[#707565] leading-relaxed">
            A four-stage emergency coordination workflow engineered for clinical clarity, atomic reservation, and zero friction.
          </p>
        </div>

        {/* 4 Connected Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, index) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-[32px] p-8 border border-[#E5E2D9] shadow-sm relative flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-full bg-[#8C947A] text-[#F9F7F2] font-serif text-lg font-bold flex items-center justify-center mb-6">
                  {step.num}
                </div>
                <h3 className="text-lg font-serif font-bold text-[#3A3D34] mb-2">{step.title}</h3>
                <p className="text-xs text-[#707565] leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
