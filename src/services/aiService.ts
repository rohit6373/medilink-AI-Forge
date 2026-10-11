import {
  Hospital,
  EmergencyRequest,
  HospitalMatchResult,
  MatchScoreBreakdown,
  AiRecommendationResponse,
  ConfidenceLevel,
} from '../types';

// Distance calculation using Haversine formula
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

// Estimate ETA in minutes with traffic factor
export function estimateEtaMinutes(distanceKm: number, urgency: string): number {
  const speedKmh = urgency === 'critical' ? 55 : 45; // Emergency vehicle speed with siren
  const transitTime = (distanceKm / speedKmh) * 60;
  const dispatchBuffer = urgency === 'critical' ? 2 : 4; // minutes to mobilize
  return Math.max(3, Math.round(transitTime + dispatchBuffer));
}

// Core Matching and Scoring Engine
export function evaluateHospitalMatch(
  hospital: Hospital,
  request: Partial<EmergencyRequest>,
  patientLocation: { latitude: number; longitude: number }
): HospitalMatchResult {
  const satisfiedRequirements: string[] = [];
  const missingRequirements: string[] = [];

  // Check verification: Unverified hospitals get heavily penalized or omitted from trusted matching
  const isVerified = hospital.verificationStatus === 'verified';

  // 1. Calculate Required Resource Match (0 - 100)
  let totalReqPoints = 0;
  let earnedReqPoints = 0;

  if (request.requiredResources && request.requiredResources.length > 0) {
    for (const reqItem of request.requiredResources) {
      totalReqPoints += reqItem.quantity;
      if (reqItem.resourceType === 'blood' && reqItem.bloodGroup) {
        const bloodStock = hospital.bloodInventory.find((b) => b.group === reqItem.bloodGroup);
        if (bloodStock && bloodStock.units >= reqItem.quantity) {
          earnedReqPoints += reqItem.quantity;
          satisfiedRequirements.push(`${reqItem.bloodGroup} Blood (${bloodStock.units} units available)`);
        } else if (bloodStock && bloodStock.units > 0) {
          earnedReqPoints += bloodStock.units;
          missingRequirements.push(`Insufficient ${reqItem.bloodGroup} Blood (needs ${reqItem.quantity}, has ${bloodStock.units})`);
        } else {
          missingRequirements.push(`${reqItem.bloodGroup} Blood (0 units available)`);
        }
      } else {
        const res = hospital.resources.find((r) => r.type === reqItem.resourceType || r.name.toLowerCase().includes(String(reqItem.resourceType).toLowerCase()));
        if (res && res.availableQuantity >= reqItem.quantity) {
          earnedReqPoints += reqItem.quantity;
          satisfiedRequirements.push(`${res.name} (${res.availableQuantity} available)`);
        } else if (res && res.availableQuantity > 0) {
          earnedReqPoints += res.availableQuantity;
          missingRequirements.push(`Partial ${res.name} (needs ${reqItem.quantity}, has ${res.availableQuantity})`);
        } else {
          missingRequirements.push(`${reqItem.resourceType.toUpperCase()} (0 available)`);
        }
      }
    }
  } else {
    totalReqPoints = 1;
    earnedReqPoints = 1;
  }

  // 2. Specialists requirement check
  if (request.requiredSpecialties && request.requiredSpecialties.length > 0) {
    for (const specName of request.requiredSpecialties) {
      totalReqPoints += 2;
      const specialist = hospital.specialists.find(
        (s) => s.isAvailable && s.specialty.toLowerCase().includes(specName.toLowerCase())
      );
      if (specialist) {
        earnedReqPoints += 2;
        satisfiedRequirements.push(`${specialist.specialty} on duty (${specialist.name})`);
      } else {
        missingRequirements.push(`${specName} (not available on current shift)`);
      }
    }
  }

  // Calculate percentage resource match
  const resourceMatchScore = totalReqPoints > 0 ? Math.round((earnedReqPoints / totalReqPoints) * 100) : 100;

  // 3. Emergency Suitability based on category & services
  let suitabilityScore = 70;
  const services = hospital.services.map((s) => s.toLowerCase());

  switch (request.emergencyType) {
    case 'trauma':
      if (services.includes('trauma center')) suitabilityScore += 15;
      if (services.includes('operating theatre')) suitabilityScore += 10;
      if (hospital.specialists.some((s) => s.isAvailable && s.specialty.toLowerCase().includes('trauma'))) suitabilityScore += 5;
      break;
    case 'cardiac':
      if (services.includes('cath lab')) suitabilityScore += 15;
      if (services.includes('cardiology')) suitabilityScore += 10;
      if (hospital.specialists.some((s) => s.isAvailable && s.specialty.toLowerCase().includes('cardio'))) suitabilityScore += 5;
      break;
    case 'respiratory':
      if (services.includes('pulmonology')) suitabilityScore += 15;
      if (hospital.resources.some((r) => r.type === 'ventilator' && r.availableQuantity > 0)) suitabilityScore += 10;
      if (hospital.resources.some((r) => r.type === 'oxygen' && r.availableQuantity > 0)) suitabilityScore += 5;
      break;
    case 'neurological':
      if (services.includes('neurology')) suitabilityScore += 15;
      if (services.includes('imaging (ct/mri)')) suitabilityScore += 10;
      if (hospital.specialists.some((s) => s.isAvailable && s.specialty.toLowerCase().includes('neuro'))) suitabilityScore += 5;
      break;
    default:
      if (hospital.hasEmergencyDepartment) suitabilityScore += 15;
      if (hospital.has247Service) suitabilityScore += 15;
      break;
  }
  suitabilityScore = Math.min(100, suitabilityScore);

  // 4. Distance & ETA
  const distanceKm = calculateDistanceKm(
    patientLocation.latitude,
    patientLocation.longitude,
    hospital.latitude,
    hospital.longitude
  );
  const etaMinutes = estimateEtaMinutes(distanceKm, request.urgency || 'critical');

  // Distance Score (closer is higher, max 25km evaluated)
  const distanceScore = Math.max(20, Math.round(100 - (distanceKm / 25) * 60));

  // ETA Score (faster is higher, penalty over 30 mins)
  const etaScore = Math.max(10, Math.round(100 - (etaMinutes / 35) * 70));

  // 5. Confidence Score based on freshness
  let confidenceScore = 95;
  const staleResource = hospital.resources.some((r) => r.confidence === 'LOW');
  const mediumResource = hospital.resources.some((r) => r.confidence === 'MEDIUM');
  if (staleResource) confidenceScore = 65;
  else if (mediumResource) confidenceScore = 80;

  // Verification Multiplier
  const verificationWeight = isVerified ? 1.0 : 0.4;

  // 6. Weighted Overall Score calculation
  // For Critical Emergency:
  // Resource Match: 35%, Emergency Suitability: 25%, ETA: 20%, Availability Confidence: 10%, Distance: 10%
  let overallScore = 0;
  if (request.urgency === 'critical') {
    overallScore =
      resourceMatchScore * 0.35 +
      suitabilityScore * 0.25 +
      etaScore * 0.2 +
      confidenceScore * 0.1 +
      distanceScore * 0.1;
  } else {
    overallScore =
      resourceMatchScore * 0.4 +
      suitabilityScore * 0.25 +
      etaScore * 0.15 +
      confidenceScore * 0.1 +
      distanceScore * 0.1;
  }

  overallScore = Math.round(overallScore * verificationWeight);

  const isFullySatisfied = missingRequirements.length === 0;

  // Confidence category
  let overallConfidence: ConfidenceLevel = 'HIGH';
  if (confidenceScore < 75 || !isVerified) overallConfidence = 'LOW';
  else if (confidenceScore < 88) overallConfidence = 'MEDIUM';

  // AI Explanation Text
  let aiExplanation = '';
  if (isFullySatisfied) {
    aiExplanation = `${hospital.name} satisfies all high-priority requirements for this ${request.emergencyType || 'emergency'} case with confirmed capacity (${satisfiedRequirements.slice(0, 3).join(', ')}), ${etaMinutes} min estimated ambulance transit window, and high verification confidence.`;
  } else {
    aiExplanation = `${hospital.name} offers strong operational proximity (${etaMinutes} min ETA) but has pending shortages (${missingRequirements.slice(0, 2).join(', ')}).`;
  }

  const breakdown: MatchScoreBreakdown = {
    resourceMatch: resourceMatchScore,
    emergencySuitability: suitabilityScore,
    etaScore,
    confidenceScore,
    distanceScore,
    overallScore,
  };

  return {
    hospital,
    overallScore,
    breakdown,
    distanceKm,
    etaMinutes,
    satisfiedRequirements,
    missingRequirements,
    isFullySatisfied,
    confidence: overallConfidence,
    aiExplanation,
  };
}

// Generate Full AI Recommendation Set
export async function getAiRecommendations(
  request: Partial<EmergencyRequest>,
  hospitals: Hospital[],
  patientLocation: { latitude: number; longitude: number }
): Promise<AiRecommendationResponse> {
  // Rank all verified hospitals
  const ranked = hospitals
    .map((h) => evaluateHospitalMatch(h, request, patientLocation))
    .sort((a, b) => b.overallScore - a.overallScore);

  const top = ranked[0] || null;
  const isPerfect = top ? top.isFullySatisfied && top.overallScore >= 80 : false;

  let partialMatchNote: string | undefined = undefined;
  let emergencyAdvice = `MediLink analyzed ${hospitals.length} verified network hospitals based on resource availability, clinical suitability, and transit ETA.`;
  const alternatives: string[] = [];

  if (!isPerfect && ranked.length >= 2) {
    const h1 = ranked[0];
    const h2 = ranked[1];
    partialMatchNote = `No single verified hospital currently satisfies 100% of all requested resources simultaneously. Recommended hybrid approach: Coordinate primary resuscitation/ICU at ${h1.hospital.name} while placing ${h2.hospital.name} on secondary standby for backup specialist/ventilator support.`;
    emergencyAdvice = `Multi-hospital split coordination recommended to prevent treatment delays.`;
  } else if (top) {
    emergencyAdvice = `Based on currently verified resource and logistics telemetry, ${top.hospital.name} provides the strongest operational match with ${top.etaMinutes} min ETA.`;
  }

  if (ranked.length > 1) {
    alternatives.push(`Backup Option 1: ${ranked[1].hospital.name} (${ranked[1].overallScore}% Match, ${ranked[1].etaMinutes} min ETA)`);
  }
  if (ranked.length > 2) {
    alternatives.push(`Backup Option 2: ${ranked[2].hospital.name} (${ranked[2].overallScore}% Match, ${ranked[2].etaMinutes} min ETA)`);
  }

  // Attempt to enrich with Server-side Gemini rationale if available
  try {
    const response = await fetch('/api/ai/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emergencyType: request.emergencyType,
        urgency: request.urgency,
        requiredResources: request.requiredResources,
        requiredSpecialties: request.requiredSpecialties,
        patientLocation,
        hospitals,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.data?.emergencyAdvice) {
        emergencyAdvice = data.data.emergencyAdvice;
      }
      if (data.data?.hospitalRationales && top && data.data.hospitalRationales[top.hospital.id]) {
        top.aiExplanation = data.data.hospitalRationales[top.hospital.id];
      }
      if (data.data?.alternativeStrategy && partialMatchNote) {
        partialMatchNote = data.data.alternativeStrategy;
      }
    }
  } catch (err) {
    // Graceful fallback to client deterministic reasoning
  }

  return {
    topRecommendation: top,
    rankedHospitals: ranked,
    isPerfectMatchFound: isPerfect,
    partialMatchNote,
    emergencyAdvice,
    alternativeOptions: alternatives,
  };
}
