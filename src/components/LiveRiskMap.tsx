import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  Layers, 
  Play, 
  Pause, 
  Maximize2, 
  Minimize2, 
  Sliders, 
  Check, 
  RefreshCw,
  Globe,
  Mountain,
  Eye,
  EyeOff,
  RotateCcw,
  Compass,
} from 'lucide-react';
import type { MapLayerId, ThreatObject, GridCell5km, IndiaRegionId } from '../types/weather';
import { MOCK_THREAT_OBJECTS, MOCK_5KM_GRID, INDIA_REGION_PRESETS } from '../data/mockData';
import { API_CONFIG } from '../config/apiConfig';

interface LiveRiskMapProps {
  selectedRegion?: IndiaRegionId;
  onSelectThreat?: (threat: ThreatObject) => void;
}

const RISK_COLORS: Record<string, string> = {
  critical: '#ef4444',
  severe: '#f97316',
  moderate: '#f59e0b',
  low: '#10b981',
};

const RISK_GLOW: Record<string, string> = {
  critical: 'rgba(239, 68, 68, 0.4)',
  severe: 'rgba(249, 115, 22, 0.35)',
  moderate: 'rgba(245, 158, 11, 0.3)',
  low: 'rgba(16, 185, 129, 0.25)',
};

// Pan-India Isohyets GeoJSON features representing downscaled rainfall zones across India
const PAN_INDIA_RAINFALL_FEATURES = [
  {
    name: 'Supaul Kosi Catchment Heavy Downpour',
    district: 'Supaul',
    state: 'Bihar',
    rainMm: 165.0,
    efiPercentile: 98.8,
    probGt50: 95,
    riskLevel: 'critical',
    coords: [
      [86.4, 25.8], [86.9, 25.8], [87.1, 26.4], [86.7, 26.6], [86.3, 26.2], [86.4, 25.8]
    ]
  },
  {
    name: 'Mumbai Suburban Urban Cloudburst Cell',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    rainMm: 135.0,
    efiPercentile: 99.2,
    probGt50: 97,
    riskLevel: 'critical',
    coords: [
      [72.7, 18.9], [73.1, 18.9], [73.2, 19.3], [72.8, 19.4], [72.6, 19.1], [72.7, 18.9]
    ]
  },
  {
    name: 'Wayanad Orographic Monsoon Downpour',
    district: 'Wayanad',
    state: 'Kerala',
    rainMm: 185.0,
    efiPercentile: 99.6,
    probGt50: 98,
    riskLevel: 'critical',
    coords: [
      [75.9, 11.4], [76.4, 11.4], [76.5, 11.9], [76.0, 12.0], [75.8, 11.6], [75.9, 11.4]
    ]
  },
  {
    name: 'Brahmaputra Middle Valley Inundation',
    district: 'Kamrup Metropolitan',
    state: 'Assam',
    rainMm: 110.0,
    efiPercentile: 96.5,
    probGt50: 91,
    riskLevel: 'severe',
    coords: [
      [91.4, 25.9], [92.1, 25.9], [92.3, 26.4], [91.7, 26.6], [91.3, 26.2], [91.4, 25.9]
    ]
  },
  {
    name: 'Mahanadi Coastal Delta Storm Rainfall',
    district: 'Cuttack',
    state: 'Odisha',
    rainMm: 145.0,
    efiPercentile: 98.1,
    probGt50: 94,
    riskLevel: 'critical',
    coords: [
      [85.6, 20.1], [86.4, 20.1], [86.5, 20.7], [85.9, 20.8], [85.5, 20.4], [85.6, 20.1]
    ]
  },
  {
    name: 'Prayagraj Sangam Confluence Flash Cell',
    district: 'Prayagraj',
    state: 'Uttar Pradesh',
    rainMm: 118.4,
    efiPercentile: 97.4,
    probGt50: 92,
    riskLevel: 'critical',
    coords: [
      [81.6, 25.2], [82.1, 25.2], [82.2, 25.7], [81.7, 25.8], [81.5, 25.4], [81.6, 25.2]
    ]
  },
  {
    name: 'Delhi-NCR & Yamuna Catchment Rain',
    district: 'New Delhi',
    state: 'Delhi',
    rainMm: 95.0,
    efiPercentile: 95.2,
    probGt50: 84,
    riskLevel: 'severe',
    coords: [
      [76.9, 28.3], [77.5, 28.3], [77.6, 28.9], [77.0, 29.0], [76.8, 28.5], [76.9, 28.3]
    ]
  },
  {
    name: 'Chamoli Alaknanda Himalayan Surge',
    district: 'Chamoli',
    state: 'Uttarakhand',
    rainMm: 155.0,
    efiPercentile: 99.1,
    probGt50: 96,
    riskLevel: 'critical',
    coords: [
      [79.1, 30.1], [79.8, 30.1], [79.9, 30.7], [79.3, 30.8], [79.0, 30.4], [79.1, 30.1]
    ]
  },
  {
    name: 'South Peninsular Coastal Surge Rain',
    district: 'Chennai',
    state: 'Tamil Nadu',
    rainMm: 88.0,
    efiPercentile: 94.0,
    probGt50: 78,
    riskLevel: 'moderate',
    coords: [
      [80.0, 12.8], [80.5, 12.8], [80.6, 13.3], [80.1, 13.4], [79.9, 13.0], [80.0, 12.8]
    ]
  },
  {
    name: 'Sundarbans Bay Convective Cell',
    district: 'South 24 Parganas',
    state: 'West Bengal',
    rainMm: 130.0,
    efiPercentile: 97.8,
    probGt50: 93,
    riskLevel: 'severe',
    coords: [
      [88.1, 21.6], [88.8, 21.6], [88.9, 22.2], [88.3, 22.3], [88.0, 21.9], [88.1, 21.6]
    ]
  },
  {
    name: 'South Gujarat Surat Coastal Belt',
    district: 'Surat',
    state: 'Gujarat',
    rainMm: 105.0,
    efiPercentile: 96.0,
    probGt50: 88,
    riskLevel: 'severe',
    coords: [
      [72.6, 21.0], [73.2, 21.0], [73.3, 21.5], [72.7, 21.6], [72.5, 21.2], [72.6, 21.0]
    ]
  },
  {
    name: 'Western Ghats Orographic Belt',
    district: 'Ratnagiri',
    state: 'Maharashtra',
    rainMm: 175.0,
    efiPercentile: 99.4,
    probGt50: 97,
    riskLevel: 'critical',
    coords: [
      [73.1, 16.8], [73.7, 16.8], [73.8, 17.4], [73.2, 17.5], [73.0, 17.0], [73.1, 16.8]
    ]
  },
  {
    name: 'Rohilkhand Ganges Upper Basin Rain',
    district: 'Shahjahanpur',
    state: 'Uttar Pradesh',
    rainMm: 125.0,
    efiPercentile: 97.0,
    probGt50: 90,
    riskLevel: 'severe',
    coords: [
      [79.6, 27.6], [80.2, 27.6], [80.3, 28.2], [79.7, 28.3], [79.5, 27.8], [79.6, 27.6]
    ]
  }
];

export const LiveRiskMap: React.FC<LiveRiskMapProps> = ({ selectedRegion = 'all', onSelectThreat }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupsRef = useRef<mapboxgl.Popup[]>([]);

  const [activeLayers, setActiveLayers] = useState<Record<MapLayerId, boolean>>({
    rainfall_forecast: true,
    rainfall_anomaly: true,
    extreme_probability: true,
    threat_footprint: true,
    trajectory: true,
    risk_grid_5km: true,
    admin_boundaries: true,
    vulnerability: true,
    wind_extremes: false,
  });

  const [currentRegion, setCurrentRegion] = useState<IndiaRegionId>(selectedRegion);
  const [selectedTimeStep, setSelectedTimeStep] = useState<number>(12);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [layerOpacity, setLayerOpacity] = useState<number>(0.80);
  const [selectedCell, setSelectedCell] = useState<GridCell5km | null>(MOCK_5KM_GRID[0] || null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [is3DEnabled, setIs3DEnabled] = useState<boolean>(true);
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite'>('dark');
  const [showLayerPanel, setShowLayerPanel] = useState<boolean>(true);


  const toggleMapStyle = useCallback(() => {
    const nextStyle = mapStyle === 'dark' ? 'satellite' : 'dark';
    setMapStyle(nextStyle);
    if (mapRef.current) {
      const styleUrl = API_CONFIG.mapboxPublicToken
        ? (nextStyle === 'dark' ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/satellite-streets-v12')
        : 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
      mapRef.current.setStyle(styleUrl);
    }
  }, [mapStyle]);

  const timeSteps = useMemo(() => [
    { hour: -24, label: '-24h' },
    { hour: -12, label: '-12h' },
    { hour: 0, label: 'Now' },
    { hour: 3, label: '+3h' },
    { hour: 6, label: '+6h' },
    { hour: 12, label: '+12h' },
    { hour: 24, label: '+24h' },
    { hour: 48, label: '+48h' },
    { hour: 72, label: '+72h' },
  ], []);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    popupsRef.current.forEach(p => p.remove());
    popupsRef.current = [];
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Graceful Mapbox GL Access Token setup
    const token = API_CONFIG.mapboxPublicToken || 'your_mapbox_public_token_here';
    mapboxgl.accessToken = token;

    // Use Carto GL dark style if mapbox token is absent or demo mode
    const styleUrl = API_CONFIG.mapboxPublicToken
      ? (mapStyle === 'dark' ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/satellite-streets-v12')
      : 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: styleUrl,
      center: [78.9629, 22.5937], // Center on India
      zoom: 4.8,
      pitch: is3DEnabled ? 40 : 0,
      bearing: is3DEnabled ? -10 : 0,
      projection: 'globe',
      antialias: true,
      maxZoom: 18,
      minZoom: 3,
    });

    map.addControl(new mapboxgl.NavigationControl({
      showCompass: true,
      showZoom: true,
      visualizePitch: true,
    }), 'bottom-right');

    map.addControl(new mapboxgl.ScaleControl({
      maxWidth: 120,
      unit: 'metric',
    }), 'bottom-left');

    map.on('load', () => {
      map.resize();
      setTimeout(() => map.resize(), 200);
      setTimeout(() => map.resize(), 800);

      try {
        map.setFog({
          color: 'rgb(8, 12, 24)',
          'high-color': 'rgb(20, 30, 60)',
          'horizon-blend': 0.08,
          'space-color': 'rgb(4, 6, 12)',
          'star-intensity': 0.6,
        });
      } catch (e) {
        console.warn('Globe fog setting skipped:', e);
      }

      // --- 1. RainViewer Live Precipitation Doppler Radar Raster Layer ---
      map.addSource('rain-radar-source', {
        type: 'raster',
        tiles: [
          '/api/v1/tiles/radar/{z}/{x}/{y}',
          'https://tilecache.rainviewer.com/v2/radar/nowcast_100m/{z}/{x}/{y}/2/1_1.png'
        ],
        tileSize: 256
      });

      map.addLayer({
        id: 'rain-radar-layer',
        type: 'raster',
        source: 'rain-radar-source',
        paint: {
          'raster-opacity': layerOpacity * 0.75,
          'raster-fade-duration': 300,
        },
      });

      // --- 2. Pan-India Downscaled Rainfall Isohyet GeoJSON Layer ---
      const isohyetFeatures = PAN_INDIA_RAINFALL_FEATURES.map((item, idx) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [item.coords],
        },
        properties: {
          id: `ISO-${idx + 1}`,
          name: item.name,
          district: item.district,
          state: item.state,
          rainMm: item.rainMm,
          efiPercentile: item.efiPercentile,
          probGt50: item.probGt50,
          riskLevel: item.riskLevel,
          color: item.rainMm > 150 ? '#ef4444' : item.rainMm > 110 ? '#f97316' : item.rainMm > 80 ? '#f59e0b' : '#06b6d4'
        }
      }));

      map.addSource('rain-isohyets-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: isohyetFeatures,
        },
      });

      map.addLayer({
        id: 'rain-isohyets-fill',
        type: 'fill',
        source: 'rain-isohyets-source',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': layerOpacity * 0.45,
        },
      });

      map.addLayer({
        id: 'rain-isohyets-line',
        type: 'line',
        source: 'rain-isohyets-source',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2.0,
          'line-opacity': 0.85,
        },
      });

      // --- 3. Extreme Forecast Index (EFI) Anomaly Contours Layer ---
      map.addSource('rain-anomaly-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: isohyetFeatures.filter(f => f.properties.efiPercentile > 96.0).map(f => ({
            ...f,
            properties: {
              ...f.properties,
              anomalyColor: '#c084fc'
            }
          }))
        }
      });

      map.addLayer({
        id: 'rain-anomaly-fill',
        type: 'fill',
        source: 'rain-anomaly-source',
        paint: {
          'fill-color': '#a855f7',
          'fill-opacity': layerOpacity * 0.35,
        }
      });

      map.addLayer({
        id: 'rain-anomaly-line',
        type: 'line',
        source: 'rain-anomaly-source',
        paint: {
          'line-color': '#e879f9',
          'line-width': 2.5,
          'line-dasharray': [2, 2],
          'line-opacity': 0.9,
        }
      });

      // --- 4. Exceedance Probability Layer (>50mm/24h) ---
      map.addSource('extreme-prob-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: isohyetFeatures.map(f => ({
            type: 'Feature' as const,
            geometry: f.geometry,
            properties: {
              prob: f.properties.probGt50,
              color: f.properties.probGt50 > 90 ? '#ef4444' : '#f59e0b'
            }
          }))
        }
      });

      map.addLayer({
        id: 'extreme-prob-fill',
        type: 'fill',
        source: 'extreme-prob-source',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': layerOpacity * 0.2,
        }
      });

      // --- 5. 5km Grid Cells Overlay ---
      const gridFeatures = MOCK_5KM_GRID.map(cell => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [cell.lng - 0.025, cell.lat - 0.025],
            [cell.lng + 0.025, cell.lat - 0.025],
            [cell.lng + 0.025, cell.lat + 0.025],
            [cell.lng - 0.025, cell.lat + 0.025],
            [cell.lng - 0.025, cell.lat - 0.025],
          ]],
        },
        properties: {
          id: cell.id,
          riskLevel: cell.riskLevel,
          riskScore: cell.downscaledRiskScore,
          rainfall: cell.rainfallForecastMm,
          probability: cell.probabilityGt50mm,
          district: cell.district,
          tehsil: cell.tehsil,
          elevation: cell.elevationMeters,
          vulnerability: cell.vulnerabilityIndex,
          anomaly: cell.anomalyPercentile,
          color: RISK_COLORS[cell.riskLevel] || '#10b981',
          height: cell.downscaledRiskScore * 40,
        },
      }));

      map.addSource('risk-grid', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: gridFeatures,
        },
      });

      map.addLayer({
        id: 'risk-grid-3d',
        type: 'fill-extrusion',
        source: 'risk-grid',
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': is3DEnabled ? ['get', 'height'] : 0,
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': layerOpacity * 0.5,
        },
      });

      map.addLayer({
        id: 'risk-grid-flat',
        type: 'fill',
        source: 'risk-grid',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': layerOpacity * 0.25,
        },
      });

      map.addLayer({
        id: 'risk-grid-outline',
        type: 'line',
        source: 'risk-grid',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 0.8,
          'line-opacity': 0.4,
        },
      });

      // --- 6. Threat Footprints GeoJSON ---
      const threatFeatures = MOCK_THREAT_OBJECTS.map(threat => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [threat.polygonCoords.map(([lat, lng]) => [lng, lat]).concat([
            [threat.polygonCoords[0][1], threat.polygonCoords[0][0]]
          ])],
        },
        properties: {
          id: threat.id,
          name: threat.name,
          riskLevel: threat.riskLevel,
          color: RISK_COLORS[threat.riskLevel] || '#f59e0b',
          district: threat.district,
          peakIntensity: threat.peakIntensityMmH,
          probability: threat.probabilityExceedance,
          speed: threat.speedKmH,
          direction: threat.direction,
          height: threat.probabilityExceedance * 70,
        },
      }));

      map.addSource('threat-footprints', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: threatFeatures,
        },
      });

      map.addLayer({
        id: 'threat-fill',
        type: 'fill',
        source: 'threat-footprints',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': layerOpacity * 0.35,
        },
      });

      map.addLayer({
        id: 'threat-outline',
        type: 'line',
        source: 'threat-footprints',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2.5,
          'line-dasharray': [3, 3],
          'line-opacity': 0.85,
        },
      });

      map.addLayer({
        id: 'threat-3d',
        type: 'fill-extrusion',
        source: 'threat-footprints',
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': is3DEnabled ? ['get', 'height'] : 0,
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': layerOpacity * 0.4,
        },
      });

      // --- 7. Trajectories & Markers ---
      const trajectoryFeatures = MOCK_THREAT_OBJECTS.map(threat => ({
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: threat.trajectoryPoints.map(p => [p.lng, p.lat]),
        },
        properties: {
          id: threat.id,
          name: threat.name,
        },
      }));

      map.addSource('trajectories', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: trajectoryFeatures,
        },
      });

      map.addLayer({
        id: 'trajectory-line',
        type: 'line',
        source: 'trajectories',
        paint: {
          'line-color': '#06b6d4',
          'line-width': 3,
          'line-dasharray': [4, 4],
          'line-opacity': 0.85,
        },
      });

      const waypointFeatures = MOCK_THREAT_OBJECTS.flatMap(threat => 
        threat.trajectoryPoints.map((p, idx) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [p.lng, p.lat],
          },
          properties: {
            isOrigin: idx === 0,
            timestamp: p.timestamp,
            hour: p.forecastHour,
            riskLevel: p.riskLevel,
            color: idx === 0 ? '#ef4444' : RISK_COLORS[p.riskLevel] || '#06b6d4',
          },
        }))
      );

      map.addSource('waypoints', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: waypointFeatures,
        },
      });

      map.addLayer({
        id: 'waypoint-circles',
        type: 'circle',
        source: 'waypoints',
        paint: {
          'circle-radius': ['case', ['get', 'isOrigin'], 8, 5],
          'circle-color': ['get', 'color'],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
          'circle-opacity': 0.95,
        },
      });

      // Add HTML markers for threat centroids
      MOCK_THREAT_OBJECTS.forEach(threat => {
        const el = document.createElement('div');
        el.className = 'threat-marker';
        el.innerHTML = `
          <div style="
            width: 32px; height: 32px; 
            background: ${RISK_COLORS[threat.riskLevel]}; 
            border: 2.5px solid white; 
            border-radius: 50%; 
            box-shadow: 0 0 20px ${RISK_GLOW[threat.riskLevel]}, 0 4px 12px rgba(0,0,0,0.3); 
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: transform 0.2s;
            font-size: 14px;
          ">🚨</div>
        `;
        el.style.cursor = 'pointer';

        const popup = new mapboxgl.Popup({
          offset: 20,
          closeButton: true,
          maxWidth: '300px',
        }).setHTML(`
          <div style="font-family: 'Inter', system-ui, sans-serif; padding: 4px;">
            <div style="font-weight: 800; font-size: 13px; color: ${RISK_COLORS[threat.riskLevel]}; margin-bottom: 6px;">
              ${threat.name}
            </div>
            <div style="font-size: 11px; color: #b4c1db; line-height: 1.6;">
              <strong style="color: #f0f4ff;">District:</strong> ${threat.district}<br/>
              <strong style="color: #f0f4ff;">Region:</strong> ${threat.region}<br/>
              <strong style="color: #f0f4ff;">Track Speed:</strong> ${threat.speedKmH} km/h (${threat.direction})<br/>
              <strong style="color: #f0f4ff;">Peak Rainfall Rate:</strong> ${threat.peakIntensityMmH} mm/h<br/>
              <strong style="color: #f0f4ff;">5km Subgrid Quantile:</strong> 
                <span style="color: ${RISK_COLORS[threat.riskLevel]}; font-weight: 700;">${threat.probabilityExceedance}% Exceedance</span>
            </div>
          </div>
        `);

        popupsRef.current.push(popup);

        const marker = new mapboxgl.Marker({
          element: el,
          anchor: 'center',
        })
          .setLngLat([threat.centroid[1], threat.centroid[0]])
          .setPopup(popup)
          .addTo(map);

        el.addEventListener('click', () => {
          if (onSelectThreat) onSelectThreat(threat);
        });

        markersRef.current.push(marker);
      });

      // Hover / Click interaction for Rain Isohyet Polygons
      map.on('click', 'rain-isohyets-fill', (e) => {
        if (!e.features?.length) return;
        const props = (e.features[0] as any).properties;
        if (!props) return;

        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="font-family: sans-serif; font-size: 12px; padding: 4px;">
              <div style="font-weight: bold; color: #38bdf8; font-size: 13px; margin-bottom: 4px;">🌧️ ${props.name}</div>
              <div><strong>District:</strong> ${props.district} (${props.state})</div>
              <div><strong>Downscaled 24h Rain:</strong> <span style="color: #ef4444; font-weight: bold;">${props.rainMm} mm</span></div>
              <div><strong>EFI Climatological Percentile:</strong> ${props.efiPercentile}th</div>
              <div><strong>5km Quantile Exceedance Prob:</strong> ${props.probGt50}%</div>
            </div>
          `)
          .addTo(map);
      });

      map.on('mouseenter', 'rain-isohyets-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'rain-isohyets-fill', () => {
        map.getCanvas().style.cursor = '';
      });

      map.on('click', 'risk-grid-flat', (e) => {
        if (!e.features?.length) return;
        const props = (e.features[0] as any).properties;
        if (!props) return;
        const cell = MOCK_5KM_GRID.find(c => c.id === props.id);
        if (cell) setSelectedCell(cell);
      });
    });

    mapRef.current = map;

    return () => {
      clearMarkers();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update region fly-to
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const preset = INDIA_REGION_PRESETS.find(p => p.id === currentRegion) || INDIA_REGION_PRESETS[0];
    map.flyTo({
      center: [preset.center[1], preset.center[0]],
      zoom: preset.zoom,
      pitch: is3DEnabled ? 40 : 0,
      bearing: is3DEnabled ? -10 : 0,
      duration: 1800,
      essential: true,
    });
  }, [currentRegion, is3DEnabled]);

  // Sync layer visibilities dynamically
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const layerMap: Record<string, string[]> = {
      rainfall_forecast: ['rain-radar-layer', 'rain-isohyets-fill', 'rain-isohyets-line'],
      rainfall_anomaly: ['rain-anomaly-fill', 'rain-anomaly-line'],
      extreme_probability: ['extreme-prob-fill'],
      risk_grid_5km: ['risk-grid-3d', 'risk-grid-flat', 'risk-grid-outline'],
      threat_footprint: ['threat-fill', 'threat-outline', 'threat-3d'],
      trajectory: ['trajectory-line', 'waypoint-circles'],
    };

    Object.entries(layerMap).forEach(([key, mapboxLayers]) => {
      const visible = activeLayers[key as MapLayerId];
      mapboxLayers.forEach(layerId => {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
        }
      });
    });
  }, [activeLayers]);

  // Sync opacity
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const opacityUpdates: [string, string, number][] = [
      ['rain-radar-layer', 'raster-opacity', layerOpacity * 0.75],
      ['rain-isohyets-fill', 'fill-opacity', layerOpacity * 0.45],
      ['rain-anomaly-fill', 'fill-opacity', layerOpacity * 0.35],
      ['risk-grid-3d', 'fill-extrusion-opacity', layerOpacity * 0.5],
      ['risk-grid-flat', 'fill-opacity', layerOpacity * 0.25],
      ['threat-fill', 'fill-opacity', layerOpacity * 0.35],
      ['threat-3d', 'fill-extrusion-opacity', layerOpacity * 0.4],
    ];

    opacityUpdates.forEach(([layerId, prop, value]) => {
      if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, prop as any, value);
      }
    });
  }, [layerOpacity]);

  const toggle3D = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const newState = !is3DEnabled;
    setIs3DEnabled(newState);

    if (newState) {
      map.easeTo({ pitch: 40, bearing: -10, duration: 1200 });
    } else {
      map.easeTo({ pitch: 0, bearing: 0, duration: 1200 });
    }
  }, [is3DEnabled]);

  const resetView = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: [78.9629, 22.5937],
      zoom: 4.8,
      pitch: is3DEnabled ? 40 : 0,
      bearing: is3DEnabled ? -10 : 0,
      duration: 1800,
    });
    setCurrentRegion('all');
  }, [is3DEnabled]);

  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggleLayer = useCallback((layerId: MapLayerId) => {
    setActiveLayers(prev => ({ ...prev, [layerId]: !prev[layerId] }));
  }, []);

  const layerLabels: Record<MapLayerId, { label: string; icon: string }> = {
    rainfall_forecast: { label: 'Live Pan-India Rainfall Radar', icon: '🌧️' },
    rainfall_anomaly: { label: 'EFI Climatology Anomaly', icon: '⚡' },
    extreme_probability: { label: 'Extreme Prob (>50mm)', icon: '🎯' },
    threat_footprint: { label: 'Threat Polygons', icon: '🛡️' },
    trajectory: { label: 'GNN Trajectory Track', icon: '↗️' },
    risk_grid_5km: { label: '5 km Risk Grid Overlay', icon: '📐' },
    admin_boundaries: { label: 'State/District Boundaries', icon: '🏛️' },
    vulnerability: { label: 'River Basins & Slope Zones', icon: '🌊' },
    wind_extremes: { label: 'High Speed Wind & Cyclones', icon: '🌪️' },
  };

  const activeCount = useMemo(() => Object.values(activeLayers).filter(Boolean).length, [activeLayers]);

  return (
    <div className={`relative flex flex-col h-full w-full min-h-[500px] ${isFullscreen ? 'fixed inset-0 z-50 bg-[#070b16] p-0' : 'overflow-hidden border border-[#1a2540]'}`}>
      {/* Map Header Bar */}
      <div className="bg-[#0a0f1e]/95 backdrop-blur-xl border-b border-[#1a2540] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-3 w-3 rounded-full bg-cyan-400"></div>
            <div className="absolute inset-0 h-3 w-3 rounded-full bg-cyan-400 animate-ping opacity-75"></div>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              StormTrace 3D Pan-India GIS Rainfall Engine
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-gradient-to-r from-cyan-950 to-blue-950 text-cyan-300 border border-cyan-800/50 font-mono">
                Live Doppler Radar
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-violet-950/60 text-violet-300 border border-violet-800/40 font-mono">
                DDPM 5km Sub-Grid
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Spherical GNN Anomaly Tracker • 5km Diffusion Downscaled Extreme Value Radar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Region Selector */}
          <div className="flex items-center gap-1.5 bg-[#111827] border border-[#1e2d48] px-2.5 py-1.5 rounded-lg text-xs text-slate-200">
            <Globe className="h-3.5 w-3.5 text-cyan-400" />
            <select
              value={currentRegion}
              onChange={(e) => setCurrentRegion(e.target.value as IndiaRegionId)}
              className="bg-transparent text-xs text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              {INDIA_REGION_PRESETS.map(p => (
                <option key={p.id} value={p.id} className="bg-[#111827]">{p.name}</option>
              ))}
            </select>
          </div>

          {/* Style Toggle */}
          <button
            onClick={toggleMapStyle}
            className="px-2.5 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1e2d48] border border-[#1e2d48] text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all"
            title="Switch Map Base Style"
          >
            <Globe className="h-3.5 w-3.5 text-cyan-400" />
            <span className="capitalize font-mono">{mapStyle}</span>
          </button>

          {/* 3D Toggle */}
          <button
            onClick={toggle3D}

            className={`p-1.5 rounded-lg border transition-all ${
              is3DEnabled 
                ? 'bg-cyan-600/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]' 
                : 'bg-[#111827] border-[#1e2d48] text-slate-400 hover:text-slate-200'
            }`}
            title={is3DEnabled ? 'Disable 3D View' : 'Enable 3D View'}
          >
            <Mountain className="h-4 w-4" />
          </button>

          {/* Reset View */}
          <button
            onClick={resetView}
            className="p-1.5 rounded-lg bg-[#111827] hover:bg-[#1e2d48] border border-[#1e2d48] text-slate-400 hover:text-slate-200 transition-all"
            title="Reset to Pan-India View"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Opacity Slider */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-[#111827] border border-[#1e2d48] px-2.5 py-1.5 rounded-lg">
            <Sliders className="h-3.5 w-3.5 text-cyan-400" />
            <input
              type="range"
              min="0.2"
              max="1"
              step="0.05"
              value={layerOpacity}
              onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
              className="w-16 accent-cyan-400 cursor-pointer"
            />
            <span className="font-mono text-cyan-300 w-6 text-[11px]">{Math.round(layerOpacity * 100)}%</span>
          </div>

          {/* Fullscreen */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-[#111827] hover:bg-[#1e2d48] border border-[#1e2d48] text-slate-300 transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="relative flex-1 w-full h-full min-h-[500px] bg-[#060a14] overflow-hidden">
        <div ref={mapContainerRef} className="absolute inset-0 z-0 w-full h-full" />

        {/* Layer Panel Toggle */}
        <button
          onClick={() => setShowLayerPanel(!showLayerPanel)}
          className="absolute top-4 left-4 z-10 p-2 rounded-lg bg-[#0a0f1e]/90 backdrop-blur-lg border border-[#1e2d48] text-slate-300 hover:text-white transition-all"
        >
          {showLayerPanel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>

        {/* Floating Layer Controls */}
        {showLayerPanel && (
          <div className="absolute top-14 left-4 z-10 w-72 bg-[#0a0f1e]/92 backdrop-blur-xl p-3 rounded-xl border border-[#1e2d48] max-h-[80%] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#1e2d48]">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-cyan-400" />
                Active GIS Map Layers
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">
                {activeCount}/9 Active
              </span>
            </div>

            <div className="space-y-1">
              {(Object.keys(activeLayers) as MapLayerId[]).map(layerId => {
                const info = layerLabels[layerId];
                const isChecked = activeLayers[layerId];
                return (
                  <button
                    key={layerId}
                    onClick={() => toggleLayer(layerId)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all ${
                      isChecked
                        ? 'bg-cyan-950/60 border border-cyan-500/30 text-cyan-200 font-medium'
                        : 'bg-[#111827]/60 border border-[#1e2d48]/80 text-slate-400 hover:text-slate-200 hover:bg-[#151d33]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{info.icon}</span>
                      <span className="truncate">{info.label}</span>
                    </div>
                    {isChecked && <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#1e2d48] text-[11px]">
              <span className="text-slate-400 block font-semibold mb-1">Precipitation Severity Legend:</span>
              <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-bold">
                <div className="py-1 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">&lt;50mm</div>
                <div className="py-1 rounded bg-amber-950/60 text-amber-400 border border-amber-800/40">50-100mm</div>
                <div className="py-1 rounded bg-orange-950/60 text-orange-400 border border-orange-800/40">100-150mm</div>
                <div className="py-1 rounded bg-red-950/60 text-red-400 border border-red-800/40">&gt;150mm</div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Cell Inspection Panel */}
        {selectedCell && (
          <div className="absolute top-4 right-4 z-10 w-80 bg-[#0a0f1e]/92 backdrop-blur-xl p-4 rounded-xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/5 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e2d48]">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 block uppercase tracking-wider">5 KM DOWNSCALED CELL</span>
                <h4 className="font-bold text-slate-100 text-sm">{selectedCell.tehsil} ({selectedCell.district})</h4>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                selectedCell.riskLevel === 'critical' ? 'bg-red-600 text-white' :
                selectedCell.riskLevel === 'severe' ? 'bg-orange-600 text-white' : 'bg-amber-600 text-slate-900'
              }`}>
                {selectedCell.riskLevel}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#111827]/80 p-2 rounded-lg border border-[#1e2d48]">
                <span className="text-slate-500 block text-[10px]">Coordinates</span>
                <span className="text-slate-200 font-mono text-[11px]">{selectedCell.lat}°N, {selectedCell.lng}°E</span>
              </div>
              <div className="bg-[#111827]/80 p-2 rounded-lg border border-[#1e2d48]">
                <span className="text-slate-500 block text-[10px]">Rainfall (24h)</span>
                <span className="text-cyan-300 font-bold text-xs">{selectedCell.rainfallForecastMm} mm</span>
              </div>
              <div className="bg-[#111827]/80 p-2 rounded-lg border border-[#1e2d48]">
                <span className="text-slate-500 block text-[10px]">EFI Percentile</span>
                <span className="text-amber-400 font-bold text-xs">{selectedCell.anomalyPercentile}th</span>
              </div>
              <div className="bg-[#111827]/80 p-2 rounded-lg border border-[#1e2d48]">
                <span className="text-slate-500 block text-[10px]">Prob &gt; 50mm</span>
                <span className="text-red-400 font-bold text-xs">{selectedCell.probabilityGt50mm}%</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-300 bg-[#111827]/60 p-2 rounded border border-[#1e2d48] flex justify-between">
              <span>DEM Elevation: <strong>{selectedCell.elevationMeters}m</strong></span>
              <span>Flood Index: <strong className="text-cyan-400">{selectedCell.vulnerabilityIndex}</strong></span>
            </div>
          </div>
        )}

        {is3DEnabled && (
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a0f1e]/85 backdrop-blur-lg border border-violet-500/30 text-[11px] text-violet-300 font-mono">
            <Compass className="h-3.5 w-3.5 text-violet-400 animate-spin" style={{ animationDuration: '8s' }} />
            3D Globe View Active • GIS Radar Overlay
          </div>
        )}
      </div>

      {/* Bottom Time Step Bar */}
      <div className="bg-[#0a0f1e]/95 backdrop-blur-xl border-t border-[#1a2540] p-3 flex flex-col sm:flex-row items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold transition-all shadow-lg shadow-cyan-600/20"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <span className="text-xs font-mono text-cyan-300 shrink-0 font-bold">
            Forecast Step: {selectedTimeStep >= 0 ? `+${selectedTimeStep}h` : `${selectedTimeStep}h`}
          </span>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto py-1">
          {timeSteps.map(step => (
            <button
              key={step.hour}
              onClick={() => setSelectedTimeStep(step.hour)}
              className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-all shrink-0 ${
                selectedTimeStep === step.hour
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/25'
                  : 'bg-[#111827] text-slate-400 hover:text-slate-200 border border-[#1e2d48] hover:border-[#2a3f5f]'
              }`}
            >
              {step.label}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-500 shrink-0">
          <RefreshCw className="h-3.5 w-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Pan-India NCUM Ensemble Cycle Active</span>
        </div>
      </div>
    </div>
  );
};
