import type { LocationRiskData } from '../types/weather';
import { MOCK_LOCATION_RISKS } from '../data/mockData';

/**
 * State to Main Crop & Terrain Profile Mapping for AI Advisory Generation
 */
// Constants removed for brevity

/**
 * Perform OpenStreetMap Nominatim Geocoding across any location in India
 */
export async function geocodeIndiaLocation(query: string): Promise<{
  displayName: string;
  district: string;
  state: string;
  pinCode: string;
  lat: number;
  lng: number;
} | null> {
  try {
    const cleanQuery = encodeURIComponent(`${query.trim()}, India`);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${cleanQuery}&countrycodes=in&format=json&addressdetails=1&limit=1`, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'StormTraceAI-WeatherPlatform/1.0',
      }
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;

    const item = data[0];
    const addr = item.address || {};
    const state = addr.state || addr.region || 'India';
    const district = addr.state_district || addr.county || addr.city || addr.town || addr.village || 'Local Region';
    const pinCode = addr.postcode || '200001';

    return {
      displayName: item.display_name.split(',')[0] + `, ${district} (${state})`,
      district,
      state,
      pinCode,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    };
  } catch (err) {
    console.warn('Geocoding fallback activated:', err);
    return null;
  }
}

export async function getPanIndiaLocationRisk(searchQuery: string): Promise<LocationRiskData> {
  try {
    const res = await fetch(`/api/v1/weather/risk?q=${encodeURIComponent(searchQuery)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.status === 'success') {
        return json.data;
      }
    }
    throw new Error('Failed to fetch risk from backend');
  } catch (e) {
    console.warn('Backend failed, falling back to mock:', e);
    // Fallback if backend is not running
    const matchedKey = Object.keys(MOCK_LOCATION_RISKS).find(k => 
      k === searchQuery.toLowerCase().trim()
    );
    return matchedKey ? MOCK_LOCATION_RISKS[matchedKey] : MOCK_LOCATION_RISKS['lucknow'];
  }
}
