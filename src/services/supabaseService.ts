import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Hospital, EmergencyRequest, Reservation, AuditLogItem, NotificationItem } from '../types';

// Supabase configuration for project "Medilink" (ID: vdcdgqapezrttqezplxu)
export const SUPABASE_CONFIG = {
  projectName: 'Medilink',
  projectId: 'vdcdgqapezrttqezplxu',
  url:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
    'https://vdcdgqapezrttqezplxu.supabase.co',
  anonKey:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
    'sb_publishable_RvKajQDrqWj9yqQc9jxM0g_ZAHJUkv6',
};

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseInstance;
}

export interface SupabaseStatus {
  connected: boolean;
  url: string;
  projectId: string;
  projectName: string;
  latencyMs?: number;
  tablesStatus?: {
    hospitals: boolean;
    emergency_requests: boolean;
    reservations: boolean;
    audit_logs: boolean;
  };
  errorMessage?: string;
}

/**
 * Tests connection to Supabase instance
 */
export async function checkSupabaseConnection(): Promise<SupabaseStatus> {
  const start = performance.now();
  try {
    const supabase = getSupabase();
    // Test auth or a simple query
    const { error: authError } = await supabase.auth.getSession();
    
    // Check tables existence gracefully
    const [hospRes, reqRes, resvRes, auditRes] = await Promise.allSettled([
      supabase.from('hospitals').select('id').limit(1),
      supabase.from('emergency_requests').select('id').limit(1),
      supabase.from('reservations').select('id').limit(1),
      supabase.from('audit_logs').select('id').limit(1),
    ]);

    const latencyMs = Math.round(performance.now() - start);

    return {
      connected: !authError,
      url: SUPABASE_CONFIG.url,
      projectId: SUPABASE_CONFIG.projectId,
      projectName: SUPABASE_CONFIG.projectName,
      latencyMs,
      tablesStatus: {
        hospitals: hospRes.status === 'fulfilled' && !hospRes.value.error,
        emergency_requests: reqRes.status === 'fulfilled' && !reqRes.value.error,
        reservations: resvRes.status === 'fulfilled' && !resvRes.value.error,
        audit_logs: auditRes.status === 'fulfilled' && !auditRes.value.error,
      },
    };
  } catch (err: any) {
    return {
      connected: false,
      url: SUPABASE_CONFIG.url,
      projectId: SUPABASE_CONFIG.projectId,
      projectName: SUPABASE_CONFIG.projectName,
      errorMessage: err.message || 'Could not connect to Supabase cluster',
    };
  }
}

/**
 * Fetch all hospitals from Supabase
 */
export async function fetchHospitalsFromSupabase(): Promise<Hospital[] | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('Supabase fetchHospitals notice:', error.message);
      return null;
    }
    return (data as any) || null;
  } catch (err) {
    console.warn('Supabase fetchHospitals error:', err);
    return null;
  }
}

/**
 * Upsert hospital to Supabase
 */
export async function syncHospitalToSupabase(hospital: Hospital): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('hospitals')
      .upsert(
        {
          id: hospital.id,
          hospital_id_code: hospital.hospitalIdCode,
          name: hospital.name,
          address: hospital.address,
          city: hospital.city,
          latitude: hospital.latitude,
          longitude: hospital.longitude,
          emergency_phone: hospital.emergencyPhone,
          type: hospital.type,
          verification_status: hospital.verificationStatus,
          rating: hospital.rating,
          resources: hospital.resources,
          blood_inventory: hospital.bloodInventory,
          specialists: hospital.specialists,
          ambulances: hospital.ambulances,
          staff: hospital.staff || [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.warn('Supabase syncHospital notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase syncHospital error:', err);
    return false;
  }
}

/**
 * Save emergency request to Supabase
 */
export async function saveRequestToSupabase(req: EmergencyRequest): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('emergency_requests')
      .upsert(
        {
          id: req.id,
          requesting_hospital_id: req.requestingHospitalId,
          requesting_hospital_name: req.requestingHospitalName,
          target_hospital_id: req.targetHospitalId || null,
          target_hospital_name: req.targetHospitalName || null,
          urgency: req.urgency,
          emergency_type: req.emergencyType,
          status: req.status,
          required_resources: req.requiredResources,
          notes: req.notes,
          eta_minutes: req.etaMinutes || null,
          reservation_id: req.reservationId || null,
          created_at: req.createdAt,
          updated_at: req.updatedAt || new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.warn('Supabase saveRequest notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase saveRequest error:', err);
    return false;
  }
}

/**
 * Save reservation to Supabase
 */
export async function saveReservationToSupabase(resv: Reservation): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('reservations')
      .upsert(
        {
          id: resv.id,
          request_id: resv.requestId,
          requesting_hospital_id: resv.requestingHospitalId,
          requesting_hospital_name: resv.requestingHospitalName,
          providing_hospital_id: resv.providingHospitalId,
          providing_hospital_name: resv.providingHospitalName,
          resource_type: resv.resourceType,
          resource_name: resv.resourceName,
          quantity: resv.quantity,
          status: resv.status,
          reserved_at: resv.reservedAt,
          expires_at: resv.expiresAt,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.warn('Supabase saveReservation notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase saveReservation error:', err);
    return false;
  }
}

/**
 * Save audit log entry to Supabase
 */
export async function saveAuditLogToSupabase(log: AuditLogItem): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('audit_logs').insert({
      id: log.id,
      hospital_id: log.hospitalId,
      hospital_name: log.hospitalName,
      user_email: log.userEmail,
      action: log.action,
      category: log.category,
      details: log.details,
      timestamp: log.timestamp,
    });

    if (error) {
      console.warn('Supabase saveAuditLog notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase saveAuditLog error:', err);
    return false;
  }
}

/**
 * Generate PostgreSQL DDL for Supabase SQL Editor
 */
export function getMediLinkSupabaseSchemaSQL(): string {
  return `-- ====================================================================
-- MediLink Emergency Health Network Database Schema for Supabase
-- Project ID: vdcdgqapezrttqezplxu | Database: PostgreSQL 15+
-- ====================================================================

-- 1. HOSPITALS TABLE
CREATE TABLE IF NOT EXISTS public.hospitals (
  id TEXT PRIMARY KEY,
  hospital_id_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  emergency_phone TEXT NOT NULL,
  type TEXT NOT NULL,
  verification_status TEXT DEFAULT 'verified',
  rating NUMERIC DEFAULT 4.8,
  resources JSONB DEFAULT '[]'::jsonb,
  blood_inventory JSONB DEFAULT '[]'::jsonb,
  specialists JSONB DEFAULT '[]'::jsonb,
  ambulances JSONB DEFAULT '[]'::jsonb,
  staff JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EMERGENCY REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.emergency_requests (
  id TEXT PRIMARY KEY,
  requesting_hospital_id TEXT NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  requesting_hospital_name TEXT NOT NULL,
  target_hospital_id TEXT REFERENCES public.hospitals(id) ON DELETE SET NULL,
  target_hospital_name TEXT,
  urgency TEXT NOT NULL,
  emergency_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  required_resources JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  eta_minutes INTEGER,
  reservation_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RESERVATIONS TABLE (15-Minute Locked Asset Holds)
CREATE TABLE IF NOT EXISTS public.reservations (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  requesting_hospital_id TEXT NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  requesting_hospital_name TEXT NOT NULL,
  providing_hospital_id TEXT NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  providing_hospital_name TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  reserved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COMPLIANCE AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  hospital_id TEXT REFERENCES public.hospitals(id) ON DELETE SET NULL,
  hospital_name TEXT NOT NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  category TEXT NOT NULL,
  details TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public / authenticated read & write for MediLink emergency node sync
CREATE POLICY "Public Read Access on Hospitals" ON public.hospitals FOR SELECT USING (true);
CREATE POLICY "Public Upsert Access on Hospitals" ON public.hospitals FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Access on Requests" ON public.emergency_requests FOR SELECT USING (true);
CREATE POLICY "Public Upsert Access on Requests" ON public.emergency_requests FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Access on Reservations" ON public.reservations FOR SELECT USING (true);
CREATE POLICY "Public Upsert Access on Reservations" ON public.reservations FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Access on Audit Logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Public Insert Access on Audit Logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- Enable Realtime Broadcast for emergency alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hospitals;
`;
}
