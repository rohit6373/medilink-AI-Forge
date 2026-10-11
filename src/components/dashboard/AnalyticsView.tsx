import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Activity,
  CheckCircle2,
  Clock,
  Building2,
  FileText,
  Shield,
  Download,
  AlertTriangle,
  MapPin,
  ExternalLink,
  Compass,
} from 'lucide-react';
import { useMediLink } from '../../context/MediLinkContext';

export const AnalyticsView: React.FC = () => {
  const { currentHospital, hospitals, requests, reservations } = useMediLink();

  // Sample weekly metrics
  const weeklyTransferData = [
    { day: 'Mon', completed: 12, rejected: 1, diverted: 0 },
    { day: 'Tue', completed: 19, rejected: 2, diverted: 1 },
    { day: 'Wed', completed: 15, rejected: 0, diverted: 0 },
    { day: 'Thu', completed: 22, rejected: 1, diverted: 0 },
    { day: 'Fri', completed: 28, rejected: 3, diverted: 2 },
    { day: 'Sat', completed: 34, rejected: 2, diverted: 1 },
    { day: 'Sun', completed: 26, rejected: 1, diverted: 0 },
  ];

  const occupancyDistribution = [
    { name: 'Available Beds', value: 35, color: '#10B981' },
    { name: 'Reserved (Locks)', value: 12, color: '#F59E0B' },
    { name: 'Occupied', value: 53, color: '#3E8FC4' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-[#1A2233]">Network Performance & Analytics</h2>
        <p className="text-xs text-slate-500 mt-1">
          Historical emergency response times, hospital diversion indices, and inter-facility transfer throughput.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-400 font-bold uppercase">Average Dispatch Match ETA</div>
          <div className="text-2xl font-black font-mono text-[#3E8FC4] mt-2">11.4 min</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">↓ 32% faster vs legacy phone dispatch</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-400 font-bold uppercase">Reservation Success Rate</div>
          <div className="text-2xl font-black font-mono text-emerald-600 mt-2">98.2%</div>
          <div className="text-[11px] text-slate-500 mt-1">Zero double-booking incidents</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-400 font-bold uppercase">Total Emergency Transfers</div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-2">156</div>
          <div className="text-[11px] text-slate-500 mt-1">This month across 5 verified nodes</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-400 font-bold uppercase">Network Reliability Index</div>
          <div className="text-2xl font-black font-mono text-indigo-600 mt-2">99.8%</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">All hospital nodes reporting live telemetry</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Transfers Bar Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#1A2233]">Weekly Emergency Transfers by Day</h3>
              <p className="text-xs text-slate-400">Total transfers requested vs admitted</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Live Telemetry
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTransferData}>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#3E8FC4" radius={[6, 6, 0, 0]} name="Completed Transfers" />
                <Bar dataKey="rejected" fill="#F43F5E" radius={[6, 6, 0, 0]} name="Declined" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Capacity Breakdown */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#1A2233]">Network Bed Distribution</h3>
            <p className="text-xs text-slate-400">Live capacity status</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {occupancyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {occupancyDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useMediLink();
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredLogs = auditLogs.filter(
    (log) => filterCategory === 'all' || log.category === filterCategory
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#1A2233]">HIPAA & Network Audit Logs</h2>
          <p className="text-xs text-slate-500 mt-1">
            Immutable system logs tracking every resource change, emergency transfer, and reservation lock.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-[#3BC9C4]"
          >
            <option value="all">All Event Categories</option>
            <option value="reservation">Reservations</option>
            <option value="request">Emergency Requests</option>
            <option value="resource">Resource Telemetry</option>
            <option value="auth">Authentication</option>
            <option value="verification">Verification</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Timestamp</th>
                <th className="py-3.5 px-6">Action / Event</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Detailed Description</th>
                <th className="py-3.5 px-6 font-mono">Log Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-mono text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3.5 px-6 font-bold text-slate-900">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold">
                      {log.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-600">
                    {log.details}
                  </td>
                  <td className="py-3.5 px-6 font-mono text-[10px] text-slate-400">
                    {log.id.slice(0, 10)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const HospitalProfileView: React.FC = () => {
  const { currentHospital } = useMediLink();
  if (!currentHospital) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#1A2233]">Hospital Profile & Network Credentialing</h2>
        <p className="text-xs text-slate-500 mt-1">
          Official verification status, facility tier, and network routing configurations.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="text-xs text-slate-400 font-mono">NODE IDENTIFIER: {currentHospital.id}</div>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">{currentHospital.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{currentHospital.address}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {currentHospital.verificationStatus === 'verified' ? '🟢 Verified Node' : '🟡 Pending'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="text-slate-400 font-medium">Facility Category</div>
            <div className="text-sm font-bold text-slate-900 mt-1">{currentHospital.type}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="text-slate-400 font-medium">Network Reliability Score</div>
            <div className="text-sm font-bold text-[#3E8FC4] mt-1">{currentHospital.rating} / 5.0 ★</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="text-slate-400 font-medium">Verified Services</div>
            <div className="text-sm font-bold text-slate-900 mt-1">{currentHospital.services.length} Capabilities</div>
          </div>
        </div>

        {/* Geographic Telemetry & Ambulance Bay */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#3E8FC4]" />
              <span>Facility Telemetry & Ambulance Bay Coordinates:</span>
            </h4>
            <span className="text-[#3E8FC4] font-semibold flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Autonomous Network Node</span>
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#2A2D25] p-5 text-white relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#3E8FC4] text-white flex items-center justify-center font-bold shadow-md">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-base text-white">{currentHospital.name}</div>
                  <div className="text-xs text-slate-300 mt-0.5">{currentHospital.address}, {currentHospital.city}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#1E201B] px-4 py-2.5 rounded-xl border border-[#3E4336]">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Mesh Coordinates</div>
                  <div className="font-mono text-xs text-[#8C947A] font-bold">
                    {currentHospital.latitude.toFixed(4)}° N, {currentHospital.longitude.toFixed(4)}° W
                  </div>
                </div>
                <div className="border-l border-[#3E4336] pl-3">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Trauma Level</div>
                  <div className="text-xs text-emerald-400 font-bold">{currentHospital.type}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#3E4336] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span>Ambulance Bay: Dedicated Priority Emergency Transit Bay Pre-cleared</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Telemetry Synchronized
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-700 mb-2">Accredited Clinical Services:</h4>
          <div className="flex flex-wrap gap-2">
            {currentHospital.services.map((serv, i) => (
              <span key={i} className="px-3 py-1 bg-sky-50 text-[#3E8FC4] border border-sky-100 rounded-xl text-xs font-bold">
                ✓ {serv}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const HospitalSettingsView: React.FC = () => {
  const { currentHospital, updateHospitalProfile } = useMediLink();
  const [name, setName] = useState(currentHospital?.name || '');
  const [phone, setPhone] = useState(currentHospital?.phone || '');
  const [emergencyPhone, setEmergencyPhone] = useState(currentHospital?.emergencyPhone || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!currentHospital) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateHospitalProfile(currentHospital.id, {
      name,
      phone,
      emergencyPhone,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#1A2233]">Hospital Profile & Facility Settings</h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage facility metadata, emergency direct lines, and broadcast settings for {currentHospital.name}.
        </p>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile configuration saved and synced across regional network nodes.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Facility Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#3BC9C4]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Administrative Contact Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#3BC9C4]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Direct Emergency Hotline (24/7)</label>
            <input
              type="text"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-rose-600 font-mono font-bold focus:outline-none focus:border-[#3BC9C4]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            className="bg-[#3E8FC4] hover:bg-[#327cae] text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Save Facility Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
