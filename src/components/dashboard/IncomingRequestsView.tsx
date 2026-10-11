import React, { useState } from 'react';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Send,
  Truck,
  MapPin,
  X,
} from 'lucide-react';
import { useMediLink } from '../../context/MediLinkContext';
import { RequestStatusBadge } from '../common/StatusBadge';
import { EmergencyRouteMap } from '../maps/EmergencyRouteMap';
import { EmergencyRequest, Hospital } from '../../types';

export const IncomingRequestsView: React.FC = () => {
  const { requests, acceptRequest, rejectRequest, currentHospital, hospitals } = useMediLink();
  const [activeRouteRequest, setActiveRouteRequest] = useState<EmergencyRequest | null>(null);

  if (!currentHospital) return null;

  const incomingRequests = requests.filter(
    (r) => r.targetHospitalId === currentHospital.id || (!r.targetHospitalId && r.requestingHospitalId !== currentHospital.id)
  );

  const getOriginHospital = (req: EmergencyRequest): Hospital => {
    return hospitals.find((h) => h.id === req.requestingHospitalId) || hospitals[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A3D34]">Incoming Emergency Transfer Requests</h2>
          <p className="text-xs sm:text-sm text-[#707565] mt-1">
            Emergency dispatches requesting assets and beds at {currentHospital.name}.
          </p>
        </div>
        <span className="text-xs font-semibold bg-[#FAF0ED] text-[#C87D55] px-3.5 py-1.5 rounded-full border border-[#F0D5CB] self-start sm:self-auto">
          {incomingRequests.filter((r) => r.status === 'pending').length} Action Required
        </span>
      </div>

      {incomingRequests.length === 0 ? (
        <div className="bg-white border border-[#E5E2D9] rounded-[32px] p-12 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#F1F3EB] text-[#5F8575] flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-base font-serif font-bold text-[#3A3D34]">No Pending Inbound Requests</h4>
          <p className="text-xs text-[#707565] max-w-sm mx-auto">
            All regional incoming patient dispatches have been resolved or locked. Standby for new network alerts.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {incomingRequests.map((req) => (
            <div
              key={req.id}
              className={`bg-white rounded-[32px] p-6 sm:p-7 border transition-all ${
                req.status === 'pending'
                  ? 'border-2 border-[#C87D55] shadow-sm'
                  : 'border-[#E5E2D9] shadow-2xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E5E2D9]">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[#F9F7F2] ${
                      req.urgency === 'critical' ? 'bg-[#C87D55]' : 'bg-[#B07D38]'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-serif font-bold text-[#3A3D34]">
                        {req.emergencyType.toUpperCase()} ({req.urgency.toUpperCase()})
                      </span>
                      <RequestStatusBadge status={req.status} />
                    </div>
                    <div className="text-xs text-[#707565] mt-0.5">
                      From: <strong>{req.requestingHospitalName}</strong> • Dispatched: {new Date(req.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-[#707565]">Ambulance ETA</div>
                  <div className="text-lg font-serif font-bold text-[#3A3D34]">
                    {req.etaMinutes || 12} min
                  </div>
                </div>
              </div>

              {/* Patient & Requirements */}
              <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <div className="text-[#707565] font-semibold">Patient Details:</div>
                  <div className="text-[#3A3D34] bg-[#F9F7F2] p-3 rounded-2xl border border-[#E5E2D9]">
                    {req.patientSummary || 'Critical trauma stabilization needed.'}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[#707565] font-semibold">Requested Assets:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {req.requiredResources.map((res, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 bg-[#F1EDE4] border border-[#DCD7CD] p-2.5 rounded-xl text-[#3A3D34] font-semibold text-[11px]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#8C947A]" />
                        <span>
                          {res.quantity}x {String(res.resourceType).toUpperCase()} {res.bloodGroup ? `(${res.bloodGroup})` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E5E2D9] flex items-center justify-between gap-3">
                <button
                  onClick={() => setActiveRouteRequest(req)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#8C947A] hover:text-[#3A3D34] bg-[#F1EDE4] px-3.5 py-2 rounded-full border border-[#DCD7CD] transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>View Live Transit Route Map</span>
                </button>

                {req.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => rejectRequest(req.id, 'Capacity reached')}
                      className="px-4 py-2 rounded-full border border-[#DCD7CD] hover:bg-[#F1EDE4] text-[#707565] text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Decline Request
                    </button>
                    <button
                      onClick={() => acceptRequest(req.id)}
                      className="px-5 py-2.5 rounded-full bg-[#8C947A] hover:bg-[#788066] text-[#F9F7F2] text-xs font-serif font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ACCEPT & LOCK RESERVATION</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Emergency Route Modal */}
      {activeRouteRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-[#FAF8F5] rounded-[32px] w-full max-w-3xl shadow-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D5]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D98C71] text-white flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#3A3D34]">
                    Emergency Route Telemetry & Ambulance Tracking
                  </h3>
                  <p className="text-xs text-[#707565]">
                    Live priority corridor routing between {activeRouteRequest.requestingHospitalName} and {currentHospital.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveRouteRequest(null)}
                className="p-2 rounded-full bg-[#F1EDE4] text-[#707565] hover:text-[#3A3D34] hover:bg-[#EAE4D8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <EmergencyRouteMap
              originHospital={getOriginHospital(activeRouteRequest)}
              destinationHospital={currentHospital}
              emergencyType={activeRouteRequest.emergencyType}
              urgency={activeRouteRequest.urgency}
              ambulance={{
                vehicleNumber: 'MED-CC-101',
                type: 'Advanced Life Support (ALS)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const OutgoingRequestsView: React.FC<{ onNavigateToCreate: () => void }> = ({ onNavigateToCreate }) => {
  const { requests, updateRequestStatus, currentHospital, hospitals } = useMediLink();
  const [activeRouteRequest, setActiveRouteRequest] = useState<EmergencyRequest | null>(null);

  if (!currentHospital) return null;

  const outgoingRequests = requests.filter((r) => r.requestingHospitalId === currentHospital.id);

  const getTargetHospital = (req: EmergencyRequest): Hospital => {
    return hospitals.find((h) => h.id === req.targetHospitalId) || hospitals[1] || hospitals[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A3D34]">Dispatched Outgoing Requests</h2>
          <p className="text-xs sm:text-sm text-[#707565] mt-1">
            Emergency transfer requests sent from {currentHospital.name} to regional facilities.
          </p>
        </div>

        <button
          onClick={onNavigateToCreate}
          className="flex items-center gap-2 bg-[#8C947A] hover:bg-[#788066] text-[#F9F7F2] font-serif font-bold text-xs px-5 py-2.5 rounded-full shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Send className="w-3.5 h-3.5" />
          <span>+ Create New Request</span>
        </button>
      </div>

      {outgoingRequests.length === 0 ? (
        <div className="bg-white border border-[#E5E2D9] rounded-[32px] p-12 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#F1EDE4] text-[#8C947A] flex items-center justify-center mx-auto shadow-2xs">
            <Send className="w-6 h-6" />
          </div>
          <h4 className="text-base font-serif font-bold text-[#3A3D34]">No Outgoing Requests Sent</h4>
          <p className="text-xs text-[#707565] max-w-sm mx-auto">
            When your triage team needs to transfer patients or request critical external assets, create an emergency dispatch request.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {outgoingRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-[32px] p-6 sm:p-7 border border-[#E5E2D9] shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E5E2D9]">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-serif font-bold text-[#3A3D34]">
                      Transfer to: {req.targetHospitalName || 'Regional Hospital'}
                    </h4>
                    <RequestStatusBadge status={req.status} />
                  </div>
                  <p className="text-xs text-[#707565] mt-0.5">
                    Category: {req.emergencyType} • Urgency: {req.urgency.toUpperCase()} • Match Score: {req.matchScore || 92}%
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-[#707565]">Transit ETA</div>
                  <div className="text-lg font-serif font-bold text-[#5F8575]">
                    {req.etaMinutes || 10} min
                  </div>
                </div>
              </div>

              {/* Transit Tracker Bar */}
              <div className="bg-[#F9F7F2] p-4 rounded-2xl border border-[#E5E2D9] space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#3A3D34]">
                  <span className="flex items-center gap-1.5 text-[#8C947A]">
                    <Truck className="w-4 h-4" />
                    <span>Ambulance Status: {req.status === 'in_transit' ? 'In Transit to Destination' : req.status.toUpperCase()}</span>
                  </span>
                  <span className="text-[#707565]">Dispatched at {new Date(req.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="w-full bg-[#E5E2D9] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#8C947A] h-full transition-all duration-500 rounded-full"
                    style={{
                      width:
                        req.status === 'completed'
                          ? '100%'
                          : req.status === 'in_transit'
                          ? '65%'
                          : req.status === 'accepted' || req.status === 'reserved'
                          ? '40%'
                          : '15%',
                    }}
                  />
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveRouteRequest(req)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#8C947A] hover:text-[#3A3D34] bg-[#F1EDE4] px-3.5 py-1.5 rounded-full border border-[#DCD7CD] transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Track Ambulance Transit</span>
                </button>

                {req.status !== 'completed' && req.status !== 'cancelled' && (
                  <button
                    onClick={() => updateRequestStatus(req.id, 'cancelled')}
                    className="text-xs font-semibold text-[#C87D55] hover:text-[#B06D48] bg-[#FAF0ED] hover:bg-[#F5E5DF] px-4 py-1.5 rounded-full border border-[#F0D5CB] transition-colors cursor-pointer"
                  >
                    Cancel Dispatch Request
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Emergency Route Modal */}
      {activeRouteRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-[#FAF8F5] rounded-[32px] w-full max-w-3xl shadow-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D5]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#5F8575] text-white flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#3A3D34]">
                    Live Outgoing Transit Tracking & Arterial Route
                  </h3>
                  <p className="text-xs text-[#707565]">
                    From {currentHospital.name} to {activeRouteRequest.targetHospitalName || 'Receiving Facility'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveRouteRequest(null)}
                className="p-2 rounded-full bg-[#F1EDE4] text-[#707565] hover:text-[#3A3D34] hover:bg-[#EAE4D8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <EmergencyRouteMap
              originHospital={currentHospital}
              destinationHospital={getTargetHospital(activeRouteRequest)}
              emergencyType={activeRouteRequest.emergencyType}
              urgency={activeRouteRequest.urgency}
              ambulance={{
                vehicleNumber: 'MED-OUT-01',
                type: 'Advanced Life Support (ALS)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const ReservationsView: React.FC = () => {
  const { reservations, updateRequestStatus, currentHospital } = useMediLink();

  if (!currentHospital) return null;

  const hospitalReservations = reservations.filter(
    (r) => r.providingHospitalId === currentHospital.id || r.requestingHospitalId === currentHospital.id
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A3D34]">Active Resource Reservations</h2>
          <p className="text-xs sm:text-sm text-[#707565] mt-1">
            Locked assets with active countdown locks preventing race conditions across the network.
          </p>
        </div>
        <span className="text-xs font-semibold bg-[#FAF4EB] text-[#B07D38] px-3.5 py-1.5 rounded-full border border-[#EEDBBA] self-start sm:self-auto">
          {hospitalReservations.filter((r) => r.status === 'active').length} Active Locks
        </span>
      </div>

      {hospitalReservations.length === 0 ? (
        <div className="bg-white border border-[#E5E2D9] rounded-[32px] p-12 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#FAF4EB] text-[#B07D38] flex items-center justify-center mx-auto shadow-2xs">
            <Clock className="w-6 h-6" />
          </div>
          <h4 className="text-base font-serif font-bold text-[#3A3D34]">No Active Reservations</h4>
          <p className="text-xs text-[#707565] max-w-sm mx-auto">
            When an incoming emergency request is accepted, beds and assets are locked here with an automatic 15-minute countdown.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hospitalReservations.map((res) => {
            const minutes = Math.floor(res.secondsRemaining / 60);
            const seconds = res.secondsRemaining % 60;
            const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            return (
              <div
                key={res.id}
                className={`bg-white rounded-[32px] p-6 sm:p-7 border transition-all ${
                  res.status === 'active'
                    ? 'border-2 border-[#B07D38] shadow-sm'
                    : 'border-[#E5E2D9] shadow-2xs opacity-80'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E2D9]">
                  <span className="text-xs font-bold text-[#B07D38] uppercase bg-[#FAF4EB] px-3 py-1 rounded-full border border-[#EEDBBA]">
                    {String(res.resourceType).toUpperCase()} RESERVED
                  </span>
                  <span className="text-xs text-[#707565]">
                    ID: #{res.id.slice(-6)}
                  </span>
                </div>

                <div className="py-4 space-y-2 text-xs">
                  <div>
                    <span className="text-[#707565]">Locked Asset:</span>
                    <div className="text-sm font-serif font-bold text-[#3A3D34]">{res.resourceName} ({res.quantity} Units)</div>
                  </div>
                  <div>
                    <span className="text-[#707565]">Requested By:</span>
                    <div className="font-semibold text-[#3A3D34]">{res.requestingHospitalName}</div>
                  </div>

                  <div className="bg-[#FAF4EB] p-3 rounded-2xl border border-[#EEDBBA] flex items-center justify-between text-[#B07D38] mt-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      <Clock className="w-4 h-4 text-[#B07D38] animate-spin" />
                      <span>Auto-Lock Expiry:</span>
                    </span>
                    <span className="text-sm font-serif font-bold">{timeFormatted} remaining</span>
                  </div>
                </div>

                {/* Action Buttons */}
                {res.status === 'active' && (
                  <div className="pt-3 border-t border-[#E5E2D9] grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateRequestStatus(res.requestId, 'cancelled')}
                      className="py-2.5 px-3 rounded-full border border-[#DCD7CD] hover:bg-[#F1EDE4] text-[#707565] text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Release Asset
                    </button>
                    <button
                      onClick={() => updateRequestStatus(res.requestId, 'completed')}
                      className="py-2.5 px-3 rounded-full bg-[#8C947A] hover:bg-[#788066] text-[#F9F7F2] text-xs font-serif font-bold shadow-sm transition-colors cursor-pointer"
                    >
                      Patient Admitted ✓
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
