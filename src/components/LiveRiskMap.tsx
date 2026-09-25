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

// Risk level color mapping (consistent across the system)
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

export const LiveRiskMap: React.FC<LiveRiskMapProps> = ({ selectedRegion = 'all', onSelectThreat }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupsRef = useRef<mapboxgl.Popup[]>([]);

  const [activeLayers, setActiveLayers] = useState<Record<MapLayerId, boolean>>({
    rainfall_forecast: true,
    rainfall_anomaly: true,
    extreme_probability: false,
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
  const [layerOpacity, setLayerOpacity] = useState<number>(0.75);
  const [selectedCell, setSelectedCell] = useState<GridCell5km | null>(MOCK_5KM_GRID[0] || null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [is3DEnabled, setIs3DEnabled] = useState<boolean>(true);
  const [showLayerPanel, setShowLayerPanel] = useState<boolean>(true);
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite'>('dark');

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

  // Cleanup all markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    popupsRef.current.forEach(p => p.remove());
    popupsRef.current = [];
  }, []);

  // Initialize Mapbox GL Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = API_CONFIG.mapboxPublicToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle === 'dark' 
        ? 'mapbox://styles/mapbox/dark-v11' 
        : 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [78.9629, 22.5937], // India center [lng, lat]
      zoom: 4.5,
      pitch: is3DEnabled ? 45 : 0,
      bearing: is3DEnabled ? -12 : 0,
      projection: 'globe',
      antialias: true,
      maxZoom: 18,
      minZoom: 3,
    });

    // Add navigation controls
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
      setTimeout(() => map.resize(), 100);
      setTimeout(() => map.resize(), 400);
      setTimeout(() => map.resize(), 1000);

      // Set fog / atmosphere for globe view
      map.setFog({
        color: 'rgb(8, 12, 24)',
        'high-color': 'rgb(20, 30, 60)',
        'horizon-blend': 0.08,
        'space-color': 'rgb(4, 6, 12)',
        'star-intensity': 0.6,
      });

      // Add terrain for 3D effect
      if (is3DEnabled) {
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        });
        map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
      }

      // Add 3D building layer
      const layers = map.getStyle().layers;
      const labelLayerId = layers?.find(
        (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
      )?.id;

      if (labelLayerId) {
        map.addLayer(
          {
            id: '3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 12,
            paint: {
              'fill-extrusion-color': '#1a2540',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': 0.7,
            },
          },
          labelLayerId
        );
      }

      // Add sky layer for atmosphere
      map.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 90.0],
          'sky-atmosphere-sun-intensity': 8,
        },
      });

      // Add risk grid GeoJSON source
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
          height: cell.downscaledRiskScore * 50, // Extrude based on risk score
        },
      }));

      map.addSource('risk-grid', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: gridFeatures,
        },
      });

      // 3D Extruded risk grid
      map.addLayer({
        id: 'risk-grid-3d',
        type: 'fill-extrusion',
        source: 'risk-grid',
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': is3DEnabled ? ['get', 'height'] : 0,
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': layerOpacity * 0.6,
        },
      });

      // Flat risk grid (fallback / complement)
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

      // Threat footprint GeoJSON
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
          height: threat.probabilityExceedance * 80,
        },
      }));

      map.addSource('threat-footprints', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: threatFeatures,
        },
      });

      // Threat footprint fill
      map.addLayer({
        id: 'threat-fill',
        type: 'fill',
        source: 'threat-footprints',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': layerOpacity * 0.3,
        },
      });

      // Threat footprint outline (animated dash)
      map.addLayer({
        id: 'threat-outline',
        type: 'line',
        source: 'threat-footprints',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2.5,
          'line-dasharray': [3, 3],
          'line-opacity': 0.8,
        },
      });

      // 3D Extruded threat volumes
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

      // Trajectory lines
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
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });

      // Trajectory waypoint circles
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

      // Add threat centroid markers with custom HTML
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
          <div style="
            position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px;
            border: 2px solid ${RISK_COLORS[threat.riskLevel]}; border-radius: 50%;
            animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            pointer-events: none;
          "></div>
        `;
        el.style.cursor = 'pointer';
        el.style.position = 'relative';

        const popup = new mapboxgl.Popup({
          offset: 20,
          closeButton: true,
          maxWidth: '280px',
        }).setHTML(`
          <div style="font-family: 'Inter', system-ui, sans-serif;">
            <div style="font-weight: 800; font-size: 13px; color: ${RISK_COLORS[threat.riskLevel]}; margin-bottom: 6px;">
              ${threat.name}
            </div>
            <div style="font-size: 11px; color: #b4c1db; line-height: 1.6;">
              <strong style="color: #f0f4ff;">District:</strong> ${threat.district}<br/>
              <strong style="color: #f0f4ff;">Region:</strong> ${threat.region}<br/>
              <strong style="color: #f0f4ff;">Track Speed:</strong> ${threat.speedKmH} km/h (${threat.direction})<br/>
              <strong style="color: #f0f4ff;">Intensity:</strong> ${threat.hazardMetricDisplay || (threat.peakIntensityMmH + ' mm/h')}<br/>
              <strong style="color: #f0f4ff;">Exceedance Prob:</strong> 
                <span style="color: ${RISK_COLORS[threat.riskLevel]}; font-weight: 700;">${threat.probabilityExceedance}%</span>
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

      // Click handler for grid cells
      map.on('click', 'risk-grid-flat', (e) => {
        if (!e.features?.length) return;
        const props = (e.features[0] as any).properties;
        if (!props) return;
        const cell = MOCK_5KM_GRID.find(c => c.id === props.id);
        if (cell) setSelectedCell(cell);
      });

      map.on('mouseenter', 'risk-grid-flat', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'risk-grid-flat', () => {
        map.getCanvas().style.cursor = '';
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
      center: [preset.center[1], preset.center[0]], // [lng, lat]
      zoom: preset.zoom,
      pitch: is3DEnabled ? 45 : 0,
      bearing: is3DEnabled ? -12 : 0,
      duration: 2000,
      essential: true,
    });
  }, [currentRegion, is3DEnabled]);

  // Update layer visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const layerMap: Record<string, string[]> = {
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

  // Update opacity
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const opacityUpdates: [string, string, number][] = [
      ['risk-grid-3d', 'fill-extrusion-opacity', layerOpacity * 0.6],
      ['risk-grid-flat', 'fill-opacity', layerOpacity * 0.25],
      ['risk-grid-outline', 'line-opacity', layerOpacity * 0.4],
      ['threat-fill', 'fill-opacity', layerOpacity * 0.3],
      ['threat-outline', 'line-opacity', layerOpacity * 0.8],
      ['threat-3d', 'fill-extrusion-opacity', layerOpacity * 0.4],
    ];

    opacityUpdates.forEach(([layerId, prop, value]) => {
      if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, prop as any, value);
      }
    });
  }, [layerOpacity]);

  // Dynamic filter for Wind Extremes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const visibleThreats = MOCK_THREAT_OBJECTS.filter(threat => {
      if (activeLayers.wind_extremes) {
        return threat.hazardType?.toLowerCase().includes('cyclone') || threat.hazardType?.toLowerCase().includes('wind') || threat.speedKmH > 80;
      }
      return true;
    });

    const threatFeatures = visibleThreats.map(threat => ({
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
        height: threat.probabilityExceedance * 80,
      },
    }));

    const trajectoryFeatures = visibleThreats.map(threat => ({
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

    const waypointFeatures = visibleThreats.flatMap(threat => 
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

    if (map.getSource('threat-footprints')) {
      (map.getSource('threat-footprints') as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: threatFeatures,
      });
    }
    if (map.getSource('trajectories')) {
      (map.getSource('trajectories') as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: trajectoryFeatures,
      });
    }
    if (map.getSource('waypoints')) {
      (map.getSource('waypoints') as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: waypointFeatures,
      });
    }
  }, [activeLayers.wind_extremes]);

  // Toggle 3D
  const toggle3D = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const newState = !is3DEnabled;
    setIs3DEnabled(newState);

    if (newState) {
      map.easeTo({ pitch: 45, bearing: -12, duration: 1200 });
      if (!map.getSource('mapbox-dem')) {
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        });
      }
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
    } else {
      map.easeTo({ pitch: 0, bearing: 0, duration: 1200 });
      map.setTerrain(null);
    }
  }, [is3DEnabled]);

  // Toggle map style (Dark / Satellite)
  const toggleMapStyle = useCallback(() => {
    const nextStyle = mapStyle === 'dark' ? 'satellite' : 'dark';
    setMapStyle(nextStyle);
    if (mapRef.current) {
      mapRef.current.setStyle(
        nextStyle === 'dark' 
          ? 'mapbox://styles/mapbox/dark-v11' 
          : 'mapbox://styles/mapbox/satellite-streets-v12'
      );
    }
  }, [mapStyle]);

  // Reset view
  const resetView = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: [78.9629, 22.5937],
      zoom: 4.5,
      pitch: is3DEnabled ? 45 : 0,
      bearing: is3DEnabled ? -12 : 0,
      duration: 2000,
    });
    setCurrentRegion('all');
  }, [is3DEnabled]);

  // Resize observer to keep Mapbox GL canvas sized to 100% container
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
    rainfall_forecast: { label: 'Rainfall Forecast (mm/h)', icon: '🌧️' },
    rainfall_anomaly: { label: 'EFI Rain Anomaly', icon: '⚡' },
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
              StormTrace 3D Pan-India GIS Engine
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-gradient-to-r from-cyan-950 to-blue-950 text-cyan-300 border border-cyan-800/50 font-mono">
                Mapbox GL 3D
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-violet-950/60 text-violet-300 border border-violet-800/40 font-mono">
                PI-UNet 5 km
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Terrain-Aware 3D Probabilistic Extreme Rainfall Radar • Globe View
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Style Selector */}
          <button
            onClick={toggleMapStyle}
            className="px-2.5 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1e2d48] border border-[#1e2d48] text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all"
            title="Switch Map Base Style"
          >
            <Globe className="h-3.5 w-3.5 text-cyan-400" />
            <span className="capitalize font-mono">{mapStyle} Map</span>
          </button>

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

          {/* 3D Toggle */}
          <button
            onClick={toggle3D}
            className={`p-1.5 rounded-lg border transition-all ${
              is3DEnabled 
                ? 'bg-cyan-600/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]' 
                : 'bg-[#111827] border-[#1e2d48] text-slate-400 hover:text-slate-200'
            }`}
            title={is3DEnabled ? 'Disable 3D Terrain' : 'Enable 3D Terrain'}
          >
            <Mountain className="h-4 w-4" />
          </button>

          {/* Reset View */}
          <button
            onClick={resetView}
            className="p-1.5 rounded-lg bg-[#111827] hover:bg-[#1e2d48] border border-[#1e2d48] text-slate-400 hover:text-slate-200 transition-all"
            title="Reset to India View"
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

      {/* Main Map Body */}
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
                Active Map Layers
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">
                {activeCount}/8 Active
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
              <span className="text-slate-400 block font-semibold mb-1">Risk Severity Scale:</span>
              <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-bold">
                <div className="py-1 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">Low</div>
                <div className="py-1 rounded bg-amber-950/60 text-amber-400 border border-amber-800/40">Mod</div>
                <div className="py-1 rounded bg-orange-950/60 text-orange-400 border border-orange-800/40">Severe</div>
                <div className="py-1 rounded bg-red-950/60 text-red-400 border border-red-800/40">Critical</div>
              </div>
            </div>
          </div>
        )}

        {/* Grid Cell Inspection Panel */}
        {selectedCell && (
          <div className="absolute top-4 right-4 z-10 w-80 bg-[#0a0f1e]/92 backdrop-blur-xl p-4 rounded-xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/5 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e2d48]">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 block uppercase tracking-wider">5 KM DOWN-SCALED CELL</span>
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

        {/* 3D View Badge */}
        {is3DEnabled && (
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a0f1e]/85 backdrop-blur-lg border border-violet-500/30 text-[11px] text-violet-300 font-mono">
            <Compass className="h-3.5 w-3.5 text-violet-400 animate-spin" style={{ animationDuration: '8s' }} />
            3D Terrain Active • Globe Projection
          </div>
        )}
      </div>

      {/* Bottom Time Slider Bar */}
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
