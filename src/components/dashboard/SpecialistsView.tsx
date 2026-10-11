import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Phone,
  Clock,
  ShieldCheck,
  Stethoscope,
  Search,
  Truck,
} from 'lucide-react';
import { useMediLink } from '../../context/MediLinkContext';
import { Specialist, Ambulance } from '../../types';
import { HospitalNetworkMap } from '../maps/HospitalNetworkMap';

export const SpecialistsView: React.FC = () => {
  const { currentHospital, toggleSpecialistAvailability, addSpecialist, removeSpecialist } = useMediLink();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('Trauma Surgeon');
  const [shift, setShift] = useState<Specialist['shift']>('Morning');
  const [contact, setContact] = useState('Ext. 102');
  const [experienceYears, setExperienceYears] = useState(10);

  if (!currentHospital) return null;

  const filteredSpecialists = currentHospital.specialists.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addSpecialist(currentHospital.id, {
        name: name.trim(),
        specialty,
        isAvailable: true,
        shift,
        contact,
        experienceYears,
      });
      setName('');
      setIsAddOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#1A2233]">On-Duty Specialists & Surgical Teams</h2>
          <p className="text-xs text-slate-500 mt-1">
            Active physicians and surgeons available for acute emergency referrals at {currentHospital.name}.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-[#3E8FC4] hover:bg-[#327cae] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Specialist</span>
        </button>
      </div>

      {/* Specialists List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSpecialists.map((spec) => (
          <div
            key={spec.id}
            className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between ${
              spec.isAvailable
                ? 'border-slate-200 shadow-sm'
                : 'border-slate-200 opacity-70 bg-slate-50/60'
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#3BC9C4] flex items-center justify-center font-bold">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <button
                  onClick={() => toggleSpecialistAvailability(currentHospital.id, spec.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                    spec.isAvailable
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {spec.isAvailable ? '🟢 On Duty' : '⚪ Off Duty'}
                </button>
              </div>

              <div className="mt-4">
                <h4 className="text-base font-extrabold text-slate-900">{spec.name}</h4>
                <div className="text-xs font-semibold text-[#3E8FC4] mt-0.5">{spec.specialty}</div>
                <p className="text-[11px] text-slate-400 mt-1">{spec.experienceYears || 10} Years Clinical Experience</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Shift: <strong>{spec.shift}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Direct Contact: <strong>{spec.contact}</strong></span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Emergency Matching:</span>
              <span className={spec.isAvailable ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                {spec.isAvailable ? 'Eligible for Transfer' : 'Standby'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Specialist Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#1A2233]">+ Register Specialist</h3>
            <form onSubmit={handleAdd} className="space-y-3 text-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Michael Chang"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#3BC9C4]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Specialty</label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#3BC9C4]"
                >
                  <option value="Trauma Surgeon">Trauma Surgeon</option>
                  <option value="Cardiologist">Cardiologist (Interventional)</option>
                  <option value="Neurologist">Neurologist / Neurosurgeon</option>
                  <option value="Pulmonologist">Pulmonologist / Intensivist</option>
                  <option value="Anesthesiologist">Anesthesiologist</option>
                  <option value="Pediatric Surgeon">Pediatric Surgeon</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shift</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                    <option value="24/7 On-Call">24/7 On-Call</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Ext.</label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#3E8FC4] hover:bg-[#327cae] text-white font-bold px-4 py-2 rounded-xl text-xs"
                >
                  Register Physician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const AmbulancesView: React.FC = () => {
  const { currentHospital, updateAmbulanceStatus, addAmbulance } = useMediLink();
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [type, setType] = useState<any>('Advanced Life Support');
  const [etaMinutes, setEtaMinutes] = useState(8);

  if (!currentHospital) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (vehicleNumber.trim()) {
      addAmbulance(currentHospital.id, {
        vehicleNumber: vehicleNumber.trim(),
        type,
        status: 'Available',
        equipment: ['Defibrillator', 'Ventilator', 'Multipara Telemetry'],
        currentLocationName: `${currentHospital.name} Bay`,
        latitude: currentHospital.latitude,
        longitude: currentHospital.longitude,
        etaMinutes,
      });
      setVehicleNumber('');
      setIsAddOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#1A2233]">Ambulance Fleet & Dispatch Telemetry</h2>
          <p className="text-xs text-slate-500 mt-1">
            Emergency mobile transport units attached to {currentHospital.name}.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-[#3E8FC4] hover:bg-[#327cae] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Register Ambulance</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentHospital.ambulances.map((amb) => (
          <div
            key={amb.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {amb.vehicleNumber}
                </span>
                <h4 className="text-base font-extrabold text-slate-900 mt-1">{amb.type}</h4>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  amb.status === 'Available'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : amb.status === 'En Route' || amb.status === 'Busy'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {amb.status}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1 text-xs text-slate-600">
              <div>Location: <strong>{amb.currentLocationName}</strong></div>
              <div>Base Dispatch ETA: <strong className="text-[#3E8FC4]">{amb.etaMinutes || 8} min</strong></div>
              <div className="text-[11px] text-slate-400">
                Equipment: {amb.equipment.join(', ')}
              </div>
            </div>

            {/* Quick Status Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">Change Status:</span>
              <select
                value={amb.status}
                onChange={(e) => updateAmbulanceStatus(currentHospital.id, amb.id, e.target.value as any)}
                className="bg-slate-50 border border-slate-300 rounded-lg text-xs p-1 font-semibold"
              >
                <option value="Available">Available</option>
                <option value="Busy">Busy</option>
                <option value="En Route">En Route</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Add Ambulance Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#1A2233]">+ Register Emergency Vehicle</h3>
            <form onSubmit={handleAdd} className="space-y-3 text-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle ID / Reg *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MED-ALS-09"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#3BC9C4]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#3BC9C4]"
                >
                  <option value="Advanced Life Support">Advanced Life Support (ALS)</option>
                  <option value="ICU Ambulance">ICU Mobile Ambulance</option>
                  <option value="Basic Life Support">Basic Life Support (BLS)</option>
                  <option value="General Ambulance">General Transport</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Standard Base ETA (min)</label>
                <input
                  type="number"
                  min={1}
                  value={etaMinutes}
                  onChange={(e) => setEtaMinutes(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#3E8FC4] hover:bg-[#327cae] text-white font-bold px-4 py-2 rounded-xl text-xs"
                >
                  Confirm Unit Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const NetworkMapView: React.FC<{ onSelectHospital: (id: string) => void }> = ({ onSelectHospital }) => {
  const { switchHospital } = useMediLink();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A3D34]">
          Hospital Network Map & Telemetry
        </h2>
        <p className="text-xs sm:text-sm text-[#707565] mt-1">
          Interactive regional medical network mesh for real-time inter-hospital coordination, bed availability, and transit routing.
        </p>
      </div>

      <HospitalNetworkMap
        onSelectHospital={(id) => {
          switchHospital(id);
          onSelectHospital(id);
        }}
      />
    </div>
  );
};
