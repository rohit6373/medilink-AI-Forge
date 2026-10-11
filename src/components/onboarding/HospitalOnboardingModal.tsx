import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  X,
  Building2,
  MapPin,
  Stethoscope,
  Layers,
  Users,
  Truck,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  ShieldCheck,
  Activity,
  AlertTriangle,
  LocateFixed,
} from 'lucide-react';
import { useMediLink } from '../../context/MediLinkContext';
import { HospitalLocationPicker } from '../maps/HospitalLocationPicker';
import {
  Hospital,
  HospitalType,
  ResourceItem,
  Specialist,
  Ambulance,
  BloodStock,
  StaffMember,
} from '../../types';

interface HospitalOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessGoToDashboard: (hospitalId: string) => void;
}

const DEFAULT_SERVICES = [
  'ICU',
  'Emergency Beds',
  'Trauma Center',
  'Cardiology',
  'Cath Lab',
  'Neurology',
  'Pulmonology',
  'Burn Unit',
  'Pediatric Care',
  'Obstetrics',
  'Surgery',
  'Imaging (CT/MRI)',
  'Blood Bank',
  'Pharmacy',
  'Dialysis',
  'Operating Theatre',
  'Ambulance Service',
];

export const HospitalOnboardingModal: React.FC<HospitalOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSuccessGoToDashboard,
}) => {
  const { registerHospital, verifyHospital } = useMediLink();

  const [step, setStep] = useState(1);
  const [createdHospital, setCreatedHospital] = useState<Hospital | null>(null);

  // Form State
  // Step 1: Hospital Info
  const [name, setName] = useState('');
  const [hospitalIdCode, setHospitalIdCode] = useState('HOSP-' + Math.floor(1000 + Math.random() * 9000));
  const [type, setType] = useState<HospitalType>('Multi-Specialty');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [totalBeds, setTotalBeds] = useState(300);
  const [hasEmergencyDepartment, setHasEmergencyDepartment] = useState(true);
  const [has247Service, setHas247Service] = useState(true);

  // Step 2: Location
  const [address, setAddress] = useState('100 Medical Center Drive');
  const [city, setCity] = useState('Metro City');
  const [state, setState] = useState('CA');
  const [pincode, setPincode] = useState('90210');
  const [latitude, setLatitude] = useState(37.783);
  const [longitude, setLongitude] = useState(-122.416);
  const [isLocating, setIsLocating] = useState(false);

  // Step 3: Services
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'ICU',
    'Emergency Beds',
    'Trauma Center',
    'Cardiology',
    'Blood Bank',
    'Operating Theatre',
    'Ambulance Service',
  ]);
  const [customService, setCustomService] = useState('');

  // Step 4: Initial Resources
  const [icuAvailable, setIcuAvailable] = useState(6);
  const [icuTotal, setIcuTotal] = useState(16);
  const [erAvailable, setErAvailable] = useState(8);
  const [erTotal, setErTotal] = useState(14);
  const [ventAvailable, setVentAvailable] = useState(5);
  const [ventTotal, setVentTotal] = useState(10);
  const [oxygenAvailable, setOxygenAvailable] = useState(25);
  const [oxygenTotal, setOxygenTotal] = useState(40);
  const [customResources, setCustomResources] = useState<{ name: string; available: number; total: number }[]>([]);
  const [customResName, setCustomResName] = useState('');
  const [customResQty, setCustomResQty] = useState(4);

  // Blood Units
  const [bloodUnits, setBloodUnits] = useState<{ [key: string]: number }>({
    'O+': 16,
    'O-': 6,
    'A+': 12,
    'A-': 4,
    'B+': 10,
    'B-': 3,
    'AB+': 8,
    'AB-': 2,
  });

  // Step 5: Specialists
  const [specialists, setSpecialists] = useState<{ name: string; specialty: string; shift: Specialist['shift']; contact: string }[]>([
    { name: 'Dr. Jennifer Hayes', specialty: 'Trauma Surgeon', shift: '24/7 On-Call', contact: 'Ext. 101' },
    { name: 'Dr. Alan Bradley', specialty: 'Cardiologist', shift: 'Morning', contact: 'Ext. 104' },
  ]);
  const [newSpecName, setNewSpecName] = useState('');
  const [newSpecSpecialty, setNewSpecSpecialty] = useState('Trauma Surgeon');

  // Step 6: Ambulances
  const [ambulances, setAmbulances] = useState<{ vehicleNumber: string; type: Ambulance['type']; status: Ambulance['status']; etaMinutes: number }[]>([
    { vehicleNumber: 'MED-NEW-01', type: 'Advanced Life Support', status: 'Available', etaMinutes: 8 },
    { vehicleNumber: 'MED-NEW-02', type: 'ICU Ambulance', status: 'Available', etaMinutes: 12 },
  ]);
  const [newAmbNumber, setNewAmbNumber] = useState('');
  const [newAmbType, setNewAmbType] = useState<Ambulance['type']>('Advanced Life Support');

  // Step 7: Admin Account
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('Admin@123');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('Admin@123');

  if (!isOpen) return null;

  // Handlers
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(parseFloat(pos.coords.latitude.toFixed(4)));
          setLongitude(parseFloat(pos.coords.longitude.toFixed(4)));
          setIsLocating(false);
        },
        () => {
          // Fallback simulation coordinates
          setLatitude(37.778);
          setLongitude(-122.415);
          setIsLocating(false);
        }
      );
    }
  };

  const toggleService = (srv: string) => {
    setSelectedServices((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]
    );
  };

  const handleAddCustomService = () => {
    if (customService.trim() && !selectedServices.includes(customService.trim())) {
      setSelectedServices([...selectedServices, customService.trim()]);
      setCustomService('');
    }
  };

  const handleAddCustomResource = () => {
    if (customResName.trim()) {
      setCustomResources([...customResources, { name: customResName.trim(), available: customResQty, total: customResQty + 2 }]);
      setCustomResName('');
    }
  };

  const handleAddSpecialist = () => {
    if (newSpecName.trim()) {
      setSpecialists([...specialists, { name: newSpecName.trim(), specialty: newSpecSpecialty, shift: 'Morning', contact: 'Ext. ' + Math.floor(100 + Math.random() * 900) }]);
      setNewSpecName('');
    }
  };

  const handleAddAmbulance = () => {
    if (newAmbNumber.trim()) {
      setAmbulances([...ambulances, { vehicleNumber: newAmbNumber.trim(), type: newAmbType, status: 'Available', etaMinutes: 10 }]);
      setNewAmbNumber('');
    }
  };

  const handleSubmitRegistration = () => {
    // Construct Resource items
    const initialResources: ResourceItem[] = [
      {
        id: `res-init-icu-${Date.now()}`,
        hospitalId: '',
        type: 'icu',
        name: 'ICU Beds',
        category: 'Critical Care',
        totalQuantity: icuTotal,
        availableQuantity: icuAvailable,
        reservedQuantity: 0,
        occupiedQuantity: icuTotal - icuAvailable,
        status: icuAvailable > 0 ? 'available' : 'occupied',
        confidence: 'HIGH',
        lastVerified: 'Just now',
      },
      {
        id: `res-init-er-${Date.now()}`,
        hospitalId: '',
        type: 'emergency_bed',
        name: 'Emergency Department Beds',
        category: 'Emergency Department',
        totalQuantity: erTotal,
        availableQuantity: erAvailable,
        reservedQuantity: 0,
        occupiedQuantity: erTotal - erAvailable,
        status: erAvailable > 0 ? 'available' : 'occupied',
        confidence: 'HIGH',
        lastVerified: 'Just now',
      },
      {
        id: `res-init-vent-${Date.now()}`,
        hospitalId: '',
        type: 'ventilator',
        name: 'Mechanical Ventilators',
        category: 'Respiratory',
        totalQuantity: ventTotal,
        availableQuantity: ventAvailable,
        reservedQuantity: 0,
        occupiedQuantity: ventTotal - ventAvailable,
        status: ventAvailable > 0 ? 'available' : 'occupied',
        confidence: 'HIGH',
        lastVerified: 'Just now',
      },
      {
        id: `res-init-oxygen-${Date.now()}`,
        hospitalId: '',
        type: 'oxygen',
        name: 'High-Flow Oxygen Units',
        category: 'Respiratory',
        totalQuantity: oxygenTotal,
        availableQuantity: oxygenAvailable,
        reservedQuantity: 0,
        occupiedQuantity: oxygenTotal - oxygenAvailable,
        status: oxygenAvailable > 0 ? 'available' : 'occupied',
        confidence: 'HIGH',
        lastVerified: 'Just now',
      },
      ...customResources.map((cr, idx) => ({
        id: `res-init-custom-${Date.now()}-${idx}`,
        hospitalId: '',
        type: 'custom' as const,
        name: cr.name,
        category: 'Specialized Asset',
        totalQuantity: cr.total,
        availableQuantity: cr.available,
        reservedQuantity: 0,
        occupiedQuantity: cr.total - cr.available,
        status: (cr.available > 0 ? 'available' : 'occupied') as ResourceItem['status'],
        confidence: 'HIGH' as const,
        lastVerified: 'Just now',
      })),
    ];

    const initialBloodInventory: BloodStock[] = Object.entries(bloodUnits).map(([group, units]) => ({
      group: group as BloodStock['group'],
      units: Number(units) || 0,
      lastVerified: 'Just now',
      confidence: 'HIGH',
    }));

    const initialSpecialists: Specialist[] = specialists.map((sp, idx) => ({
      id: `spec-init-${Date.now()}-${idx}`,
      hospitalId: '',
      name: sp.name,
      specialty: sp.specialty,
      isAvailable: true,
      shift: sp.shift,
      contact: sp.contact,
      experienceYears: 12,
    }));

    const initialAmbulances: Ambulance[] = ambulances.map((amb, idx) => ({
      id: `amb-init-${Date.now()}-${idx}`,
      hospitalId: '',
      vehicleNumber: amb.vehicleNumber,
      type: amb.type,
      status: amb.status,
      equipment: ['Defibrillator', 'Ventilator', 'Multipara Telemetry'],
      currentLocationName: `${name || 'Hospital'} Station Bay`,
      latitude,
      longitude,
      etaMinutes: amb.etaMinutes,
    }));

    const initialStaff: StaffMember[] = [
      {
        id: `st-admin-${Date.now()}`,
        hospitalId: '',
        name: adminName || 'Dr. Administrator',
        email: adminEmail || email || 'admin@hospital.org',
        phone: adminPhone || phone || '+1 (555) 000-0000',
        role: 'Hospital Admin',
        isActive: true,
      },
    ];

    const newHospital = registerHospital({
      hospitalIdCode: hospitalIdCode || `HOSP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name || 'New Medical Center',
      type,
      email: email || 'contact@hospital.org',
      phone: phone || '+1 (555) 123-4567',
      emergencyPhone: emergencyPhone || '+1 (555) 911-0000',
      website: website || 'https://hospital.medilink.org',
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      totalBeds,
      hasEmergencyDepartment,
      has247Service,
      verificationStatus: 'pending',
      services: selectedServices,
      resources: initialResources,
      bloodInventory: initialBloodInventory,
      specialists: initialSpecialists,
      ambulances: initialAmbulances,
      staff: initialStaff,
    });

    setCreatedHospital(newHospital);
    setStep(8); // Success Screen
  };

  const handleSimulateAdminApproval = () => {
    if (createdHospital) {
      verifyHospital(createdHospital.id, 'verified');
      setCreatedHospital({ ...createdHospital, verificationStatus: 'verified' });
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // Confetti fallback
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-[#1A2233] text-white px-6 sm:px-8 py-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3E8FC4] to-[#3BC9C4] p-0.5">
              <div className="w-full h-full bg-[#1A2233] rounded-[10px] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#3BC9C4]" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold">Add Your Hospital to MediLink</h3>
              <p className="text-xs text-slate-400">Step {step <= 7 ? step : 'Completed'} of 7 — Verified Hospital Onboarding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar (Steps 1-7) */}
        {step <= 7 && (
          <div className="w-full bg-slate-100 h-1.5 shrink-0">
            <div
              className="bg-gradient-to-r from-[#3E8FC4] to-[#3BC9C4] h-full transition-all duration-300"
              style={{ width: `${(step / 7) * 100}%` }}
            />
          </div>
        )}

        {/* Step Indicator Tabs */}
        {step <= 7 && (
          <div className="hidden sm:flex items-center justify-between px-8 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 overflow-x-auto shrink-0">
            {[
              { num: 1, label: 'Info', icon: Building2 },
              { num: 2, label: 'Location', icon: MapPin },
              { num: 3, label: 'Services', icon: Stethoscope },
              { num: 4, label: 'Resources', icon: Layers },
              { num: 5, label: 'Specialists', icon: Users },
              { num: 6, label: 'Ambulances', icon: Truck },
              { num: 7, label: 'Admin', icon: UserCheck },
            ].map((st) => {
              const Icon = st.icon;
              const isActive = step === st.num;
              const isPast = step > st.num;
              return (
                <div
                  key={st.num}
                  className={`flex items-center gap-1.5 ${
                    isActive ? 'text-[#3E8FC4] font-bold' : isPast ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                      isActive
                        ? 'bg-[#3E8FC4] text-white'
                        : isPast
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isPast ? '✓' : st.num}
                  </span>
                  <span>{st.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Body Content (Scrollable) */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-slate-800">
          {/* STEP 1: Hospital Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="text-xl font-extrabold text-[#1A2233]">Step 1: Hospital Information</h4>
              <p className="text-xs text-slate-500">Provide official hospital registration and facility details.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hospital Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. St. Jude Emergency Hospital"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3BC9C4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hospital ID / Reg Code *</label>
                  <input
                    type="text"
                    required
                    value={hospitalIdCode}
                    onChange={(e) => setHospitalIdCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:border-[#3BC9C4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hospital Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as HospitalType)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3BC9C4]"
                  >
                    <option value="Multi-Specialty">Multi-Specialty</option>
                    <option value="Emergency Center">Emergency Center</option>
                    <option value="Government">Government</option>
                    <option value="Private">Private</option>
                    <option value="Specialty Hospital">Specialty Hospital</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@stjude.med.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3BC9C4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Bed Capacity</label>
                  <input
                    type="number"
                    value={totalBeds}
                    onChange={(e) => setTotalBeds(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3BC9C4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">General Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 444-5555"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3BC9C4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">24/7 Emergency Hotline *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 911-0909"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-rose-600 focus:outline-none focus:border-[#3BC9C4]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={hasEmergencyDepartment}
                    onChange={(e) => setHasEmergencyDepartment(e.target.checked)}
                    className="w-4 h-4 text-[#3E8FC4] rounded"
                  />
                  <span>Active Emergency Department</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={has247Service}
                    onChange={(e) => setHas247Service(e.target.checked)}
                    className="w-4 h-4 text-[#3E8FC4] rounded"
                  />
                  <span>24/7 Emergency & Critical Care Admission</span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: Location & GPS Coordinates */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-extrabold text-[#1A2233]">Step 2: Facility Location & GPS Coordinates</h4>
                <p className="text-xs text-slate-500">
                  Select your hospital facility location, choose a preset district, or use live GPS. Accurate coordinates power real-time routing and AI matching.
                </p>
              </div>

              <HospitalLocationPicker
                latitude={latitude}
                longitude={longitude}
                address={address}
                city={city}
                state={state}
                pincode={pincode}
                onChange={(data) => {
                  setAddress(data.address);
                  setCity(data.city);
                  setState(data.state);
                  setPincode(data.pincode);
                  setLatitude(data.latitude);
                  setLongitude(data.longitude);
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Formatted Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#3BC9C4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City, State & Zip</label>
                  <input
                    type="text"
                    value={`${city}, ${state} ${pincode}`}
                    onChange={(e) => setCity(e.target.value.split(',')[0] || city)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#3BC9C4]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Hospital Services */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="text-xl font-extrabold text-[#1A2233]">Step 3: Hospital Clinical Services</h4>
              <p className="text-xs text-slate-500">Select all clinical units and diagnostic capabilities available at this facility.</p>

              <div className="flex flex-wrap gap-2 pt-2">
                {DEFAULT_SERVICES.map((srv) => {
                  const isSelected = selectedServices.includes(srv);
                  return (
                    <button
                      key={srv}
                      type="button"
                      onClick={() => toggleService(srv)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#3E8FC4] text-white border-[#3E8FC4] shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {srv}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Service */}
              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom clinical service (e.g. Hyperbaric Oxygen Therapy)"
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#3BC9C4]"
                />
                <button
                  type="button"
                  onClick={handleAddCustomService}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  + Add Service
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Initial Resource Inventory */}
          {step === 4 && (
            <div className="space-y-5">
              <h4 className="text-xl font-extrabold text-[#1A2233]">Step 4: Initial Resource Inventory</h4>
              <p className="text-xs text-slate-500">Input current available and total bed, ventilator, and blood units.</p>

              {/* Standard Resources Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="font-bold text-sm text-slate-800 mb-2">ICU Beds</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-slate-500">Available</label>
                      <input
                        type="number"
                        value={icuAvailable}
                        onChange={(e) => setIcuAvailable(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-emerald-600 mt-0.5"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500">Total</label>
                      <input
                        type="number"
                        value={icuTotal}
                        onChange={(e) => setIcuTotal(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 mt-0.5"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="font-bold text-sm text-slate-800 mb-2">Emergency Resuscitation Beds</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-slate-500">Available</label>
                      <input
                        type="number"
                        value={erAvailable}
                        onChange={(e) => setErAvailable(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-emerald-600 mt-0.5"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500">Total</label>
                      <input
                        type="number"
                        value={erTotal}
                        onChange={(e) => setErTotal(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 mt-0.5"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="font-bold text-sm text-slate-800 mb-2">Mechanical Ventilators</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-slate-500">Available</label>
                      <input
                        type="number"
                        value={ventAvailable}
                        onChange={(e) => setVentAvailable(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-emerald-600 mt-0.5"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500">Total</label>
                      <input
                        type="number"
                        value={ventTotal}
                        onChange={(e) => setVentTotal(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 mt-0.5"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="font-bold text-sm text-slate-800 mb-2">High-Flow Oxygen Units</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-slate-500">Available</label>
                      <input
                        type="number"
                        value={oxygenAvailable}
                        onChange={(e) => setOxygenAvailable(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-emerald-600 mt-0.5"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500">Total</label>
                      <input
                        type="number"
                        value={oxygenTotal}
                        onChange={(e) => setOxygenTotal(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 mt-0.5"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Blood Inventory Inputs */}
              <div className="pt-2">
                <div className="font-bold text-xs text-slate-700 mb-2">Blood Bank Units Available by Group:</div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {Object.keys(bloodUnits).map((grp) => (
                    <div key={grp} className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-center">
                      <div className="text-xs font-mono font-bold text-rose-600">{grp}</div>
                      <input
                        type="number"
                        value={bloodUnits[grp]}
                        onChange={(e) => setBloodUnits({ ...bloodUnits, [grp]: Number(e.target.value) })}
                        className="w-full text-center bg-white border border-slate-300 rounded mt-1 text-xs font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Custom Resource */}
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  placeholder="Custom resource name (e.g. CRRT Dialysis Machine)"
                  value={customResName}
                  onChange={(e) => setCustomResName(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#3BC9C4]"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={customResQty}
                  onChange={(e) => setCustomResQty(Number(e.target.value))}
                  className="w-20 bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-xs text-center"
                />
                <button
                  type="button"
                  onClick={handleAddCustomResource}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  + Add Resource
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Specialists */}
          {step === 5 && (
            <div className="space-y-4">
              <h4 className="text-xl font-extrabold text-[#1A2233]">Step 5: On-Duty Medical Specialists</h4>
              <p className="text-xs text-slate-500">Register physicians available for acute emergency transfer cases.</p>

              <div className="space-y-2 pt-2">
                {specialists.map((spec, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{spec.name}</span> — <span className="text-[#3E8FC4] font-medium">{spec.specialty}</span>
                      <div className="text-[11px] text-slate-500">Shift: {spec.shift} • Contact: {spec.contact}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSpecialists(specialists.filter((_, idx) => idx !== i))}
                      className="text-rose-500 hover:text-rose-700 p-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-700">+ Add Specialist</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Doctor Name (e.g. Dr. Sean Ross)"
                    value={newSpecName}
                    onChange={(e) => setNewSpecName(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#3BC9C4]"
                  />
                  <select
                    value={newSpecSpecialty}
                    onChange={(e) => setNewSpecSpecialty(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#3BC9C4]"
                  >
                    <option value="Trauma Surgeon">Trauma Surgeon</option>
                    <option value="Cardiologist">Cardiologist (Interventional)</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Pulmonologist">Pulmonologist / Intensivist</option>
                    <option value="Anesthesiologist">Anesthesiologist</option>
                    <option value="Pediatric Surgeon">Pediatric Surgeon</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddSpecialist}
                  className="w-full bg-[#3E8FC4] hover:bg-[#327cae] text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Confirm Specialist Addition
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Ambulances */}
          {step === 6 && (
            <div className="space-y-4">
              <h4 className="text-xl font-extrabold text-[#1A2233]">Step 6: Ambulance Fleet</h4>
              <p className="text-xs text-slate-500">Register emergency vehicles attached to your hospital.</p>

              <div className="space-y-2 pt-2">
                {ambulances.map((amb, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <span className="font-mono font-bold text-slate-800">{amb.vehicleNumber}</span> — <span className="text-teal-600 font-semibold">{amb.type}</span>
                      <div className="text-[11px] text-slate-500">Status: {amb.status} • Estimated Dispatch Base ETA: {amb.etaMinutes} min</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAmbulances(ambulances.filter((_, idx) => idx !== i))}
                      className="text-rose-500 hover:text-rose-700 p-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-700">+ Register Ambulance Unit</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Vehicle ID (e.g. MED-ALS-03)"
                    value={newAmbNumber}
                    onChange={(e) => setNewAmbNumber(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#3BC9C4]"
                  />
                  <select
                    value={newAmbType}
                    onChange={(e) => setNewAmbType(e.target.value as Ambulance['type'])}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#3BC9C4]"
                  >
                    <option value="Advanced Life Support">Advanced Life Support (ALS)</option>
                    <option value="ICU Ambulance">ICU Mobile Ambulance</option>
                    <option value="Basic Life Support">Basic Life Support (BLS)</option>
                    <option value="General Ambulance">General Patient Transport</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddAmbulance}
                  className="w-full bg-[#3BC9C4] hover:bg-[#32b5b0] text-[#1A2233] font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Register Vehicle
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: Hospital Administrator Account */}
          {step === 7 && (
            <div className="space-y-4">
              <h4 className="text-xl font-extrabold text-[#1A2233]">Step 7: Primary Hospital Administrator</h4>
              <p className="text-xs text-slate-500">Create the credentials for the authorized hospital coordinator who will manage requests and staff.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Administrator Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Katherine Wells"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3BC9C4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official Administrator Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="k.wells@hospital.org"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3BC9C4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Direct Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 019-9999"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3BC9C4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3BC9C4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    value={adminConfirmPassword}
                    onChange={(e) => setAdminConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3BC9C4]"
                  />
                </div>
              </div>

              {/* Review Summary Box */}
              <div className="mt-4 p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-[#3E8FC4]">Registration Summary:</div>
                <p>• Hospital: <strong>{name || 'New Medical Center'}</strong> ({type})</p>
                <p>• Emergency Beds: {icuAvailable} ICU / {erAvailable} ER / {ventAvailable} Ventilators</p>
                <p>• Specialists on duty: {specialists.length} registered • Ambulances: {ambulances.length} units</p>
              </div>
            </div>
          )}

          {/* STEP 8: Success & Verification Simulation */}
          {step === 8 && createdHospital && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                {createdHospital.verificationStatus === 'verified' ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                ) : (
                  <Activity className="w-10 h-10 animate-pulse text-amber-600" />
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-2xl font-extrabold text-[#1A2233]">
                  {createdHospital.verificationStatus === 'verified'
                    ? '🎉 Hospital Successfully Verified!'
                    : '🏥 Registration Submitted'}
                </h4>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  {createdHospital.verificationStatus === 'verified'
                    ? `${createdHospital.name} is now active and broadcasting real-time resource telemetry across the MediLink network.`
                    : `${createdHospital.name} profile has been submitted. Status is currently Pending Verification.`}
                </p>
              </div>

              {/* Status Badge Display */}
              <div className="inline-block">
                {createdHospital.verificationStatus === 'verified' ? (
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    🟢 Verified Hospital
                  </span>
                ) : (
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    🟡 Status: Pending Verification
                  </span>
                )}
              </div>

              {/* Simulated Admin Approval Action */}
              {createdHospital.verificationStatus !== 'verified' && (
                <div className="p-4 rounded-2xl bg-slate-900 text-white max-w-lg mx-auto border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">HACKATHON_DEMO_CONTROLS</span>
                    <span className="text-amber-400 font-bold">System Admin Portal</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    For hackathon demonstration, click below to simulate instant network administrator approval.
                  </p>
                  <button
                    type="button"
                    onClick={handleSimulateAdminApproval}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-colors cursor-pointer"
                  >
                    ✓ Simulate Admin Approval (Approve Hospital)
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSuccessGoToDashboard(createdHospital.id);
                  }}
                  className="bg-gradient-to-r from-[#3E8FC4] to-[#3BC9C4] hover:opacity-95 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Go to Hospital Dashboard →
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-5 py-3.5 rounded-xl transition-colors cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {step <= 7 && (
          <div className="bg-slate-50 px-6 sm:px-8 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>

              {step < 7 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-1.5 text-xs font-bold bg-[#3E8FC4] hover:bg-[#327cae] text-white px-5 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  <span>Save & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitRegistration}
                  className="flex items-center gap-1.5 text-xs font-bold bg-[#3BC9C4] hover:bg-[#32b5b0] text-[#1A2233] px-6 py-2.5 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  <span>Submit Registration</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
