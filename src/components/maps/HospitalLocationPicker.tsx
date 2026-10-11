import React, { useState } from 'react';
import {
  MapPin,
  LocateFixed,
  CheckCircle2,
  Building2,
  Navigation,
  Crosshair,
} from 'lucide-react';

interface HospitalLocationPickerProps {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
  onChange: (data: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
  }) => void;
}

const PRESET_METRO_LOCATIONS = [
  {
    name: 'Mission Bay Medical Center',
    address: '1825 4th St, Mission Bay',
    city: 'San Francisco',
    state: 'CA',
    pincode: '94158',
    lat: 37.7681,
    lng: -122.3919,
  },
  {
    name: 'Potrero General Hospital Hub',
    address: '1001 Potrero Ave, Potrero Hill',
    city: 'San Francisco',
    state: 'CA',
    pincode: '94110',
    lat: 37.7558,
    lng: -122.4047,
  },
  {
    name: 'Presidio Heights Clinical Pavilion',
    address: '3700 California St, Presidio Heights',
    city: 'San Francisco',
    state: 'CA',
    pincode: '94118',
    lat: 37.7865,
    lng: -122.4532,
  },
  {
    name: 'Civic Core Emergency Campus',
    address: '900 Hyde St, Downtown Core',
    city: 'San Francisco',
    state: 'CA',
    pincode: '94109',
    lat: 37.7892,
    lng: -122.4173,
  },
];

export const HospitalLocationPicker: React.FC<HospitalLocationPickerProps> = ({
  latitude,
  longitude,
  address,
  city,
  state,
  pincode,
  onChange,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  // Apply a preset location
  const handleSelectPreset = (preset: typeof PRESET_METRO_LOCATIONS[0]) => {
    onChange({
      address: preset.address,
      city: preset.city,
      state: preset.state,
      pincode: preset.pincode,
      latitude: preset.lat,
      longitude: preset.lng,
    });
  };

  // Browser Geolocation
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setLocateError('Geolocation not supported in this browser.');
      return;
    }

    setIsLocating(true);
    setLocateError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        onChange({
          address: address || 'Current Medical Facility Location',
          city: city || 'Metro District',
          state: state || 'CA',
          pincode: pincode || '94103',
          latitude: Number(pos.coords.latitude.toFixed(4)),
          longitude: Number(pos.coords.longitude.toFixed(4)),
        });
      },
      (err) => {
        setIsLocating(false);
        setLocateError('Could not acquire GPS position: ' + err.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-4">
      {/* Metro Location Presets */}
      <div>
        <label className="block text-xs font-semibold text-[#3A3D34] mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#8C947A]" />
            <span>Quick-Select Metro Hospital District</span>
          </span>
          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={isLocating}
            className="text-[11px] text-[#5F8575] hover:text-[#4E6F62] flex items-center gap-1 font-semibold cursor-pointer"
          >
            <LocateFixed className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Detecting...' : 'Use My GPS'}</span>
          </button>
        </label>

        <div className="grid grid-cols-2 gap-2">
          {PRESET_METRO_LOCATIONS.map((preset) => {
            const isMatch = Math.abs(preset.lat - latitude) < 0.005 && Math.abs(preset.lng - longitude) < 0.005;
            return (
              <button
                type="button"
                key={preset.name}
                onClick={() => handleSelectPreset(preset)}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  isMatch
                    ? 'bg-[#EBF3EE] border-[#5F8575] text-[#3A3D34] shadow-xs'
                    : 'bg-[#F9F7F2] border-[#E5E0D5] hover:border-[#8C947A] text-[#707565]'
                }`}
              >
                <div className="font-semibold text-[#3A3D34] flex items-center justify-between">
                  <span className="truncate">{preset.name.split(' ')[0]} Hub</span>
                  {isMatch && <CheckCircle2 className="w-3.5 h-3.5 text-[#5F8575]" />}
                </div>
                <div className="text-[10px] text-[#8A8D82] truncate mt-0.5">{preset.address}</div>
              </button>
            );
          })}
        </div>
      </div>

      {locateError && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {locateError}
        </div>
      )}

      {/* Address Form Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold text-[#707565] mb-1">
            Facility Street Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) =>
              onChange({
                address: e.target.value,
                city,
                state,
                pincode,
                latitude,
                longitude,
              })
            }
            placeholder="e.g. 1001 Potrero Ave, Trauma Wing A"
            className="w-full px-3 py-2 bg-white border border-[#DCD7CD] rounded-xl text-xs text-[#3A3D34] focus:outline-none focus:border-[#8C947A]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#707565] mb-1">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) =>
              onChange({
                address,
                city: e.target.value,
                state,
                pincode,
                latitude,
                longitude,
              })
            }
            placeholder="e.g. San Francisco"
            className="w-full px-3 py-2 bg-white border border-[#DCD7CD] rounded-xl text-xs text-[#3A3D34] focus:outline-none focus:border-[#8C947A]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-[#707565] mb-1">State</label>
            <input
              type="text"
              value={state}
              onChange={(e) =>
                onChange({
                  address,
                  city,
                  state: e.target.value,
                  pincode,
                  latitude,
                  longitude,
                })
              }
              placeholder="CA"
              className="w-full px-3 py-2 bg-white border border-[#DCD7CD] rounded-xl text-xs text-[#3A3D34] focus:outline-none focus:border-[#8C947A]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#707565] mb-1">Postal Code</label>
            <input
              type="text"
              value={pincode}
              onChange={(e) =>
                onChange({
                  address,
                  city,
                  state,
                  pincode: e.target.value,
                  latitude,
                  longitude,
                })
              }
              placeholder="94110"
              className="w-full px-3 py-2 bg-white border border-[#DCD7CD] rounded-xl text-xs text-[#3A3D34] focus:outline-none focus:border-[#8C947A]"
            />
          </div>
        </div>
      </div>

      {/* Facility Geographic Coordinates Card */}
      <div className="p-3.5 rounded-2xl bg-[#2D3128] text-white border border-[#3E4336] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-bold">
            <Crosshair className="w-3.5 h-3.5 text-[#8C947A]" />
            <span>Facility Telemetry Coordinates (GPS)</span>
          </span>
          <span className="text-[10px] text-[#A6AC9B] font-mono">
            {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° W
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
          <div>
            <label className="block text-[10px] text-[#A6AC9B] mb-0.5">Latitude</label>
            <input
              type="number"
              step="0.0001"
              value={latitude}
              onChange={(e) =>
                onChange({
                  address,
                  city,
                  state,
                  pincode,
                  latitude: parseFloat(e.target.value) || 0,
                  longitude,
                })
              }
              className="w-full px-2.5 py-1.5 bg-[#1E221B] border border-[#3E4336] rounded-lg font-mono text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] text-[#A6AC9B] mb-0.5">Longitude</label>
            <input
              type="number"
              step="0.0001"
              value={longitude}
              onChange={(e) =>
                onChange({
                  address,
                  city,
                  state,
                  pincode,
                  latitude,
                  longitude: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-2.5 py-1.5 bg-[#1E221B] border border-[#3E4336] rounded-lg font-mono text-xs text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
