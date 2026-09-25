// AstraWatch AI Dynamic API Credentials Manager
// Secrets are moved to backend/.env
// Only public tokens (Mapbox) are exposed to Vite via VITE_ variables.

export const API_CONFIG = {
  mapboxPublicToken: import.meta.env.VITE_MAPBOX_TOKEN || '',
};

export function getOpenWeatherTileUrl(layer: 'precipitation_new' | 'clouds_new' | 'temp_new' | 'wind_new' = 'precipitation_new') {
  // Proxy through our backend to keep OWM_KEY secure
  return `/api/v1/tiles/owm/${layer}/{z}/{x}/{y}`;
}

export function getMapboxTileUrl(style: 'satellite-v9' | 'navigation-day-v1' | 'navigation-night-v1' = 'satellite-v9') {
  return `https://api.mapbox.com/styles/v1/mapbox/${style}/tiles/{z}/{x}/{y}?access_token=${API_CONFIG.mapboxPublicToken}`;
}
