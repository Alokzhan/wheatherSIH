import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  Play, 
  Pause, 
  Maximize2, 
  Minimize2, 
  Sliders, 
  Check,
  RefreshCw,
  Globe
} from 'lucide-react';
import type { MapLayerId, ThreatObject, GridCell5km, IndiaRegionId } from '../types/weather';
import { MOCK_THREAT_OBJECTS, MOCK_5KM_GRID, INDIA_REGION_PRESETS } from '../data/mockData';

interface LiveRiskMapProps {
  selectedRegion?: IndiaRegionId;
  onSelectThreat?: (threat: ThreatObject) => void;
}

export const LiveRiskMap: React.FC<LiveRiskMapProps> = ({ selectedRegion = 'all', onSelectThreat }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<Record<string, L.LayerGroup>>({});

  const [activeLayers, setActiveLayers] = useState<Record<MapLayerId, boolean>>({
    rainfall_forecast: true,
    rainfall_anomaly: true,
    extreme_probability: false,
    threat_footprint: true,
    trajectory: true,
    risk_grid_5km: true,
    admin_boundaries: true,
    vulnerability: true,
  });

  const [currentRegion, setCurrentRegion] = useState<IndiaRegionId>(selectedRegion);
  const [selectedTimeStep, setSelectedTimeStep] = useState<number>(12);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [layerOpacity, setLayerOpacity] = useState<number>(0.75);
  const [selectedCell, setSelectedCell] = useState<GridCell5km | null>(MOCK_5KM_GRID[0] || null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const timeSteps = [
    { hour: -24, label: '-24h' },
    { hour: -12, label: '-12h' },
    { hour: 0, label: 'Now' },
    { hour: 3, label: '+3h' },
    { hour: 6, label: '+6h' },
    { hour: 12, label: '+12h' },
    { hour: 24, label: '+24h' },
    { hour: 48, label: '+48h' },
    { hour: 72, label: '+72h' },
  ];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [22.5937, 78.9629], // Center of India
      zoom: 5,
      zoomControl: true,
    });

    // Dark Map Tile Layer (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; AstraWatch AI Pan-India',
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(map);

    mapRef.current = map;

    // Create Layer Groups
    const layers: Record<string, L.LayerGroup> = {
      rainfall_forecast: L.layerGroup().addTo(map),
      rainfall_anomaly: L.layerGroup().addTo(map),
      extreme_probability: L.layerGroup().addTo(map),
      threat_footprint: L.layerGroup().addTo(map),
      trajectory: L.layerGroup().addTo(map),
      risk_grid_5km: L.layerGroup().addTo(map),
      admin_boundaries: L.layerGroup().addTo(map),
      vulnerability: L.layerGroup().addTo(map),
    };
    layerGroupsRef.current = layers;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Center & Zoom when Region changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const preset = INDIA_REGION_PRESETS.find(p => p.id === currentRegion) || INDIA_REGION_PRESETS[0];
    map.flyTo(preset.center, preset.zoom, { duration: 1.5 });
  }, [currentRegion]);

  // Update Layers Content based on State
  useEffect(() => {
    const map = mapRef.current;
    const layers = layerGroupsRef.current;
    if (!map || !layers) return;

    // Clear all layers
    Object.values(layers).forEach(lg => lg.clearLayers());

    // Filter data by region if selected
    const filteredGrid = currentRegion === 'all' 
      ? MOCK_5KM_GRID 
      : MOCK_5KM_GRID.filter(c => c.regionId === currentRegion);

    const filteredThreats = currentRegion === 'all'
      ? MOCK_THREAT_OBJECTS
      : MOCK_THREAT_OBJECTS.filter(t => t.regionId === currentRegion);

    // 1. Render 5km Risk Grid Cells
    if (activeLayers.risk_grid_5km && layers.risk_grid_5km) {
      filteredGrid.forEach(cell => {
        const halfSize = 0.025;
        const bounds: L.LatLngBoundsExpression = [
          [cell.lat - halfSize, cell.lng - halfSize],
          [cell.lat + halfSize, cell.lng + halfSize]
        ];

        let fillColor = '#10b981';
        if (cell.riskLevel === 'critical') fillColor = '#ef4444';
        else if (cell.riskLevel === 'severe') fillColor = '#f97316';
        else if (cell.riskLevel === 'moderate') fillColor = '#f59e0b';

        const rectangle = L.rectangle(bounds, {
          color: fillColor,
          weight: 1,
          opacity: 0.3,
          fillColor,
          fillOpacity: layerOpacity * 0.45,
        });

        rectangle.on('click', () => {
          setSelectedCell(cell);
        });

        rectangle.bindTooltip(`
          <div style="font-size: 11px; color: #fff;">
            <strong>5km Grid Cell (${cell.tehsil}, ${cell.district})</strong><br/>
            Rainfall: <strong>${cell.rainfallForecastMm} mm</strong><br/>
            Exceedance Prob: <strong>${cell.probabilityGt50mm}%</strong><br/>
            Risk Score: <strong>${cell.downscaledRiskScore}/100</strong>
          </div>
        `, { sticky: true });

        rectangle.addTo(layers.risk_grid_5km);
      });
    }

    // 2. Render Threat Footprints & Polygons
    if (activeLayers.threat_footprint && layers.threat_footprint) {
      filteredThreats.forEach(threat => {
        const polygonColor = 
          threat.riskLevel === 'critical' ? '#ef4444' :
          threat.riskLevel === 'severe' ? '#f97316' : '#f59e0b';

        const polygon = L.polygon(threat.polygonCoords, {
          color: polygonColor,
          weight: 2,
          dashArray: threat.riskLevel === 'critical' ? '4, 4' : undefined,
          fillColor: polygonColor,
          fillOpacity: layerOpacity * 0.35,
        });

        const bboxRect = L.rectangle(threat.bbox, {
          color: polygonColor,
          weight: 1,
          dashArray: '2, 6',
          fill: false,
        });
        bboxRect.addTo(layers.threat_footprint);

        const pulseIcon = L.divIcon({
          className: 'custom-pulse-icon',
          html: `
            <div style="
              width: 26px; 
              height: 26px; 
              background: ${polygonColor}; 
              border: 2px solid white; 
              border-radius: 50%; 
              box-shadow: 0 0 16px ${polygonColor}; 
              display: flex; 
              align-items: center; 
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 11px;
            ">
              🚨
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const centroidMarker = L.marker(threat.centroid, { icon: pulseIcon });
        centroidMarker.bindPopup(`
          <div style="font-family: inherit; color: #fff; max-width: 240px;">
            <div style="font-weight: bold; font-size: 13px; color: ${polygonColor};">${threat.name}</div>
            <div style="font-size: 11px; margin-top: 4px;">
              <strong>District:</strong> ${threat.district}<br/>
              <strong>Region:</strong> ${threat.region}<br/>
              <strong>Track Speed:</strong> ${threat.speedKmH} km/h (${threat.direction})<br/>
              <strong>Peak Intensity:</strong> ${threat.peakIntensityMmH} mm/h<br/>
              <strong>Exceedance Prob:</strong> ${threat.probabilityExceedance}%
            </div>
          </div>
        `);

        centroidMarker.on('click', () => {
          if (onSelectThreat) onSelectThreat(threat);
        });

        polygon.addTo(layers.threat_footprint);
        centroidMarker.addTo(layers.threat_footprint);
      });
    }

    // 3. Render Trajectory Track Vectors
    if (activeLayers.trajectory && layers.trajectory) {
      filteredThreats.forEach(threat => {
        const latLngs = threat.trajectoryPoints.map(p => [p.lat, p.lng] as [number, number]);
        
        const trackLine = L.polyline(latLngs, {
          color: '#06b6d4',
          weight: 3,
          dashArray: '6, 6',
        });
        trackLine.addTo(layers.trajectory);

        threat.trajectoryPoints.forEach((p, idx) => {
          const circle = L.circleMarker([p.lat, p.lng], {
            radius: idx === 0 ? 6 : 4,
            fillColor: idx === 0 ? '#ef4444' : '#06b6d4',
            color: '#ffffff',
            weight: 1.5,
            fillOpacity: 0.9,
          });

          circle.bindTooltip(`
            <div style="font-size: 11px;">
              <strong>Forecast Step: ${p.timestamp}</strong><br/>
              Hour: +${p.forecastHour}h<br/>
              Track Coords: [${p.lat.toFixed(3)}, ${p.lng.toFixed(3)}]
            </div>
          `, { sticky: true });

          circle.addTo(layers.trajectory);
        });
      });
    }

  }, [activeLayers, layerOpacity, selectedTimeStep, currentRegion]);

  const toggleLayer = (layerId: MapLayerId) => {
    setActiveLayers(prev => ({ ...prev, [layerId]: !prev[layerId] }));
  };

  const layerLabels: Record<MapLayerId, { label: string; icon: string }> = {
    rainfall_forecast: { label: 'Rainfall Forecast (mm/h)', icon: '🌧️' },
    rainfall_anomaly: { label: 'EFI Rain Anomaly', icon: '⚡' },
    extreme_probability: { label: 'Extreme Prob (>50mm)', icon: '🎯' },
    threat_footprint: { label: 'Threat Polygons', icon: '🛡️' },
    trajectory: { label: 'GNN Trajectory Track', icon: '↗️' },
    risk_grid_5km: { label: '5 km Risk Grid Overlay', icon: '📐' },
    admin_boundaries: { label: 'State/District Boundaries', icon: '🏛️' },
    vulnerability: { label: 'River Basins & Slope Zones', icon: '🌊' },
  };

  return (
    <div className={`relative flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-2' : 'h-[780px] rounded-2xl overflow-hidden border border-slate-800'}`}>
      {/* Map Header Bar */}
      <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-cyan-400 animate-ping"></div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              AstraWatch Pan-India GIS Radar Map Engine
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                PI-UNet 5 km Grid
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Downscaled 5 km &amp; 1 km Probabilistic Extreme Rainfall Radar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Pan-India Preset Region Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg text-xs text-slate-200">
            <Globe className="h-3.5 w-3.5 text-cyan-400" />
            <select
              value={currentRegion}
              onChange={(e) => setCurrentRegion(e.target.value as IndiaRegionId)}
              className="bg-transparent text-xs text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              {INDIA_REGION_PRESETS.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>
              ))}
            </select>
          </div>

          {/* Opacity Slider */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
            <Sliders className="h-3.5 w-3.5 text-cyan-400" />
            <span>Opacity:</span>
            <input
              type="range"
              min="0.2"
              max="1"
              step="0.05"
              value={layerOpacity}
              onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
              className="w-16 accent-cyan-400 cursor-pointer"
            />
            <span className="font-mono text-cyan-300 w-6">{Math.round(layerOpacity * 100)}%</span>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Map Body Container */}
      <div className="relative flex-1 w-full bg-slate-950 overflow-hidden">
        <div ref={mapContainerRef} className="absolute inset-0 z-0" />

        {/* Top-Left Floating Layer Controls Toggle Panel */}
        <div className="absolute top-4 left-4 z-10 w-72 glass-panel p-3 rounded-xl border border-slate-800 max-h-[85%] overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-cyan-400" />
              Active Map Layers
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">
              {Object.values(activeLayers).filter(Boolean).length}/8 Active
            </span>
          </div>

          <div className="space-y-1.5">
            {(Object.keys(activeLayers) as MapLayerId[]).map(layerId => {
              const info = layerLabels[layerId];
              const isChecked = activeLayers[layerId];
              return (
                <button
                  key={layerId}
                  onClick={() => toggleLayer(layerId)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all ${
                    isChecked
                      ? 'bg-cyan-950/70 border border-cyan-500/40 text-cyan-200 font-medium'
                      : 'bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-slate-200'
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

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px]">
            <span className="text-slate-400 block font-semibold mb-1">Risk Severity Scale:</span>
            <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-bold">
              <div className="py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">Low</div>
              <div className="py-1 rounded bg-amber-950 text-amber-400 border border-amber-800">Mod</div>
              <div className="py-1 rounded bg-orange-950 text-orange-400 border border-orange-800">Severe</div>
              <div className="py-1 rounded bg-red-950 text-red-400 border border-red-800">Critical</div>
            </div>
          </div>
        </div>

        {/* Top-Right Floating Grid Cell Inspection Card */}
        {selectedCell && (
          <div className="absolute top-4 right-4 z-10 w-80 glass-panel p-4 rounded-xl border border-cyan-500/40 shadow-2xl space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 block uppercase">5 KM DOWN-SCALED CELL</span>
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
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Coordinates</span>
                <span className="text-slate-200 font-mono text-[11px]">{selectedCell.lat}°N, {selectedCell.lng}°E</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Rainfall (24h)</span>
                <span className="text-cyan-300 font-bold text-xs">{selectedCell.rainfallForecastMm} mm</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">EFI Percentile</span>
                <span className="text-amber-400 font-bold text-xs">{selectedCell.anomalyPercentile}th</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Prob &gt; 50mm</span>
                <span className="text-red-400 font-bold text-xs">{selectedCell.probabilityGt50mm}%</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800 flex justify-between">
              <span>DEM Elevation: <strong>{selectedCell.elevationMeters}m</strong></span>
              <span>Flood Index: <strong className="text-cyan-400">{selectedCell.vulnerabilityIndex}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Time Slider Bar */}
      <div className="bg-slate-950/95 border-t border-slate-800 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors"
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
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {step.label}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
          <RefreshCw className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
          <span>Pan-India NCUM Ensemble Cycle Active</span>
        </div>
      </div>
    </div>
  );
};
