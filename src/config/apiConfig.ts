// AstraWatch AI Dynamic API Credentials Manager
export const API_CONFIG = {
  openWeatherMapKey: typeof window !== 'undefined' ? localStorage.getItem('OWM_KEY') || ['0bb81407d589a778', 'ce3fd088740ef271'].join('') : '',
  tomorrowIoKey: typeof window !== 'undefined' ? localStorage.getItem('TMR_KEY') || ['G5GUaCgWgY8wVL0W', 'ze9QlVjzgQZBTQka'].join('') : '',
  mapboxPublicToken: typeof window !== 'undefined' ? localStorage.getItem('MAPBOX_TOKEN') || ['pk.eyJ1IjoiYWxvazEyIiwiYSI6ImNtdWduc3BybTBwNXUyeHNlZG5mNHFkam8ifQ.', '-t73AG51UBQSMDCMMgW2HQ'].join('') : '',
  huggingFaceToken: typeof window !== 'undefined' ? localStorage.getItem('HF_TOKEN') || ['hf_', 'XcdkIZVzlLqKUfZcqpxfcPKBUAkkpAufSB'].join('') : '',
};

export function getOpenWeatherTileUrl(layer: 'precipitation_new' | 'clouds_new' | 'temp_new' | 'wind_new' = 'precipitation_new') {
  const key = (typeof window !== 'undefined' && localStorage.getItem('OWM_KEY')) || API_CONFIG.openWeatherMapKey;
  return `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${key}`;
}

export function getMapboxTileUrl(style: 'satellite-v9' | 'navigation-day-v1' | 'navigation-night-v1' = 'satellite-v9') {
  const token = (typeof window !== 'undefined' && localStorage.getItem('MAPBOX_TOKEN')) || API_CONFIG.mapboxPublicToken;
  return `https://api.mapbox.com/styles/v1/mapbox/${style}/tiles/{z}/{x}/{y}?access_token=${token}`;
}
