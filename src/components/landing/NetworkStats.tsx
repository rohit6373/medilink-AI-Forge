import React from 'react';
import { motion } from 'motion/react';
import { Building2, Layers, Clock, Zap, ShieldCheck } from 'lucide-react';

export const NetworkStats: React.FC = () => {
  const stats = [
    {
      value: '5+',
      label: 'Verified Centers',
      sublabel: 'Regional trauma centers & multi-specialty medical nodes',
      icon: Building2,
      color: 'text-[#3A3D34]',
      bg: 'bg-[#F1EDE4]',
    },
    {
      value: '120+',
      label: 'Tracked Assets',
      sublabel: 'ICU capacity, blood inventory, ventilators, operating suites',
      icon: Layers,
      color: 'text-[#5F8575]',
      bg: 'bg-[#F1F3EB]',
    },
    {
      value: '24/7',
      label: 'Mesh Telemetry',
      sublabel: 'Continuous synchronization & atomic reservation locks',
      icon: Clock,
      color: 'text-[#B07D38]',
      bg: 'bg-[#FBF6ED]',
    },
    {
      value: '94%',
      label: 'Allocation Score',
      sublabel: 'Algorithmic clinical suitability & multi-criteria optimization',
      icon: Zap,
      color: 'text-[#C87D55]',
      bg: 'bg-[#FAF0ED]',
    },
  ];

  return (
    <section className="bg-[#F1EDE4] py-14 border-b border-[#E5E0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between pb-6 border-b border-[#DCD7CD] flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8C947A] animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#707565]">
              Network Telemetry Snapshot
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#707565] bg-white px-3 py-1 rounded-full border border-[#DCD7CD] uppercase tracking-wider">
            Verified Regional Mesh
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white rounded-[32px] p-7 border border-[#E5E2D9] shadow-sm hover:border-[#8C947A]/50 transition-all relative"
              >
                <div className={`w-12 h-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center mb-5`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-4xl font-serif text-[#3A3D34] tracking-tight">
                  {stat.value}
                </div>
                <div className="text-base font-serif font-bold text-[#3A3D34] mt-2">
                  {stat.label}
                </div>
                <p className="text-xs text-[#707565] mt-1.5 leading-relaxed">
                  {stat.sublabel}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
