export type RiskLevel = 'low' | 'moderate' | 'severe' | 'critical';

export type UserRole = 'public' | 'farmer' | 'disaster_officer' | 'meteorologist' | 'administrator';

export type IndiaRegionId = 
  | 'all'
  | 'up_ganges'
  | 'mumbai_west'
  | 'wayanad_south'
  | 'assam_east'
  | 'himalaya_north';

export type MapLayerId = 
  | 'rainfall_forecast'
  | 'rainfall_anomaly'
  | 'extreme_probability'
  | 'threat_footprint'
  | 'trajectory'
  | 'risk_grid_5km'
  | 'admin_boundaries'
  | 'vulnerability';

export interface ThreatObject {
  id: string;
  name: string;
  district: string;
  region: string;
  regionId: IndiaRegionId;
  riskLevel: RiskLevel;
  centroid: [number, number]; // [lat, lng]
  bbox: [[number, number], [number, number]]; // [[minLat, minLng], [maxLat, maxLng]]
  areaKm2: number;
  speedKmH: number;
  direction: string;
  peakIntensityMmH: number;
  efiScore: number; // Extreme Forecast Index (-1 to 1)
  probabilityExceedance: number; // 0 to 100%
  timestamp: string;
  forecastStep: string;
  polygonCoords: [number, number][];
  trajectoryPoints: {
    lat: number;
    lng: number;
    timestamp: string;
    forecastHour: number;
    riskLevel: RiskLevel;
  }[];
  affectedVillages: string[];
  affectedPopulationEstimate: number;
  advisory: string;
}

export interface GridCell5km {
  id: string;
  lat: number;
  lng: number;
  rainfallForecastMm: number;
  anomalyPercentile: number; // e.g. 98.5th percentile
  probabilityGt50mm: number; // 0 - 100%
  downscaledRiskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  elevationMeters: number;
  vulnerabilityIndex: number; // 0 - 1
  district: string;
  tehsil: string;
  regionId: IndiaRegionId;
}

export interface LocationRiskData {
  locationName: string;
  district: string;
  state: string;
  pinCode?: string;
  coordinates: [number, number];
  regionId: IndiaRegionId;
  currentRiskLevel: RiskLevel;
  riskScore: number;
  forecast24h: { rainMm: number; prob: number; risk: RiskLevel };
  forecast48h: { rainMm: number; prob: number; risk: RiskLevel };
  forecast72h: { rainMm: number; prob: number; risk: RiskLevel };
  forecast5d: { rainMm: number; prob: number; risk: RiskLevel };
  hourlyProbabilities: { hour: string; prob: number; rainMm: number }[];
  nearestThreatDistanceKm: number;
  nearestThreatName: string;
  safetyAdvisory: {
    public: string;
    farmer: string;
    official: string;
  };
}

export interface AlertItem {
  id: string;
  title: string;
  district: string;
  state: string;
  regionId: IndiaRegionId;
  riskLevel: RiskLevel;
  issuedAt: string;
  validUntil: string;
  summary: string;
  affectedTehsils: string[];
  recommendedActions: string[];
  acknowledgedBy?: string;
  status: 'active' | 'archived' | 'mitigated';
}

export interface HistoricalEvent {
  id: string;
  title: string;
  dateRange: string;
  location: string;
  regionId: IndiaRegionId;
  peakRainfallObservedMm: number;
  peakRainfallCoarseNwpMm: number;
  peakRainfallAstraWatchMm: number;
  metrics: {
    rmse: number;
    mae: number;
    pod: number; // Probability of Detection (0-1)
    far: number; // False Alarm Ratio (0-1)
    csi: number; // Critical Success Index (0-1)
    threatIoU: number; // Intersection over Union (0-1)
    peakPreservationErrorPercent: number;
  };
  description: string;
}

export interface ModelConfig {
  w1_efi_anomaly: number;
  w2_prob_exceedance: number;
  w3_severity_magnitude: number;
  w4_vulnerability_exposure: number;
  extremeQuantileThreshold: number;
  spatialResolutionKm: number;
}
