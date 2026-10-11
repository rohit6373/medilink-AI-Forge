export type VerificationStatus = 'verified' | 'pending' | 'rejected';
export type HospitalType = 'Government' | 'Private' | 'Multi-Specialty' | 'Emergency Center' | 'Specialty Hospital' | 'Other';
export type ResourceType = 'icu' | 'emergency_bed' | 'ventilator' | 'ambulance' | 'oxygen' | 'blood' | 'operating_theatre' | 'dialysis' | 'imaging' | 'cath_lab' | 'custom';
export type ResourceStatus = 'available' | 'reserved' | 'occupied' | 'unknown';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type EmergencyCategory = 'trauma' | 'cardiac' | 'respiratory' | 'neurological' | 'pediatric' | 'obstetric' | 'burn' | 'critical_care' | 'general' | 'custom';
export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low';
export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'reserved' | 'in_transit' | 'completed' | 'cancelled';
export type StaffRole = 'Hospital Admin' | 'Doctor' | 'Emergency Staff' | 'Resource Manager' | 'Ambulance Coordinator';
export type AmbulanceType = 'Basic Life Support' | 'Advanced Life Support' | 'ICU Ambulance' | 'General Ambulance';
export type AmbulanceStatus = 'Available' | 'Busy' | 'En Route' | 'Maintenance';

export interface BloodStock {
  group: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  units: number;
  lastVerified: string;
  confidence: ConfidenceLevel;
}

export interface ResourceItem {
  id: string;
  hospitalId: string;
  type: ResourceType;
  name: string;
  category?: string;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  occupiedQuantity: number;
  status: ResourceStatus;
  confidence: ConfidenceLevel;
  lastVerified: string;
  notes?: string;
}

export interface Specialist {
  id: string;
  hospitalId: string;
  name: string;
  specialty: string;
  isAvailable: boolean;
  shift: 'Morning' | 'Evening' | 'Night' | '24/7 On-Call';
  contact: string;
  experienceYears?: number;
}

export interface Ambulance {
  id: string;
  hospitalId: string;
  vehicleNumber: string;
  type: AmbulanceType;
  status: AmbulanceStatus;
  equipment: string[];
  currentLocationName: string;
  latitude: number;
  longitude: number;
  assignedRequestId?: string;
  etaMinutes?: number;
}

export interface StaffMember {
  id: string;
  hospitalId: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  isActive: boolean;
}

export interface Hospital {
  id: string;
  hospitalIdCode: string;
  name: string;
  organizationId?: string;
  type: HospitalType;
  email: string;
  phone: string;
  emergencyPhone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  totalBeds: number;
  hasEmergencyDepartment: boolean;
  has247Service: boolean;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  services: string[];
  resources: ResourceItem[];
  bloodInventory: BloodStock[];
  specialists: Specialist[];
  ambulances: Ambulance[];
  staff: StaffMember[];
  rating: number;
  createdAt: string;
}

export interface EmergencyRequest {
  id: string;
  requestingHospitalId: string;
  requestingHospitalName: string;
  targetHospitalId?: string;
  targetHospitalName?: string;
  emergencyType: EmergencyCategory;
  urgency: UrgencyLevel;
  patientSummary?: string;
  requiredResources: {
    resourceType: ResourceType | string;
    quantity: number;
    bloodGroup?: string;
  }[];
  requiredSpecialties?: string[];
  patientLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  notes?: string;
  status: RequestStatus;
  rejectionReason?: string;
  recommendedHospitalId?: string;
  matchScore?: number;
  etaMinutes?: number;
  createdAt: string;
  updatedAt: string;
  reservationId?: string;
}

export interface Reservation {
  id: string;
  requestId: string;
  requestingHospitalId: string;
  requestingHospitalName: string;
  providingHospitalId: string;
  providingHospitalName: string;
  resourceType: ResourceType | string;
  resourceName: string;
  quantity: number;
  reservedAt: string;
  expiresAt: string; // ISO string
  secondsRemaining: number;
  status: 'active' | 'fulfilled' | 'expired' | 'cancelled';
}

export interface NotificationItem {
  id: string;
  hospitalId: string;
  title: string;
  message: string;
  type: 'emergency_alert' | 'request_accepted' | 'request_rejected' | 'reservation_expiring' | 'verification' | 'system';
  relatedRequestId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  hospitalId: string;
  hospitalName: string;
  userEmail: string;
  action: string;
  category: 'resource' | 'request' | 'reservation' | 'verification' | 'ambulance' | 'specialist' | 'auth';
  details: string;
  timestamp: string;
}

export interface MatchScoreBreakdown {
  resourceMatch: number;
  emergencySuitability: number;
  etaScore: number;
  confidenceScore: number;
  distanceScore: number;
  overallScore: number;
}

export interface HospitalMatchResult {
  hospital: Hospital;
  overallScore: number;
  breakdown: MatchScoreBreakdown;
  distanceKm: number;
  etaMinutes: number;
  satisfiedRequirements: string[];
  missingRequirements: string[];
  isFullySatisfied: boolean;
  confidence: ConfidenceLevel;
  aiExplanation: string;
}

export interface AiRecommendationResponse {
  topRecommendation: HospitalMatchResult | null;
  rankedHospitals: HospitalMatchResult[];
  isPerfectMatchFound: boolean;
  partialMatchNote?: string;
  emergencyAdvice: string;
  alternativeOptions: string[];
}

export type SearchCategory =
  | 'all'
  | 'hospitals'
  | 'blood_banks'
  | 'ambulances'
  | 'emergency_centers'
  | 'specialists'
  | 'government'
  | 'guidelines'
  | 'healthcare_services';

export type ExternalSourceType =
  | 'Official Hospital Website'
  | 'Government Healthcare Portal'
  | 'Medical Organization'
  | 'Public Health Agency'
  | 'Emergency Service Registry'
  | 'Academic & Clinical Guideline'
  | 'General Healthcare Source';

export interface ExternalSearchResultItem {
  id: string;
  title: string;
  snippet: string;
  url: string;
  source: string;
  sourceType: ExternalSourceType;
  category: SearchCategory | string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  isOfficialOrGovernment: boolean;
  publishedDate?: string;
  phone?: string;
}

export interface GroundingSourceRef {
  title: string;
  url: string;
  snippet?: string;
}

export interface HealthcareSearchResponse {
  query: string;
  category: string;
  locationContext?: string;
  results: ExternalSearchResultItem[];
  aiSummary?: string;
  groundingSources?: GroundingSourceRef[];
  disclaimer: string;
  source: 'google_search_grounding' | 'verified_registry_fallback';
  timestamp: string;
}
