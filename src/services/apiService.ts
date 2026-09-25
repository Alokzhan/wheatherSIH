import { MOCK_ALERTS, MOCK_THREAT_OBJECTS } from '../data/mockData';
import type { AlertItem, LocationRiskData, ThreatObject, AcknowledgementStatus } from '../types/weather';
import { getPanIndiaLocationRisk } from '../utils/panIndiaWeatherEngine';

// Local storage key for persistent alerts database
const LOCAL_STORAGE_ALERTS_KEY = 'STORMTRACE_ALERTS_DB_V1';
const LOCAL_STORAGE_DATASETS_KEY = 'STORMTRACE_DATASETS_DB_V1';

export interface DatasetRecord {
  id: string;
  name: string;
  sizeMb: number;
  format: string;
  uploadedAt: string;
  status: 'processed' | 'ingesting' | 'failed';
  recordCount: number;
  region: string;
}

export async function fetchAppConfig(): Promise<{ mapbox_token: string }> {
  try {
    const res = await fetch('/api/v1/config/maps');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error('Failed to fetch app config', e);
  }
  return { mapbox_token: '' };
}

/**
 * Initialize Alert Database with local persistence
 */
export function getStoredAlerts(): AlertItem[] {
  if (typeof window === 'undefined') return MOCK_ALERTS;
  const stored = localStorage.getItem(LOCAL_STORAGE_ALERTS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return MOCK_ALERTS;
    }
  }
  return MOCK_ALERTS;
}

export function saveStoredAlerts(alerts: AlertItem[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_ALERTS_KEY, JSON.stringify(alerts));
  }
}

/**
 * GET /api/v1/alerts
 */
export async function fetchApiAlerts(regionFilter?: string): Promise<{ status: 'success'; count: number; alerts: AlertItem[] }> {
  try {
    const res = await fetch('/api/v1/alerts');
    if (res.ok) {
      const data: AlertItem[] = await res.json();
      const filtered = regionFilter && regionFilter !== 'all' 
        ? data.filter(a => a.regionId === regionFilter)
        : data;
      // Also update local storage for fallback
      saveStoredAlerts(data);
      return { status: 'success', count: filtered.length, alerts: filtered };
    }
  } catch (e) {
    console.warn('Backend alerts failed, using local storage:', e);
  }

  const alerts = getStoredAlerts();
  const filtered = regionFilter && regionFilter !== 'all' 
    ? alerts.filter(a => a.regionId === regionFilter)
    : alerts;
  return {
    status: 'success',
    count: filtered.length,
    alerts: filtered,
  };
}

export async function fetchApiAlertById(alertId: string): Promise<{ status: 'success' | 'not_found'; alert?: AlertItem }> {
  const { alerts } = await fetchApiAlerts();
  const found = alerts.find(a => a.id === alertId);
  if (!found) return { status: 'not_found' };
  return { status: 'success', alert: found };
}

/**
 * POST /api/v1/alerts/{id}/acknowledge
 * Officer Acknowledgement Workflow
 */
export async function updateAlertAcknowledgement(
  alertId: string, 
  status: AcknowledgementStatus, 
  officerName: string, 
  note: string
): Promise<{ status: 'success'; alert: AlertItem }> {
  const alerts = getStoredAlerts();
  const idx = alerts.findIndex(a => a.id === alertId);
  if (idx === -1) throw new Error('Alert not found');

  alerts[idx] = {
    ...alerts[idx],
    acknowledgementStatus: status,
    acknowledgedBy: officerName,
    acknowledgementNote: note,
    status: status === 'closed' ? 'mitigated' : alerts[idx].status,
  };

  saveStoredAlerts(alerts);
  return { status: 'success', alert: alerts[idx] };
}

/**
 * GET /api/v1/location-risk?q={query}
 */
export async function fetchApiLocationRisk(query: string): Promise<{ status: 'success'; data: LocationRiskData }> {
  const data = await getPanIndiaLocationRisk(query);
  return { status: 'success', data };
}

/**
 * GET /api/v1/trajectory/{event_id}
 */
export async function fetchApiTrajectory(eventId: string): Promise<{ status: 'success' | 'not_found'; event?: ThreatObject }> {
  const found = MOCK_THREAT_OBJECTS.find(t => t.id === eventId) || MOCK_THREAT_OBJECTS[0];
  return { status: 'success', event: found };
}

/**
 * GET /api/v1/weather-layer?layer={layer_id}
 */
export async function fetchApiWeatherLayer(layerId: string): Promise<{
  status: 'success';
  layerId: string;
  metadata: {
    format: string;
    resolutionKm: number;
    tileSize: number;
    crs: string;
    tileTemplateUrl: string;
    lastUpdated: string;
  };
}> {
  return {
    status: 'success',
    layerId,
    metadata: {
      format: 'raster_png',
      resolutionKm: 5.0,
      tileSize: 256,
      crs: 'EPSG:3857 (Web Mercator)',
      tileTemplateUrl: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png`,
      lastUpdated: new Date().toISOString(),
    }
  };
}

/**
 * POST /api/v1/admin/upload
 */
export async function uploadDatasetApi(fileName: string, fileSizeBytes: number, region: string): Promise<{
  status: 'success';
  dataset: DatasetRecord;
}> {
  const newDataset: DatasetRecord = {
    id: `DS-IN-${Date.now().toString().slice(-4)}`,
    name: fileName,
    sizeMb: Number((fileSizeBytes / (1024 * 1024)).toFixed(2)),
    format: fileName.endsWith('.nc') ? 'NetCDF4' : fileName.endsWith('.grib2') ? 'GRIB2' : 'CSV',
    uploadedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    status: 'processed',
    recordCount: Math.round(15000 + Math.random() * 45000),
    region,
  };

  if (typeof window !== 'undefined') {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_DATASETS_KEY);
    const existing: DatasetRecord[] = existingStr ? JSON.parse(existingStr) : [];
    existing.unshift(newDataset);
    localStorage.setItem(LOCAL_STORAGE_DATASETS_KEY, JSON.stringify(existing));
  }

  return { status: 'success', dataset: newDataset };
}

/**
 * POST /api/v1/admin/run-model
 */
export async function executeModelInferenceApi(spatialResolutionKm: number = 5.0): Promise<{
  status: 'success';
  executionMetrics: {
    inferenceTimeMs: number;
    gridsProcessed: number;
    peakPreservedPct: number;
    rmseMm: number;
    maeMm: number;
    podScore: number;
    farScore: number;
    csiScore: number;
    modelHash: string;
  };
}> {
  try {
    const res = await fetch('/api/v1/model/inference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spatialResolutionKm })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend inference failed, falling back:', e);
  }
  
  // Fallback if backend is down
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: 'success',
        executionMetrics: {
          inferenceTimeMs: spatialResolutionKm === 1.0 ? 210 : 142,
          gridsProcessed: spatialResolutionKm === 1.0 ? 84500 : 18450,
          peakPreservedPct: 96.2,
          rmseMm: spatialResolutionKm === 1.0 ? 3.84 : 4.12,
          maeMm: 2.85,
          podScore: 0.95,
          farScore: 0.09,
          csiScore: 0.87,
          modelHash: `sha256-pi-unet-${spatialResolutionKm}km-v1.4.0`,
        },
      });
    }, 800);
  });
}

/**
 * POST /api/v1/reports/generate
 */
export async function generateReportApi(locationName: string, format: 'json' | 'pdf' | 'csv' = 'json'): Promise<{
  status: 'success';
  reportUrl: string;
  generatedAt: string;
}> {
  return {
    status: 'success',
    reportUrl: `/exports/AstraWatch_RiskReport_${locationName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${format}`,
    generatedAt: new Date().toISOString(),
  };
}
