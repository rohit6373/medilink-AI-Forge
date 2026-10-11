import { Hospital, EmergencyRequest, Reservation, NotificationItem, AuditLogItem } from '../types';

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-citycare',
    hospitalIdCode: 'HOSP-CC-01',
    name: 'CityCare Hospital',
    organizationId: 'org-citycare-network',
    type: 'Multi-Specialty',
    email: 'admin@citycare.com',
    phone: '+1 (555) 234-5678',
    emergencyPhone: '+1 (555) 911-0101',
    website: 'https://citycare.medilink.org',
    address: '450 Healthcare Boulevard, Suite 100',
    city: 'Metro City',
    state: 'CA',
    pincode: '90210',
    latitude: 37.7749,
    longitude: -122.4194,
    totalBeds: 450,
    hasEmergencyDepartment: true,
    has247Service: true,
    verificationStatus: 'verified',
    verifiedAt: '2026-01-10T08:00:00.000Z',
    rating: 4.9,
    createdAt: '2025-11-15T09:00:00.000Z',
    services: [
      'ICU',
      'Emergency Beds',
      'Trauma Center',
      'Cardiology',
      'Cath Lab',
      'Neurology',
      'Pulmonology',
      'Blood Bank',
      'Imaging (CT/MRI)',
      'Operating Theatre',
      'Ambulance Service',
      'Dialysis'
    ],
    resources: [
      {
        id: 'res-cc-icu',
        hospitalId: 'hosp-citycare',
        type: 'icu',
        name: 'ICU Beds (Level 1)',
        category: 'Critical Care',
        totalQuantity: 20,
        availableQuantity: 4,
        reservedQuantity: 2,
        occupiedQuantity: 14,
        status: 'available',
        confidence: 'HIGH',
        lastVerified: '2 mins ago',
        notes: 'Equipped with invasive hemodynamics & telemetry'
      },
      {
        id: 'res-cc-er',
        hospitalId: 'hosp-citycare',
        type: 'emergency_bed',
        name: 'Emergency Resuscitation Beds',
        category: 'Emergency Department',
        totalQuantity: 15,
        availableQuantity: 7,
        reservedQuantity: 1,
        occupiedQuantity: 7,
        status: 'available',
        confidence: 'HIGH',
        lastVerified: '3 mins ago'
      },
      {
        id: 'res-cc-vent',
        hospitalId: 'hosp-citycare',
        type: 'ventilator',
        name: 'Mechanical Ventilators (Adult/Pediatric)',
        category: 'Respiratory',
        totalQuantity: 18,
        availableQuantity: 5,
        reservedQuantity: 1,
        occupiedQuantity: 12,
        status: 'available',
        confidence: 'HIGH',
        lastVerified: '5 mins ago'
      },
      {
        id: 'res-cc-ot',
        hospitalId: 'hosp-citycare',
        type: 'operating_theatre',
        name: 'Emergency Trauma OT',
        category: 'Surgical',
        totalQuantity: 6,
        availableQuantity: 2,
        reservedQuantity: 0,
        occupiedQuantity: 4,
        status: 'available',
        confidence: 'HIGH',
        lastVerified: '10 mins ago'
      },
      {
        id: 'res-cc-oxygen',
        hospitalId: 'hosp-citycare',
        type: 'oxygen',
        name: 'High-Flow Oxygen Units',
        category: 'Respiratory',
        totalQuantity: 40,
        availableQuantity: 24,
        reservedQuantity: 0,
        occupiedQuantity: 16,
        status: 'available',
        confidence: 'HIGH',
        lastVerified: '15 mins ago'
      },
      {
        id: 'res-cc-dialysis',
        hospitalId: 'hosp-citycare',
        type: 'dialysis',
        name: 'CRRT Dialysis Units',
        category: 'Nephrology',
        totalQuantity: 8,
        availableQuantity: 3,
        reservedQuantity: 0,
        occupiedQuantity: 5,
        status: 'available',
        confidence: 'HIGH',
        lastVerified: '12 mins ago'
      }
    ],
    bloodInventory: [
      { group: 'O+', units: 18, lastVerified: '10 mins ago', confidence: 'HIGH' },
      { group: 'O-', units: 6, lastVerified: '10 mins ago', confidence: 'HIGH' },
      { group: 'A+', units: 14, lastVerified: '15 mins ago', confidence: 'HIGH' },
      { group: 'A-', units: 4, lastVerified: '15 mins ago', confidence: 'HIGH' },
      { group: 'B+', units: 12, lastVerified: '20 mins ago', confidence: 'HIGH' },
      { group: 'B-', units: 3, lastVerified: '20 mins ago', confidence: 'HIGH' },
      { group: 'AB+', units: 8, lastVerified: '30 mins ago', confidence: 'HIGH' },
      { group: 'AB-', units: 2, lastVerified: '30 mins ago', confidence: 'HIGH' }
    ],
    specialists: [
      {
        id: 'spec-cc-1',
        hospitalId: 'hosp-citycare',
        name: 'Dr. Sarah Jenkins',
        specialty: 'Trauma Surgeon',
        isAvailable: true,
        shift: '24/7 On-Call',
        contact: 'Ext. 401',
        experienceYears: 14
      },
      {
        id: 'spec-cc-2',
        hospitalId: 'hosp-citycare',
        name: 'Dr. Marcus Vance',
        specialty: 'Cardiologist',
        isAvailable: true,
        shift: 'Morning',
        contact: 'Ext. 402',
        experienceYears: 18
      },
      {
        id: 'spec-cc-3',
        hospitalId: 'hosp-citycare',
        name: 'Dr. Elena Rostova',
        specialty: 'Pulmonologist / Intensivist',
        isAvailable: true,
        shift: 'Morning',
        contact: 'Ext. 405',
        experienceYears: 11
      },
      {
        id: 'spec-cc-4',
        hospitalId: 'hosp-citycare',
        name: 'Dr. David Chen',
        specialty: 'Neurologist',
        isAvailable: true,
        shift: 'Evening',
        contact: 'Ext. 408',
        experienceYears: 15
      }
    ],
    ambulances: [
      {
        id: 'amb-cc-01',
        hospitalId: 'hosp-citycare',
        vehicleNumber: 'MED-CC-101',
        type: 'Advanced Life Support',
        status: 'Available',
        equipment: ['Defibrillator', 'Ventilator', 'Multipara Monitor', 'Telemetry'],
        currentLocationName: 'Station Bay 1 - CityCare',
        latitude: 37.7749,
        longitude: -122.4194,
        etaMinutes: 8
      },
      {
        id: 'amb-cc-02',
        hospitalId: 'hosp-citycare',
        vehicleNumber: 'MED-CC-102',
        type: 'ICU Ambulance',
        status: 'Available',
        equipment: ['ECMO Transport', 'Ventilator', 'Infusion Pumps', 'Suction'],
        currentLocationName: 'North District Station',
        latitude: 37.7812,
        longitude: -122.4105,
        etaMinutes: 11
      }
    ],
    staff: [
      { id: 'st-1', hospitalId: 'hosp-citycare', name: 'Dr. Robert Thorne (Admin)', email: 'admin@citycare.com', phone: '+1 (555) 019-2831', role: 'Hospital Admin', isActive: true },
      { id: 'st-2', hospitalId: 'hosp-citycare', name: 'Nurse Jessica Alba', email: 'j.alba@citycare.com', phone: '+1 (555) 019-2832', role: 'Emergency Staff', isActive: true },
      { id: 'st-3', hospitalId: 'hosp-citycare', name: 'Michael Reynolds', email: 'm.reynolds@citycare.com', phone: '+1 (555) 019-2833', role: 'Resource Manager', isActive: true }
    ]
  },
  {
    id: 'hosp-metro',
    hospitalIdCode: 'HOSP-MG-02',
    name: 'Metro General Hospital',
    organizationId: 'org-metro-health',
    type: 'Government',
    email: 'contact@metrogeneral.org',
    phone: '+1 (555) 345-6789',
    emergencyPhone: '+1 (555) 911-0202',
    website: 'https://metrogeneral.medilink.org',
    address: '820 Civic Center Plaza',
    city: 'Metro City',
    state: 'CA',
    pincode: '90212',
    latitude: 37.7905,
    longitude: -122.4012,
    totalBeds: 600,
    hasEmergencyDepartment: true,
    has247Service: true,
    verificationStatus: 'verified',
    verifiedAt: '2026-01-12T10:00:00.000Z',
    rating: 4.7,
    createdAt: '2025-10-01T08:00:00.000Z',
    services: [
      'Emergency Beds',
      'Cardiology',
      'Pulmonology',
      'Blood Bank',
      'Imaging (CT/MRI)',
      'Operating Theatre',
      'Ambulance Service',
      'Obstetrics'
    ],
    resources: [
      {
        id: 'res-mg-icu',
        hospitalId: 'hosp-metro',
        type: 'icu',
        name: 'ICU Beds (Standard)',
        category: 'Critical Care',
        totalQuantity: 25,
        availableQuantity: 0,
        reservedQuantity: 0,
        occupiedQuantity: 25,
        status: 'occupied',
        confidence: 'HIGH',
        lastVerified: '4 mins ago',
        notes: 'Full capacity due to mass casualty transfer'
      },
      {
        id: 'res-mg-er',
        hospitalId: 'hosp-metro',
        type: 'emergency_bed',
        name: 'ER Triage Bays',
        category: 'Emergency Department',
        totalQuantity: 20,
        availableQuantity: 4,
        reservedQuantity: 1,
        occupiedQuantity: 15,
        status: 'available',
        confidence: 'HIGH',
        lastVerified: '8 mins ago'
      },
      {
        id: 'res-mg-vent',
        hospitalId: 'hosp-metro',
        type: 'ventilator',
        name: 'Mechanical Ventilators',
        category: 'Respiratory',
        totalQuantity: 15,
        availableQuantity: 2,
        reservedQuantity: 0,
        occupiedQuantity: 13,
        status: 'available',
        confidence: 'HIGH',
        lastVerified: '12 mins ago'
      },
      {
        id: 'res-mg-oxygen',
        hospitalId: 'hosp-metro',
        type: 'oxygen',
        name: 'Oxygen Concentrators',
        category: 'Respiratory',
        totalQuantity: 50,
        availableQuantity: 30,
        reservedQuantity: 0,
        occupiedQuantity: 20,
        status: 'available',
        confidence: 'HIGH',
        lastVerified: '25 mins ago'
      }
    ],
    bloodInventory: [
      { group: 'O+', units: 24, lastVerified: '20 mins ago', confidence: 'HIGH' },
      { group: 'O-', units: 1, lastVerified: '20 mins ago', confidence: 'MEDIUM' },
      { group: 'A+', units: 19, lastVerified: '20 mins ago', confidence: 'HIGH' },
      { group: 'B+', units: 16, lastVerified: '20 mins ago', confidence: 'HIGH' },
      { group: 'AB+', units: 10, lastVerified: '35 mins ago', confidence: 'HIGH' }
    ],
    specialists: [
      {
        id: 'spec-mg-1',
        hospitalId: 'hosp-metro',
        name: 'Dr. Gregory Houseman',
        specialty: 'Trauma Surgeon',
        isAvailable: false,
        shift: 'Night',
        contact: 'Ext. 301',
        experienceYears: 20
      },
      {
        id: 'spec-mg-2',
        hospitalId: 'hosp-metro',
        name: 'Dr. Sanjay Gupta',
        specialty: 'Neurologist',
        isAvailable: true,
        shift: 'Morning',
        contact: 'Ext. 304',
        experienceYears: 16
      }
    ],
    ambulances: [
      {
        id: 'amb-mg-01',
        hospitalId: 'hosp-metro',
        vehicleNumber: 'MED-MG-201',
        type: 'Basic Life Support',
        status: 'Busy',
        equipment: ['Oxygen', 'First Aid', 'Stretcher'],
        currentLocationName: 'In Transit - Hwy 101',
        latitude: 37.785,
        longitude: -122.405,
        etaMinutes: 27
      }
    ],
    staff: [
      { id: 'st-4', hospitalId: 'hosp-metro', name: 'Dr. Patricia Hayes', email: 'contact@metrogeneral.org', phone: '+1 (555) 019-3801', role: 'Hospital Admin', isActive: true }
    ]
  },
  {
    id: 'hosp-lifeline',
    hospitalIdCode: 'HOSP-LL-03',
    name: 'LifeLine Medical Center',
    organizationId: 'org-lifeline-care',
    type: 'Private',
    email: 'admin@lifelinemed.com',
    phone: '+1 (555) 456-7890',
    emergencyPhone: '+1 (555) 911-0303',
    website: 'https://lifeline.medilink.org',
    address: '1200 Pacific Heights Expressway',
    city: 'Metro City',
    state: 'CA',
    pincode: '90214',
    latitude: 37.7602,
    longitude: -122.435,
    totalBeds: 320,
    hasEmergencyDepartment: true,
    has247Service: true,
    verificationStatus: 'verified',
    verifiedAt: '2026-01-18T11:00:00.000Z',
    rating: 4.8,
    createdAt: '2025-12-01T10:00:00.000Z',
    services: [
      'ICU',
      'Emergency Beds',
      'Trauma Center',
      'Cardiology',
      'Cath Lab',
      'Ventilators',
      'Blood Bank',
      'Imaging (CT/MRI)',
      'Operating Theatre',
      'Ambulance Service'
    ],
    resources: [
      {
        id: 'res-ll-icu',
        hospitalId: 'hosp-lifeline',
        type: 'icu',
        name: 'ICU Beds (Cardiac & Trauma)',
        category: 'Critical Care',
        totalQuantity: 16,
        availableQuantity: 6,
        reservedQuantity: 1,
        occupiedQuantity: 9,
        status: 'available',
        confidence: 'HIGH',
        lastVerified: '6 mins ago',
        notes: 'Backup trauma ICU open'
      },
      {
        id: 'res-ll-er',
        hospitalId: 'hosp-lifeline',
        type: 'emergency_bed',
        name: 'Rapid Acute Beds',
        category: 'Emergency Department',
        totalQuantity: 12,
        availableQuantity: 5,
        reservedQuantity: 0,
        occupiedQuantity: 7,
        status: 'available',
        confidence: 'HIGH',
        lastVerified: '8 mins ago'
      },
      {
        id: 'res-ll-vent',
        hospitalId: 'hosp-lifeline',
        type: 'ventilator',
        name: 'Servo-U Advanced Ventilators',
        category: 'Respiratory',
        totalQuantity: 12,
        availableQuantity: 7,
        reservedQuantity: 0,
        occupiedQuantity: 5,
        status: 'available',
        confidence: 'HIGH',
        lastVerified: '7 mins ago'
      },
      {
        id: 'res-ll-ot',
        hospitalId: 'hosp-lifeline',
        type: 'operating_theatre',
        name: 'Cardiac Hybrid OR',
        category: 'Surgical',
        totalQuantity: 4,
        availableQuantity: 2,
        reservedQuantity: 0,
        occupiedQuantity: 2,
        status: 'available',
        confidence: 'HIGH',
        lastVerified: '14 mins ago'
      }
    ],
    bloodInventory: [
      { group: 'O+', units: 15, lastVerified: '12 mins ago', confidence: 'HIGH' },
      { group: 'O-', units: 8, lastVerified: '12 mins ago', confidence: 'HIGH' },
      { group: 'A+', units: 10, lastVerified: '15 mins ago', confidence: 'HIGH' },
      { group: 'A-', units: 5, lastVerified: '15 mins ago', confidence: 'HIGH' },
      { group: 'B+', units: 9, lastVerified: '18 mins ago', confidence: 'HIGH' },
      { group: 'AB+', units: 6, lastVerified: '25 mins ago', confidence: 'HIGH' }
    ],
    specialists: [
      {
        id: 'spec-ll-1',
        hospitalId: 'hosp-lifeline',
        name: 'Dr. Rebecca Martinez',
        specialty: 'Trauma Surgeon',
        isAvailable: true,
        shift: 'Morning',
        contact: 'Ext. 501',
        experienceYears: 13
      },
      {
        id: 'spec-ll-2',
        hospitalId: 'hosp-lifeline',
        name: 'Dr. James Sterling',
        specialty: 'Cardiologist (Interventional)',
        isAvailable: true,
        shift: '24/7 On-Call',
        contact: 'Ext. 503',
        experienceYears: 22
      },
      {
        id: 'spec-ll-3',
        hospitalId: 'hosp-lifeline',
        name: 'Dr. Amanda Cole',
        specialty: 'Anesthesiologist',
        isAvailable: true,
        shift: 'Morning',
        contact: 'Ext. 505',
        experienceYears: 9
      }
    ],
    ambulances: [
      {
        id: 'amb-ll-01',
        hospitalId: 'hosp-lifeline',
        vehicleNumber: 'MED-LL-301',
        type: 'Advanced Life Support',
        status: 'Available',
        equipment: ['Cardiac Monitor', 'Lucas CPR Device', 'Ventilator'],
        currentLocationName: 'West Wing Station',
        latitude: 37.7602,
        longitude: -122.435,
        etaMinutes: 14
      }
    ],
    staff: [
      { id: 'st-5', hospitalId: 'hosp-lifeline', name: 'Thomas Wright', email: 'admin@lifelinemed.com', phone: '+1 (555) 019-4801', role: 'Hospital Admin', isActive: true }
    ]
  },
  {
    id: 'hosp-apex',
    hospitalIdCode: 'HOSP-AE-04',
    name: 'Apex Emergency Hospital',
    organizationId: 'org-apex-trauma',
    type: 'Emergency Center',
    email: 'dispatch@apexemergency.com',
    phone: '+1 (555) 567-8901',
    emergencyPhone: '+1 (555) 911-0404',
    website: 'https://apexemergency.medilink.org',
    address: '300 Bayview Mission Way',
    city: 'Metro City',
    state: 'CA',
    pincode: '90216',
    latitude: 37.765,
    longitude: -122.395,
    totalBeds: 280,
    hasEmergencyDepartment: true,
    has247Service: true,
    verificationStatus: 'verified',
    verifiedAt: '2026-02-01T09:00:00.000Z',
    rating: 4.9,
    createdAt: '2026-01-05T08:00:00.000Z',
    services: [
      'ICU',
      'Emergency Beds',
      'Trauma Center',
      'Burn Unit',
      'Cath Lab',
      'Blood Bank',
      'Imaging (CT/MRI)',
      'Operating Theatre',
      'Ambulance Service'
    ],
    resources: [
      {
        id: 'res-ae-icu',
        hospitalId: 'hosp-apex',
        type: 'icu',
        name: 'Apex Level-1 Trauma ICU',
        category: 'Critical Care',
        totalQuantity: 18,
        availableQuantity: 8,
        reservedQuantity: 0,
        occupiedQuantity: 10,
        status: 'available',
        confidence: 'HIGH',
        lastVerified: '1 min ago',
        notes: 'Rapid turnaround dedicated trauma beds'
      },
      {
        id: 'res-ae-er',
        hospitalId: 'hosp-apex',
        type: 'emergency_bed',
        name: 'Resuscitation Suites',
        category: 'Emergency Department',
        totalQuantity: 16,
        availableQuantity: 9,
        reservedQuantity: 0,
        occupiedQuantity: 7,
        status: 'available',
        confidence: 'HIGH',
        lastVerified: '2 mins ago'
      },
      {
        id: 'res-ae-vent',
        hospitalId: 'hosp-apex',
        type: 'ventilator',
        name: 'Hamilton-G5 High-Performance Ventilators',
        category: 'Respiratory',
        totalQuantity: 14,
        availableQuantity: 8,
        reservedQuantity: 0,
        occupiedQuantity: 6,
        status: 'available',
        confidence: 'HIGH',
        lastVerified: '2 mins ago'
      },
      {
        id: 'res-ae-ot',
        hospitalId: 'hosp-apex',
        type: 'operating_theatre',
        name: 'Trauma & Neurosurgical OR',
        category: 'Surgical',
        totalQuantity: 5,
        availableQuantity: 3,
        reservedQuantity: 0,
        occupiedQuantity: 2,
        status: 'available',
        confidence: 'HIGH',
        lastVerified: '5 mins ago'
      }
    ],
    bloodInventory: [
      { group: 'O+', units: 22, lastVerified: '5 mins ago', confidence: 'HIGH' },
      { group: 'O-', units: 12, lastVerified: '5 mins ago', confidence: 'HIGH' },
      { group: 'A+', units: 16, lastVerified: '8 mins ago', confidence: 'HIGH' },
      { group: 'A-', units: 6, lastVerified: '8 mins ago', confidence: 'HIGH' },
      { group: 'B+', units: 14, lastVerified: '10 mins ago', confidence: 'HIGH' },
      { group: 'B-', units: 5, lastVerified: '10 mins ago', confidence: 'HIGH' },
      { group: 'AB+', units: 10, lastVerified: '15 mins ago', confidence: 'HIGH' },
      { group: 'AB-', units: 4, lastVerified: '15 mins ago', confidence: 'HIGH' }
    ],
    specialists: [
      {
        id: 'spec-ae-1',
        hospitalId: 'hosp-apex',
        name: 'Dr. Sean Patel',
        specialty: 'Trauma Surgeon',
        isAvailable: true,
        shift: 'Morning',
        contact: 'Ext. 601',
        experienceYears: 17
      },
      {
        id: 'spec-ae-2',
        hospitalId: 'hosp-apex',
        name: 'Dr. Clara Vance',
        specialty: 'Critical Care Intensivist',
        isAvailable: true,
        shift: '24/7 On-Call',
        contact: 'Ext. 603',
        experienceYears: 12
      },
      {
        id: 'spec-ae-3',
        hospitalId: 'hosp-apex',
        name: 'Dr. Lucas Tremblay',
        specialty: 'Cardiologist',
        isAvailable: true,
        shift: 'Morning',
        contact: 'Ext. 605',
        experienceYears: 15
      }
    ],
    ambulances: [
      {
        id: 'amb-ae-01',
        hospitalId: 'hosp-apex',
        vehicleNumber: 'MED-APEX-401',
        type: 'Advanced Life Support',
        status: 'Available',
        equipment: ['Trauma Pack', 'Defibrillator', 'Transport Ventilator', 'Video Laryngoscope'],
        currentLocationName: 'Apex Dispatch Hub - Bay 2',
        latitude: 37.765,
        longitude: -122.395,
        etaMinutes: 10
      },
      {
        id: 'amb-ae-02',
        hospitalId: 'hosp-apex',
        vehicleNumber: 'MED-APEX-402',
        type: 'ICU Ambulance',
        status: 'Available',
        equipment: ['Full ICU Telemetry', 'Syringe Pumps', 'Blood Storage Cooler'],
        currentLocationName: 'Apex Heli-Pad Bay',
        latitude: 37.766,
        longitude: -122.394,
        etaMinutes: 11
      }
    ],
    staff: [
      { id: 'st-6', hospitalId: 'hosp-apex', name: 'Chief Coordinator Danica Gray', email: 'dispatch@apexemergency.com', phone: '+1 (555) 019-5801', role: 'Hospital Admin', isActive: true }
    ]
  },
  {
    id: 'hosp-sunrise',
    hospitalIdCode: 'HOSP-SH-05',
    name: 'Sunrise Healthcare',
    organizationId: 'org-sunrise-network',
    type: 'Specialty Hospital',
    email: 'info@sunrisehealthcare.org',
    phone: '+1 (555) 678-9012',
    emergencyPhone: '+1 (555) 911-0505',
    website: 'https://sunrisehealthcare.medilink.org',
    address: '770 Sunset Boulevard, Hilltop Campus',
    city: 'Metro City',
    state: 'CA',
    pincode: '90218',
    latitude: 37.802,
    longitude: -122.428,
    totalBeds: 210,
    hasEmergencyDepartment: true,
    has247Service: true,
    verificationStatus: 'verified',
    verifiedAt: '2026-02-05T14:00:00.000Z',
    rating: 4.6,
    createdAt: '2026-01-20T11:00:00.000Z',
    services: [
      'Emergency Beds',
      'Pulmonology',
      'Pediatric Care',
      'Blood Bank',
      'Imaging (CT/MRI)',
      'Oxygen Units'
    ],
    resources: [
      {
        id: 'res-sh-icu',
        hospitalId: 'hosp-sunrise',
        type: 'icu',
        name: 'Step-Down & Pediatric ICU',
        category: 'Critical Care',
        totalQuantity: 10,
        availableQuantity: 1,
        reservedQuantity: 0,
        occupiedQuantity: 9,
        status: 'available',
        confidence: 'MEDIUM',
        lastVerified: '45 mins ago',
        notes: 'Mainly pediatric/step-down'
      },
      {
        id: 'res-sh-er',
        hospitalId: 'hosp-sunrise',
        type: 'emergency_bed',
        name: 'Urgent Care Bays',
        category: 'Emergency Department',
        totalQuantity: 10,
        availableQuantity: 3,
        reservedQuantity: 0,
        occupiedQuantity: 7,
        status: 'available',
        confidence: 'MEDIUM',
        lastVerified: '50 mins ago'
      },
      {
        id: 'res-sh-vent',
        hospitalId: 'hosp-sunrise',
        type: 'ventilator',
        name: 'Neonatal & Adult Ventilators',
        category: 'Respiratory',
        totalQuantity: 8,
        availableQuantity: 2,
        reservedQuantity: 0,
        occupiedQuantity: 6,
        status: 'available',
        confidence: 'MEDIUM',
        lastVerified: '55 mins ago'
      },
      {
        id: 'res-sh-oxygen',
        hospitalId: 'hosp-sunrise',
        type: 'oxygen',
        name: 'Oxygen Manifolds',
        category: 'Respiratory',
        totalQuantity: 30,
        availableQuantity: 15,
        reservedQuantity: 0,
        occupiedQuantity: 15,
        status: 'available',
        confidence: 'HIGH',
        lastVerified: '20 mins ago'
      }
    ],
    bloodInventory: [
      { group: 'O+', units: 8, lastVerified: '40 mins ago', confidence: 'MEDIUM' },
      { group: 'O-', units: 2, lastVerified: '40 mins ago', confidence: 'MEDIUM' },
      { group: 'A+', units: 6, lastVerified: '40 mins ago', confidence: 'MEDIUM' },
      { group: 'B+', units: 5, lastVerified: '40 mins ago', confidence: 'MEDIUM' }
    ],
    specialists: [
      {
        id: 'spec-sh-1',
        hospitalId: 'hosp-sunrise',
        name: 'Dr. Arthur Pendelton',
        specialty: 'Pulmonologist',
        isAvailable: true,
        shift: 'Morning',
        contact: 'Ext. 701',
        experienceYears: 19
      },
      {
        id: 'spec-sh-2',
        hospitalId: 'hosp-sunrise',
        name: 'Dr. Maya Lin',
        specialty: 'Pediatric Surgeon',
        isAvailable: true,
        shift: 'Morning',
        contact: 'Ext. 703',
        experienceYears: 10
      }
    ],
    ambulances: [
      {
        id: 'amb-sh-01',
        hospitalId: 'hosp-sunrise',
        vehicleNumber: 'MED-SH-501',
        type: 'General Ambulance',
        status: 'Available',
        equipment: ['Oxygen', 'Stretcher', 'AED'],
        currentLocationName: 'Hilltop Garage',
        latitude: 37.802,
        longitude: -122.428,
        etaMinutes: 22
      }
    ],
    staff: [
      { id: 'st-7', hospitalId: 'hosp-sunrise', name: 'Brenda Miller', email: 'info@sunrisehealthcare.org', phone: '+1 (555) 019-6801', role: 'Hospital Admin', isActive: true }
    ]
  }
];

export const INITIAL_REQUESTS: EmergencyRequest[] = [
  {
    id: 'req-demo-001',
    requestingHospitalId: 'hosp-citycare',
    requestingHospitalName: 'CityCare Hospital',
    targetHospitalId: 'hosp-apex',
    targetHospitalName: 'Apex Emergency Hospital',
    emergencyType: 'trauma',
    urgency: 'critical',
    patientSummary: 'Multiple trauma post-MVC with flail chest, severe arterial bleeding. Requires emergency thoracotomy and blood transfusion.',
    requiredResources: [
      { resourceType: 'icu', quantity: 1 },
      { resourceType: 'blood', quantity: 3, bloodGroup: 'O-' },
      { resourceType: 'ventilator', quantity: 1 },
      { resourceType: 'ambulance', quantity: 1 }
    ],
    requiredSpecialties: ['Trauma Surgeon', 'Intensivist'],
    patientLocation: {
      address: 'Interstate 80 Mile Marker 14',
      latitude: 37.779,
      longitude: -122.412
    },
    status: 'in_transit',
    recommendedHospitalId: 'hosp-apex',
    matchScore: 95,
    etaMinutes: 10,
    reservationId: 'resv-001',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: 'req-demo-002',
    requestingHospitalId: 'hosp-metro',
    requestingHospitalName: 'Metro General Hospital',
    targetHospitalId: 'hosp-citycare',
    targetHospitalName: 'CityCare Hospital',
    emergencyType: 'cardiac',
    urgency: 'high',
    patientSummary: 'STEMI anterior wall with cardiogenic shock, needs immediate cath lab intervention and ICU bed.',
    requiredResources: [
      { resourceType: 'icu', quantity: 1 },
      { resourceType: 'cath_lab', quantity: 1 },
      { resourceType: 'ambulance', quantity: 1 }
    ],
    requiredSpecialties: ['Cardiologist'],
    patientLocation: {
      address: 'Downtown Transit Center',
      latitude: 37.785,
      longitude: -122.405
    },
    status: 'reserved',
    recommendedHospitalId: 'hosp-citycare',
    matchScore: 92,
    etaMinutes: 12,
    reservationId: 'resv-002',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  }
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'resv-001',
    requestId: 'req-demo-001',
    requestingHospitalId: 'hosp-citycare',
    requestingHospitalName: 'CityCare Hospital',
    providingHospitalId: 'hosp-apex',
    providingHospitalName: 'Apex Emergency Hospital',
    resourceType: 'icu',
    resourceName: 'Apex Level-1 Trauma ICU',
    quantity: 1,
    reservedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 18 * 60 * 1000).toISOString(),
    secondsRemaining: 1080,
    status: 'active'
  },
  {
    id: 'resv-002',
    requestId: 'req-demo-002',
    requestingHospitalId: 'hosp-metro',
    requestingHospitalName: 'Metro General Hospital',
    providingHospitalId: 'hosp-citycare',
    providingHospitalName: 'CityCare Hospital',
    resourceType: 'icu',
    resourceName: 'ICU Beds (Level 1)',
    quantity: 1,
    reservedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 22 * 60 * 1000).toISOString(),
    secondsRemaining: 1320,
    status: 'active'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    hospitalId: 'hosp-citycare',
    title: '🚨 Resource Reserved by Metro General',
    message: 'Metro General Hospital has reserved 1 ICU Bed for an acute STEMI patient. ETA: 12 mins.',
    type: 'emergency_alert',
    relatedRequestId: 'req-demo-002',
    isRead: false,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-2',
    hospitalId: 'hosp-citycare',
    title: '🚑 Ambulance MED-CC-101 Dispatched',
    message: 'Advanced Life Support unit en route to coordinate patient transfer with Apex Emergency.',
    type: 'system',
    isRead: false,
    createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-3',
    hospitalId: 'hosp-apex',
    title: '🚨 Incoming Critical Trauma Request',
    message: 'CityCare Hospital requested 1 ICU Bed + 3 units O- Blood for multi-trauma MVC.',
    type: 'emergency_alert',
    relatedRequestId: 'req-demo-001',
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log-1',
    hospitalId: 'hosp-citycare',
    hospitalName: 'CityCare Hospital',
    userEmail: 'admin@citycare.com',
    action: 'Resource Reserved',
    category: 'reservation',
    details: '1 ICU Bed reserved for incoming transfer from Metro General (Ref: #req-demo-002)',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: 'log-2',
    hospitalId: 'hosp-apex',
    hospitalName: 'Apex Emergency Hospital',
    userEmail: 'dispatch@apexemergency.com',
    action: 'Request Accepted',
    category: 'request',
    details: 'Accepted critical trauma transfer #req-demo-001 from CityCare Hospital',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString()
  },
  {
    id: 'log-3',
    hospitalId: 'hosp-citycare',
    hospitalName: 'CityCare Hospital',
    userEmail: 'm.reynolds@citycare.com',
    action: 'Resource Inventory Updated',
    category: 'resource',
    details: 'Updated ICU available quantity from 5 → 4 due to network allocation',
    timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString()
  },
  {
    id: 'log-4',
    hospitalId: 'hosp-lifeline',
    hospitalName: 'LifeLine Medical Center',
    userEmail: 'admin@lifelinemed.com',
    action: 'Blood Stock Verified',
    category: 'resource',
    details: 'Verified 8 units O- and 15 units O+ blood supply with HIGH confidence',
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString()
  },
  {
    id: 'log-5',
    hospitalId: 'hosp-apex',
    hospitalName: 'Apex Emergency Hospital',
    userEmail: 'admin@apexemergency.com',
    action: 'Hospital Verification',
    category: 'verification',
    details: 'Hospital credentials and Level-1 Trauma accreditation approved by System Admin',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];
