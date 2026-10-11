import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Hospital,
  EmergencyRequest,
  Reservation,
  NotificationItem,
  AuditLogItem,
  ResourceItem,
  Specialist,
  Ambulance,
  StaffMember,
  RequestStatus,
  ResourceStatus,
  ConfidenceLevel,
} from '../types';
import {
  INITIAL_HOSPITALS,
  INITIAL_REQUESTS,
  INITIAL_RESERVATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData';

interface SimulationState {
  isActive: boolean;
  step: number;
  title: string;
  description: string;
  primaryHospitalId?: string;
  secondaryHospitalId?: string;
}

interface MediLinkContextType {
  // State
  hospitals: Hospital[];
  currentHospital: Hospital;
  currentUserRole: string;
  requests: EmergencyRequest[];
  reservations: Reservation[];
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];
  activeIncomingAlert: EmergencyRequest | null;
  simulation: SimulationState;

  // Hospital Switch & Auth
  setCurrentHospitalId: (hospitalId: string) => void;
  switchHospital: (hospitalId: string) => void;
  loginHospital: (hospitalIdCodeOrEmail: string) => boolean;
  logout: () => void;
  registerHospital: (hospitalData: Omit<Hospital, 'id' | 'createdAt' | 'rating'>) => Hospital;
  verifyHospital: (hospitalId: string, status: 'verified' | 'rejected') => void;
  updateHospitalProfile: (hospitalId: string, updates: Partial<Hospital>) => void;

  // Resource Management
  addResource: (hospitalId: string, resource: Omit<ResourceItem, 'id' | 'hospitalId'>) => void;
  updateResource: (hospitalId: string, resourceId: string, updates: Partial<ResourceItem>) => void;
  removeResource: (hospitalId: string, resourceId: string) => void;
  updateResourceQuantity: (hospitalId: string, resourceId: string, availableQuantity: number) => void;
  updateResourceStatus: (hospitalId: string, resourceId: string, status: ResourceStatus) => void;
  updateBloodStock: (hospitalId: string, group: string, units: number) => void;

  // Specialists & Ambulances
  addSpecialist: (hospitalId: string, specialist: Omit<Specialist, 'id' | 'hospitalId'>) => void;
  removeSpecialist: (hospitalId: string, specialistId: string) => void;
  toggleSpecialistAvailability: (hospitalId: string, specialistId: string) => void;
  addAmbulance: (hospitalId: string, ambulance: Omit<Ambulance, 'id' | 'hospitalId'>) => void;
  updateAmbulanceStatus: (hospitalId: string, ambulanceId: string, status: Ambulance['status'], etaMinutes?: number) => void;

  // Staff Management
  addStaffMember: (hospitalId: string, staff: Omit<StaffMember, 'id' | 'hospitalId'>) => void;
  removeStaffMember: (hospitalId: string, staffId: string) => void;

  // Requests & Reservations
  createEmergencyRequest: (requestData: Omit<EmergencyRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => EmergencyRequest;
  sendRequestToHospital: (requestId: string, targetHospitalId: string) => void;
  acceptRequest: (requestId: string) => void;
  rejectRequest: (requestId: string, reason: string) => void;
  updateRequestStatus: (requestId: string, status: RequestStatus) => void;
  dismissIncomingAlert: () => void;

  // Notifications & Audit Logs
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: (hospitalId: string) => void;
  addAuditLog: (action: string, category: AuditLogItem['category'], details: string, hospitalId?: string) => void;

  // Emergency Simulation
  startSimulation: () => void;
  nextSimulationStep: () => void;
  resetSimulation: () => void;
  runSimulationScenario: (step: number) => void;
  resetDataToDemo: () => void;
  activeSimulationStep: number;
  isSimulating: boolean;

  // Request Action Aliases
  acceptEmergencyRequest: (requestId: string) => void;
  rejectEmergencyRequest: (requestId: string, reason?: string) => void;
}

const MediLinkContext = createContext<MediLinkContextType | undefined>(undefined);

const STORAGE_KEYS = {
  HOSPITALS: 'medilink_hospitals_v1',
  REQUESTS: 'medilink_requests_v1',
  RESERVATIONS: 'medilink_reservations_v1',
  NOTIFICATIONS: 'medilink_notifications_v1',
  AUDIT_LOGS: 'medilink_audit_logs_v1',
  CURRENT_HOSPITAL_ID: 'medilink_current_hosp_id_v1',
};

export const MediLinkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State from localStorage or defaults
  const [hospitals, setHospitals] = useState<Hospital[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HOSPITALS);
      return saved ? JSON.parse(saved) : INITIAL_HOSPITALS;
    } catch {
      return INITIAL_HOSPITALS;
    }
  });

  const [currentHospitalId, setCurrentHospitalIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_HOSPITAL_ID);
      return saved || 'hosp-citycare';
    } catch {
      return 'hosp-citycare';
    }
  });

  const [requests, setRequests] = useState<EmergencyRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
    } catch {
      return INITIAL_REQUESTS;
    }
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
      return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
    } catch {
      return INITIAL_RESERVATIONS;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [activeIncomingAlert, setActiveIncomingAlert] = useState<EmergencyRequest | null>(null);

  const [simulation, setSimulation] = useState<SimulationState>({
    isActive: false,
    step: 0,
    title: '',
    description: '',
  });

  // Current hospital object
  const currentHospital = hospitals.find((h) => h.id === currentHospitalId) || hospitals[0] || INITIAL_HOSPITALS[0];
  const currentUserRole = 'Hospital Admin';

  // 2. Persistence Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOSPITALS, JSON.stringify(hospitals));
  }, [hospitals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_HOSPITAL_ID, currentHospitalId);
  }, [currentHospitalId]);

  // 3. Reservation Countdown Timer Tick (every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setReservations((prevReservations) =>
        prevReservations.map((resv) => {
          if (resv.status !== 'active') return resv;
          const expiryTime = new Date(resv.expiresAt).getTime();
          const now = Date.now();
          const secondsRemaining = Math.max(0, Math.floor((expiryTime - now) / 1000));

          if (secondsRemaining === 0 && resv.status === 'active') {
            // Reservation expired! Un-reserve the resource
            setHospitals((prevHospitals) =>
              prevHospitals.map((h) => {
                if (h.id !== resv.providingHospitalId) return h;
                return {
                  ...h,
                  resources: h.resources.map((r) => {
                    if (r.type === resv.resourceType || r.name === resv.resourceName) {
                      return {
                        ...r,
                        availableQuantity: r.availableQuantity + resv.quantity,
                        reservedQuantity: Math.max(0, r.reservedQuantity - resv.quantity),
                        status: 'available',
                        lastVerified: 'Just now',
                      };
                    }
                    return r;
                  }),
                };
              })
            );

            // Notify
            setNotifications((prev) => [
              {
                id: `notif-${Date.now()}`,
                hospitalId: resv.requestingHospitalId,
                title: '⚠️ Resource Reservation Expired',
                message: `The 15-minute reservation for ${resv.resourceName} at ${resv.providingHospitalName} has expired.`,
                type: 'reservation_expiring',
                isRead: false,
                createdAt: new Date().toISOString(),
              },
              ...prev,
            ]);

            return { ...resv, secondsRemaining: 0, status: 'expired' };
          }

          return { ...resv, secondsRemaining };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 4. Audit Log Helper
  const addAuditLog = useCallback(
    (action: string, category: AuditLogItem['category'], details: string, hospitalId?: string) => {
      const targetHospId = hospitalId || currentHospitalId;
      const hosp = hospitals.find((h) => h.id === targetHospId) || currentHospital;
      const newLog: AuditLogItem = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        hospitalId: targetHospId,
        hospitalName: hosp.name,
        userEmail: hosp.email,
        action,
        category,
        details,
        timestamp: new Date().toISOString(),
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    },
    [currentHospitalId, hospitals, currentHospital]
  );

  // 5. Auth / Hospital Switch
  const setCurrentHospitalId = useCallback((id: string) => {
    setCurrentHospitalIdState(id);
  }, []);

  const switchHospital = useCallback(
    (id: string) => {
      const found = hospitals.find((h) => h.id === id);
      if (found) {
        setCurrentHospitalIdState(id);
        addAuditLog('Hospital Switched', 'auth', `Switched active command dashboard to ${found.name}`, id);
      }
    },
    [hospitals, addAuditLog]
  );

  const loginHospital = useCallback(
    (identifier: string): boolean => {
      const lower = identifier.toLowerCase().trim();
      const found = hospitals.find(
        (h) =>
          h.email.toLowerCase() === lower ||
          h.hospitalIdCode.toLowerCase() === lower ||
          h.name.toLowerCase().includes(lower)
      );
      if (found) {
        setCurrentHospitalIdState(found.id);
        addAuditLog('User Logged In', 'auth', `Hospital Administrator authenticated for ${found.name}`, found.id);
        return true;
      }
      return false;
    },
    [hospitals, addAuditLog]
  );

  const logout = useCallback(() => {
    addAuditLog('User Logged Out', 'auth', `Session ended for ${currentHospital.name}`);
  }, [addAuditLog, currentHospital]);

  // 6. Register & Verify Hospital
  const registerHospital = useCallback(
    (hospitalData: Omit<Hospital, 'id' | 'createdAt' | 'rating'>): Hospital => {
      const newId = `hosp-${Date.now()}`;
      const newHospital: Hospital = {
        ...hospitalData,
        id: newId,
        rating: 4.8,
        verificationStatus: 'pending',
        createdAt: new Date().toISOString(),
      };

      setHospitals((prev) => [...prev, newHospital]);
      addAuditLog('Hospital Registered', 'verification', `Submitted registration for ${newHospital.name}. Status: Pending Verification.`, newId);

      // Notification to network admin
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          hospitalId: newId,
          title: '📋 Hospital Registration Submitted',
          message: `${newHospital.name} profile submitted. Pending system admin verification.`,
          type: 'verification',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      return newHospital;
    },
    [addAuditLog]
  );

  const verifyHospital = useCallback(
    (hospitalId: string, status: 'verified' | 'rejected') => {
      setHospitals((prev) =>
        prev.map((h) => {
          if (h.id !== hospitalId) return h;
          return {
            ...h,
            verificationStatus: status,
            verifiedAt: status === 'verified' ? new Date().toISOString() : undefined,
          };
        })
      );
      const targetHosp = hospitals.find((h) => h.id === hospitalId);
      const hospName = targetHosp ? targetHosp.name : hospitalId;
      addAuditLog(
        status === 'verified' ? 'Hospital Verified' : 'Hospital Verification Rejected',
        'verification',
        `System Admin changed status of ${hospName} to ${status.toUpperCase()}`,
        hospitalId
      );

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          hospitalId: hospitalId,
          title: status === 'verified' ? '🟢 Hospital Verified!' : '❌ Verification Rejected',
          message:
            status === 'verified'
              ? `${hospName} is now verified and active in the MediLink real-time coordination network.`
              : `Verification for ${hospName} was rejected. Please contact network support.`,
          type: 'verification',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    [hospitals, addAuditLog]
  );

  const updateHospitalProfile = useCallback(
    (hospitalId: string, updates: Partial<Hospital>) => {
      setHospitals((prev) =>
        prev.map((h) => {
          if (h.id !== hospitalId) return h;
          return { ...h, ...updates };
        })
      );
      addAuditLog('Hospital Profile Updated', 'resource', `Updated hospital profile information`, hospitalId);
    },
    [addAuditLog]
  );

  // 7. Dynamic Resource Management
  const addResource = useCallback(
    (hospitalId: string, resource: Omit<ResourceItem, 'id' | 'hospitalId'>) => {
      const newResource: ResourceItem = {
        ...resource,
        id: `res-${Date.now()}`,
        hospitalId,
        lastVerified: 'Just now',
        confidence: 'HIGH',
      };
      setHospitals((prev) =>
        prev.map((h) => {
          if (h.id !== hospitalId) return h;
          return {
            ...h,
            resources: [...h.resources, newResource],
          };
        })
      );
      addAuditLog('Resource Added', 'resource', `Added resource "${newResource.name}" (${newResource.totalQuantity} units)`, hospitalId);
    },
    [addAuditLog]
  );

  const updateResource = useCallback(
    (hospitalId: string, resourceId: string, updates: Partial<ResourceItem>) => {
      setHospitals((prev) =>
        prev.map((h) => {
          if (h.id !== hospitalId) return h;
          return {
            ...h,
            resources: h.resources.map((r) => {
              if (r.id !== resourceId) return r;
              return {
                ...r,
                ...updates,
                lastVerified: 'Just now',
                confidence: 'HIGH' as ConfidenceLevel,
              };
            }),
          };
        })
      );
      addAuditLog('Resource Updated', 'resource', `Updated resource specifications (ID: ${resourceId})`, hospitalId);
    },
    [addAuditLog]
  );

  const removeResource = useCallback(
    (hospitalId: string, resourceId: string) => {
      let removedName = 'Resource';
      setHospitals((prev) =>
        prev.map((h) => {
          if (h.id !== hospitalId) return h;
          const found = h.resources.find((r) => r.id === resourceId);
          if (found) removedName = found.name;
          return {
            ...h,
            resources: h.resources.filter((r) => r.id !== resourceId),
          };
        })
      );
      addAuditLog('Resource Removed', 'resource', `Deleted resource "${removedName}" from hospital inventory`, hospitalId);
    },
    [addAuditLog]
  );

  const updateResourceQuantity = useCallback(
    (hospitalId: string, resourceId: string, availableQuantity: number) => {
      setHospitals((prev) =>
        prev.map((h) => {
          if (h.id !== hospitalId) return h;
          return {
            ...h,
            resources: h.resources.map((r) => {
              if (r.id !== resourceId) return r;
              const prevQty = r.availableQuantity;
              const newStatus: ResourceStatus = availableQuantity > 0 ? 'available' : 'occupied';
              addAuditLog(
                'Availability Updated',
                'resource',
                `${r.name} available quantity changed: ${prevQty} → ${availableQuantity} (${newStatus})`,
                hospitalId
              );
              return {
                ...r,
                availableQuantity,
                status: newStatus,
                lastVerified: 'Just now',
                confidence: 'HIGH' as ConfidenceLevel,
              };
            }),
          };
        })
      );
    },
    [addAuditLog]
  );

  const updateResourceStatus = useCallback(
    (hospitalId: string, resourceId: string, status: ResourceStatus) => {
      setHospitals((prev) =>
        prev.map((h) => {
          if (h.id !== hospitalId) return h;
          return {
            ...h,
            resources: h.resources.map((r) => {
              if (r.id !== resourceId) return r;
              return {
                ...r,
                status,
                lastVerified: 'Just now',
                confidence: 'HIGH' as ConfidenceLevel,
              };
            }),
          };
        })
      );
      addAuditLog('Resource Status Changed', 'resource', `Resource ${resourceId} status updated to ${status.toUpperCase()}`, hospitalId);
    },
    [addAuditLog]
  );

  const updateBloodStock = useCallback(
    (hospitalId: string, group: string, units: number) => {
      setHospitals((prev) =>
        prev.map((h) => {
          if (h.id !== hospitalId) return h;
          return {
            ...h,
            bloodInventory: h.bloodInventory.map((b) => {
              if (b.group !== group) return b;
              return {
                ...b,
                units,
                lastVerified: 'Just now',
                confidence: 'HIGH' as ConfidenceLevel,
              };
            }),
          };
        })
      );
      addAuditLog('Blood Stock Updated', 'resource', `Updated ${group} blood stock to ${units} units`, hospitalId);
    },
    [addAuditLog]
  );

  // 8. Specialists & Ambulances
  const addSpecialist = useCallback(
    (hospitalId: string, specialist: Omit<Specialist, 'id' | 'hospitalId'>) => {
      const newSpec: Specialist = {
        ...specialist,
        id: `spec-${Date.now()}`,
        hospitalId,
      };
      setHospitals((prev) =>
        prev.map((h) => {
          if (h.id !== hospitalId) return h;
          return { ...h, specialists: [...h.specialists, newSpec] };
        })
      );
      addAuditLog('Specialist Added', 'specialist', `Added specialist ${newSpec.name} (${newSpec.specialty})`, hospitalId);
    },
    [addAuditLog]
  );

  const removeSpecialist = useCallback(
    (hospitalId: string, specialistId: string) => {
      setHospitals((prev) =>
        prev.map((h) => {
          if (h.id !== hospitalId) return h;
          return { ...h, specialists: h.specialists.filter((s) => s.id !== specialistId) };
        })
      );
      addAuditLog('Specialist Removed', 'specialist', `Removed specialist record (ID: ${specialistId})`, hospitalId);
    },
    [addAuditLog]
  );

  const toggleSpecialistAvailability = useCallback(
    (hospitalId: string, specialistId: string) => {
      setHospitals((prev) =>
        prev.map((h) => {
          if (h.id !== hospitalId) return h;
          return {
            ...h,
            specialists: h.specialists.map((s) => {
              if (s.id !== specialistId) return s;
              const newAvail = !s.isAvailable;
              addAuditLog('Specialist Shift Toggled', 'specialist', `${s.name} (${s.specialty}) marked as ${newAvail ? 'Available' : 'Off-duty'}`, hospitalId);
              return { ...s, isAvailable: newAvail };
            }),
          };
        })
      );
    },
    [addAuditLog]
  );

  const addAmbulance = useCallback(
    (hospitalId: string, ambulance: Omit<Ambulance, 'id' | 'hospitalId'>) => {
      const newAmb: Ambulance = {
        ...ambulance,
        id: `amb-${Date.now()}`,
        hospitalId,
      };
      setHospitals((prev) =>
        prev.map((h) => {
          if (h.id !== hospitalId) return h;
          return { ...h, ambulances: [...h.ambulances, newAmb] };
        })
      );
      addAuditLog('Ambulance Registered', 'ambulance', `Added vehicle ${newAmb.vehicleNumber} (${newAmb.type})`, hospitalId);
    },
    [addAuditLog]
  );

  const updateAmbulanceStatus = useCallback(
    (hospitalId: string, ambulanceId: string, status: Ambulance['status'], etaMinutes?: number) => {
      setHospitals((prev) =>
        prev.map((h) => {
          if (h.id !== hospitalId) return h;
          return {
            ...h,
            ambulances: h.ambulances.map((a) => {
              if (a.id !== ambulanceId) return a;
              return { ...a, status, etaMinutes: etaMinutes ?? a.etaMinutes };
            }),
          };
        })
      );
      addAuditLog('Ambulance Status Updated', 'ambulance', `Vehicle status changed to ${status}${etaMinutes ? ` (ETA: ${etaMinutes}m)` : ''}`, hospitalId);
    },
    [addAuditLog]
  );

  // 9. Staff Member CRUD
  const addStaffMember = useCallback(
    (hospitalId: string, staff: Omit<StaffMember, 'id' | 'hospitalId'>) => {
      const newStaff: StaffMember = {
        ...staff,
        id: `st-${Date.now()}`,
        hospitalId,
      };
      setHospitals((prev) =>
        prev.map((h) => {
          if (h.id !== hospitalId) return h;
          return { ...h, staff: [...(h.staff || []), newStaff] };
        })
      );
      addAuditLog('Staff Member Added', 'auth', `Added ${newStaff.name} as ${newStaff.role}`, hospitalId);
    },
    [addAuditLog]
  );

  const removeStaffMember = useCallback(
    (hospitalId: string, staffId: string) => {
      setHospitals((prev) =>
        prev.map((h) => {
          if (h.id !== hospitalId) return h;
          return { ...h, staff: (h.staff || []).filter((s) => s.id !== staffId) };
        })
      );
      addAuditLog('Staff Member Removed', 'auth', `Removed staff ID: ${staffId}`, hospitalId);
    },
    [addAuditLog]
  );

  // 10. Emergency Requests & Real-time Coordination
  const createEmergencyRequest = useCallback(
    (requestData: Omit<EmergencyRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>): EmergencyRequest => {
      const newReq: EmergencyRequest = {
        ...requestData,
        id: `req-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setRequests((prev) => [newReq, ...prev]);
      addAuditLog(
        'Emergency Request Created',
        'request',
        `Created ${newReq.urgency.toUpperCase()} ${newReq.emergencyType} request with ${newReq.requiredResources.length} required resource(s)`,
        newReq.requestingHospitalId
      );

      return newReq;
    },
    [addAuditLog]
  );

  const sendRequestToHospital = useCallback(
    (requestId: string, targetHospitalId: string) => {
      const targetHosp = hospitals.find((h) => h.id === targetHospitalId);
      const targetHospName = targetHosp ? targetHosp.name : targetHospitalId;

      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== requestId) return r;
          const updated = {
            ...r,
            targetHospitalId,
            targetHospitalName: targetHospName,
            status: 'pending' as RequestStatus,
            updatedAt: new Date().toISOString(),
          };

          // If the active dashboard is currently the target hospital or user switches, trigger alert modal
          setActiveIncomingAlert(updated);
          return updated;
        })
      );

      // Create high-priority incoming alert notification for the receiving hospital
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          hospitalId: targetHospitalId,
          title: '🚨 CRITICAL RESOURCE REQUEST',
          message: `Incoming ${targetHospName} emergency transfer request. Immediate action required.`,
          type: 'emergency_alert',
          relatedRequestId: requestId,
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      addAuditLog('Request Dispatched', 'request', `Dispatched emergency request #${requestId} to ${targetHospName}`);
    },
    [hospitals, addAuditLog]
  );

  const acceptRequest = useCallback(
    (requestId: string) => {
      const req = requests.find((r) => r.id === requestId);
      if (!req || !req.targetHospitalId) return;

      const providerId = req.targetHospitalId;
      const reqHospitalId = req.requestingHospitalId;
      const targetHosp = hospitals.find((h) => h.id === providerId);

      // 1. Create a 15-minute Reservation
      const newReservationId = `resv-${Date.now()}`;
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      const newReservation: Reservation = {
        id: newReservationId,
        requestId,
        requestingHospitalId: reqHospitalId,
        requestingHospitalName: req.requestingHospitalName,
        providingHospitalId: providerId,
        providingHospitalName: targetHosp ? targetHosp.name : 'Target Hospital',
        resourceType: req.requiredResources[0]?.resourceType || 'icu',
        resourceName: req.requiredResources[0]?.resourceType === 'icu' ? 'ICU Bed' : String(req.requiredResources[0]?.resourceType),
        quantity: req.requiredResources[0]?.quantity || 1,
        reservedAt: new Date().toISOString(),
        expiresAt,
        secondsRemaining: 900,
        status: 'active',
      };

      setReservations((prev) => [newReservation, ...prev]);

      // 2. Shift Resource state from AVAILABLE -> RESERVED in hospital inventory
      setHospitals((prev) =>
        prev.map((h) => {
          if (h.id !== providerId) return h;
          return {
            ...h,
            resources: h.resources.map((r) => {
              const matchedReq = req.requiredResources.find(
                (reqItem) => reqItem.resourceType === r.type || r.name.toLowerCase().includes(String(reqItem.resourceType).toLowerCase())
              );
              if (matchedReq) {
                const qtyToReserve = Math.min(r.availableQuantity, matchedReq.quantity);
                const newAvail = Math.max(0, r.availableQuantity - qtyToReserve);
                const newReserved = r.reservedQuantity + qtyToReserve;
                return {
                  ...r,
                  availableQuantity: newAvail,
                  reservedQuantity: newReserved,
                  status: newAvail === 0 ? 'reserved' : r.status,
                  lastVerified: 'Just now',
                  confidence: 'HIGH' as ConfidenceLevel,
                };
              }
              return r;
            }),
          };
        })
      );

      // 3. Update Request Status to 'reserved' / 'in_transit'
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== requestId) return r;
          return {
            ...r,
            status: 'reserved',
            reservationId: newReservationId,
            updatedAt: new Date().toISOString(),
          };
        })
      );

      // 4. Notify Requesting Hospital
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          hospitalId: reqHospitalId,
          title: '✅ Request Accepted & Resources Reserved!',
          message: `${targetHosp?.name || 'Hospital'} accepted your emergency request. 15:00 min reservation locked.`,
          type: 'request_accepted',
          relatedRequestId: requestId,
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      addAuditLog(
        'Request Accepted & Reserved',
        'reservation',
        `Accepted request #${requestId} from ${req.requestingHospitalName}. Resource locked into RESERVED status (15-min expiry)`,
        providerId
      );

      setActiveIncomingAlert(null);
    },
    [requests, hospitals, addAuditLog]
  );

  const rejectRequest = useCallback(
    (requestId: string, reason: string) => {
      const req = requests.find((r) => r.id === requestId);
      if (!req) return;

      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== requestId) return r;
          return {
            ...r,
            status: 'rejected',
            rejectionReason: reason,
            updatedAt: new Date().toISOString(),
          };
        })
      );

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          hospitalId: req.requestingHospitalId,
          title: '❌ Emergency Request Declined',
          message: `${req.targetHospitalName || 'Target hospital'} could not accept request #${requestId}. Reason: ${reason}. MediLink is identifying alternate facilities.`,
          type: 'request_rejected',
          relatedRequestId: requestId,
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      addAuditLog('Request Rejected', 'request', `Declined request #${requestId}. Reason: ${reason}`, req.targetHospitalId);
      setActiveIncomingAlert(null);
    },
    [requests, addAuditLog]
  );

  const updateRequestStatus = useCallback(
    (requestId: string, status: RequestStatus) => {
      const req = requests.find((r) => r.id === requestId);
      if (!req) return;

      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status, updatedAt: new Date().toISOString() } : r))
      );

      // If status reaches 'completed', transition the resource from RESERVED -> OCCUPIED
      if (status === 'completed' && req.targetHospitalId) {
        setHospitals((prev) =>
          prev.map((h) => {
            if (h.id !== req.targetHospitalId) return h;
            return {
              ...h,
              resources: h.resources.map((r) => {
                const matched = req.requiredResources.find((reqItem) => reqItem.resourceType === r.type);
                if (matched) {
                  return {
                    ...r,
                    reservedQuantity: Math.max(0, r.reservedQuantity - matched.quantity),
                    occupiedQuantity: r.occupiedQuantity + matched.quantity,
                    status: r.availableQuantity === 0 ? 'occupied' : r.status,
                    lastVerified: 'Just now',
                  };
                }
                return r;
              }),
            };
          })
        );

        setReservations((prev) =>
          prev.map((resv) => (resv.requestId === requestId ? { ...resv, status: 'fulfilled' } : resv))
        );
      }

      addAuditLog('Request Status Updated', 'request', `Request #${requestId} status progressed to ${status.toUpperCase()}`);
    },
    [requests, addAuditLog]
  );

  const dismissIncomingAlert = useCallback(() => {
    setActiveIncomingAlert(null);
  }, []);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllNotificationsAsRead = useCallback((hospitalId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.hospitalId === hospitalId ? { ...n, isRead: true } : n))
    );
  }, []);

  // 11. Interactive Emergency Simulation Mode
  const startSimulation = useCallback(() => {
    setSimulation({
      isActive: true,
      step: 1,
      title: '🚨 Step 1: Mass Casualty Trauma Inbound',
      description:
        'A critical multi-vehicle trauma emergency is declared at CityCare Hospital. CityCare needs: 1 ICU Bed + 3 units O- Blood + Trauma Surgeon + ALS Ambulance.',
      primaryHospitalId: 'hosp-apex',
      secondaryHospitalId: 'hosp-lifeline',
    });
  }, []);

  const nextSimulationStep = useCallback(() => {
    setSimulation((prev) => {
      const nextStep = prev.step + 1;
      if (nextStep === 2) {
        // Step 2: MediLink analyzes & recommends Apex Emergency (94% match, 10 min ETA)
        return {
          ...prev,
          step: 2,
          title: '🤖 Step 2: AI Evaluates & Recommends Apex Emergency',
          description:
            'MediLink calculates Apex Emergency Hospital as the 94% top match (all resources available, 10 min ETA, Level-1 trauma surgeon Dr. Sean Patel on duty).',
        };
      }
      if (nextStep === 3) {
        // Step 3: Hospital A sends request -> Apex accepts -> ICU becomes RESERVED
        // Update Apex Hospital ICU
        setHospitals((prevH) =>
          prevH.map((h) => {
            if (h.id === 'hosp-apex') {
              return {
                ...h,
                resources: h.resources.map((r) =>
                  r.type === 'icu'
                    ? {
                        ...r,
                        availableQuantity: 0,
                        reservedQuantity: 8,
                        occupiedQuantity: 10,
                        status: 'reserved',
                        lastVerified: 'Just now',
                      }
                    : r
                ),
              };
            }
            return h;
          })
        );

        return {
          ...prev,
          step: 3,
          title: '🔒 Step 3: Reservation Locked (Available → Reserved)',
          description:
            'Apex Emergency accepts the transfer. Apex ICU status immediately flips to RESERVED (15-min lock), preventing double-booking across the network.',
        };
      }
      if (nextStep === 4) {
        // Step 4: Another emergency arrives at Apex -> Apex ICU is now 100% OCCUPIED -> MediLink dynamically recalculates and recommends LifeLine Medical Center!
        setHospitals((prevH) =>
          prevH.map((h) => {
            if (h.id === 'hosp-apex') {
              return {
                ...h,
                resources: h.resources.map((r) =>
                  r.type === 'icu'
                    ? {
                        ...r,
                        availableQuantity: 0,
                        reservedQuantity: 0,
                        occupiedQuantity: 18,
                        status: 'occupied',
                        lastVerified: 'Just now',
                      }
                    : r
                ),
              };
            }
            return h;
          })
        );

        return {
          ...prev,
          step: 4,
          title: '⚡ Step 4: Dynamic Recalculation (Switch to LifeLine)',
          description:
            'Apex Emergency reaches full capacity. MediLink instantly detects zero available ICU beds and dynamically recalculates the network, seamlessly routing new emergency transfers to LifeLine Medical Center (91% Match)!',
        };
      }
      return { ...prev, isActive: false, step: 0 };
    });
  }, []);

  const resetDataToDemo = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.HOSPITALS);
      localStorage.removeItem(STORAGE_KEYS.REQUESTS);
      localStorage.removeItem(STORAGE_KEYS.RESERVATIONS);
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
      localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    } catch {
      // ignore
    }

    setHospitals(INITIAL_HOSPITALS);
    setRequests(INITIAL_REQUESTS);
    setReservations(INITIAL_RESERVATIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSimulation({
      isActive: false,
      step: 1,
      title: '',
      description: '',
    });
  }, []);

  const runSimulationScenario = useCallback((stepNumber: number) => {
    const titles = [
      '',
      '🚨 Incident Occurrence & Dispatch',
      '🤖 AI Multi-Hospital Evaluation',
      '🔒 One-Click Acceptance & Lock',
      '⚡ Dynamic Cascade Re-routing',
      '✅ Transfer Completion & Handoff',
    ];
    const descs = [
      '',
      'Multi-vehicle collision on Highway 101. CityCare Hospital triage receives 3 critical trauma victims and broadcasts an emergency asset request for 1 ICU Bed + 2 units O- Blood + Trauma Surgeon.',
      'MediLink continuously calculates availability, clinical suitability, and real-time transit ETA across all 5 verified facilities. Apex Emergency ranks #1 (94% Match score, 10 min ETA).',
      'Apex Emergency accepts the transfer. MediLink locks 1 ICU Bed + 2 units O- Blood into RESERVED status with an active 15:00 countdown timer, preventing race conditions.',
      'A secondary acute cardiac emergency occurs in the area. Because Apex is now near capacity, MediLink automatically recalculates and seamlessly routes the new cardiac request to LifeLine Medical!',
      'Ambulance arrives at Apex Emergency. The reserved ICU bed transitions cleanly to OCCUPIED. Complete audit trail logged to compliance ledger.',
    ];

    setSimulation({
      isActive: true,
      step: stepNumber,
      title: titles[stepNumber] || `Step ${stepNumber}`,
      description: descs[stepNumber] || '',
      primaryHospitalId: 'hosp-apex',
      secondaryHospitalId: 'hosp-lifeline',
    });

    if (stepNumber === 1) {
      setHospitals((prevH) =>
        prevH.map((h) => {
          if (h.id === 'hosp-apex') {
            return {
              ...h,
              resources: h.resources.map((r) =>
                r.type === 'icu'
                  ? { ...r, availableQuantity: 8, reservedQuantity: 2, occupiedQuantity: 8, status: 'available' }
                  : r.type === 'blood_o_neg'
                  ? { ...r, availableQuantity: 12, reservedQuantity: 2, occupiedQuantity: 0, status: 'available' }
                  : r
              ),
            };
          }
          return h;
        })
      );
    } else if (stepNumber === 3) {
      setHospitals((prevH) =>
        prevH.map((h) => {
          if (h.id === 'hosp-apex') {
            return {
              ...h,
              resources: h.resources.map((r) =>
                r.type === 'icu'
                  ? {
                      ...r,
                      availableQuantity: 0,
                      reservedQuantity: 8,
                      occupiedQuantity: 10,
                      status: 'reserved',
                      lastVerified: 'Just now',
                    }
                  : r.type === 'blood_o_neg'
                  ? {
                      ...r,
                      availableQuantity: 2,
                      reservedQuantity: 10,
                      status: 'reserved',
                      lastVerified: 'Just now',
                    }
                  : r
              ),
            };
          }
          return h;
        })
      );
    } else if (stepNumber === 4) {
      setHospitals((prevH) =>
        prevH.map((h) => {
          if (h.id === 'hosp-apex') {
            return {
              ...h,
              resources: h.resources.map((r) =>
                r.type === 'icu'
                  ? {
                      ...r,
                      availableQuantity: 0,
                      reservedQuantity: 0,
                      occupiedQuantity: 18,
                      status: 'occupied',
                      lastVerified: 'Just now',
                    }
                  : r
              ),
            };
          }
          return h;
        })
      );
    } else if (stepNumber === 5) {
      setHospitals((prevH) =>
        prevH.map((h) => {
          if (h.id === 'hosp-apex') {
            return {
              ...h,
              resources: h.resources.map((r) =>
                r.type === 'icu'
                  ? {
                      ...r,
                      availableQuantity: 7,
                      reservedQuantity: 0,
                      occupiedQuantity: 11,
                      status: 'available',
                      lastVerified: 'Just now',
                    }
                  : r
              ),
            };
          }
          return h;
        })
      );
    }
  }, []);

  const resetSimulation = useCallback(() => {
    resetDataToDemo();
  }, [resetDataToDemo]);

  const acceptEmergencyRequest = acceptRequest;
  const rejectEmergencyRequest = useCallback(
    (requestId: string, reason?: string) => {
      rejectRequest(requestId, reason || 'Declined by triage facility');
    },
    [rejectRequest]
  );

  return (
    <MediLinkContext.Provider
      value={{
        hospitals,
        currentHospital,
        currentUserRole,
        requests,
        reservations,
        notifications,
        auditLogs,
        activeIncomingAlert,
        simulation,
        activeSimulationStep: simulation.step,
        isSimulating: simulation.isActive,
        setCurrentHospitalId,
        switchHospital,
        loginHospital,
        logout,
        registerHospital,
        verifyHospital,
        updateHospitalProfile,
        addResource,
        updateResource,
        removeResource,
        updateResourceQuantity,
        updateResourceStatus,
        updateBloodStock,
        addSpecialist,
        removeSpecialist,
        toggleSpecialistAvailability,
        addAmbulance,
        updateAmbulanceStatus,
        addStaffMember,
        removeStaffMember,
        createEmergencyRequest,
        sendRequestToHospital,
        acceptRequest,
        rejectRequest,
        acceptEmergencyRequest,
        rejectEmergencyRequest,
        updateRequestStatus,
        dismissIncomingAlert,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addAuditLog,
        startSimulation,
        nextSimulationStep,
        resetSimulation,
        runSimulationScenario,
        resetDataToDemo,
      }}
    >
      {children}
    </MediLinkContext.Provider>
  );
};

export const useMediLink = () => {
  const context = useContext(MediLinkContext);
  if (!context) {
    throw new Error('useMediLink must be used within a MediLinkProvider');
  }
  return context;
};
