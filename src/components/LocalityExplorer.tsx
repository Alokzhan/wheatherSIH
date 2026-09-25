import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  CloudRain, 
  Wind, 
  Droplets, 
  Navigation, 
  Clock,
  Loader2
} from 'lucide-react';
import { MOCK_LOCATION_RISKS } from '../data/mockData';
import type { LocationRiskData } from '../types/weather';
import { getPanIndiaLocationRisk } from '../utils/panIndiaWeatherEngine';

export const LocalityExplorer: React.FC = () => {
  const [activeLoc, setActiveLoc] = useState<LocationRiskData>(MOCK_LOCATION_RISKS.prayagraj);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const loc: LocationRiskData = activeLoc;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    setIsSearching(true);
    try {
      const res = await getPanIndiaLocationRisk(q);
      setActiveLoc(res);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Search Header Bar */}
      <div className="storm-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">HYPERLOCAL PAN-INDIA WEATHER &amp; RADAR EXPLORER</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            {loc.locationName}
          </h2>
          <p className="text-xs text-slate-500">
            District: <strong>{loc.district}</strong> • Coordinates: <span className="font-mono">[{loc.coordinates[0]}°N, {loc.coordinates[1]}°E]</span>
          </p>
        </div>

        {/* Quick Search Input */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 max-w-md w-full">
          {isSearching ? <Loader2 className="h-4 w-4 text-blue-500 animate-spin ml-2 shrink-0" /> : <Search className="h-4 w-4 text-slate-400 ml-2 shrink-0" />}
          <input
            type="text"
            placeholder="Search ANY City, Village or PIN in India (e.g. Chinour, Delhi, Wayanad)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none px-2"
          />
          <button type="submit" disabled={isSearching} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 disabled:opacity-50">
            {isSearching ? 'Analyzing...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Grid View: Current Weather + Forecast + Radar Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 60%: Weather Card & Next 3 Hours */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Weather Card (Screen 4 Mockup) */}
          <div className="storm-card p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-slate-500 block uppercase">Current Weather</span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-5xl font-black text-slate-900 dark:text-slate-100 font-mono">28°C</span>
                  <span className="text-base font-bold text-blue-600 dark:text-blue-400">Light to Heavy Rain</span>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase ${
                loc.currentRiskLevel === 'critical' ? 'badge-critical' : 'badge-severe'
              }`}>
                {loc.currentRiskLevel} RISK
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-500 block text-[10px] flex items-center gap-1">
                  <Droplets className="h-3.5 w-3.5 text-blue-500" /> Humidity
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">82%</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-500 block text-[10px] flex items-center gap-1">
                  <Wind className="h-3.5 w-3.5 text-cyan-500" /> Wind Speed
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">18 km/h</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-500 block text-[10px] flex items-center gap-1">
                  <CloudRain className="h-3.5 w-3.5 text-blue-600" /> Rainfall (24h)
                </span>
                <span className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono">{loc.forecast24h.rainMm} mm</span>
              </div>
            </div>
          </div>

          {/* Next 3 Hours Forecast (Screen 4 Pills) */}
          <div className="storm-card p-6 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Next 3 Hours Forecast Timeline
            </h3>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">12:00 PM</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-base font-mono block">29°C</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold block">Light Rain</span>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-center space-y-1">
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono block font-bold">03:00 PM</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-base font-mono block">28°C</span>
                <span className="text-[10px] text-red-500 font-bold block">Heavy Rain</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">06:00 PM</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-base font-mono block">25°C</span>
                <span className="text-[10px] text-amber-500 font-semibold block">Moderate Rain</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 40%: Nearby Rain Cells Radar Cards */}
        <div className="lg:col-span-5 storm-card p-6 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Navigation className="h-4 w-4 text-blue-600" />
            Nearby Detected Rain Cells &amp; Radar Distance
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Rain Cell (NW Core)</span>
                <span className="text-[10px] text-slate-500">Track Speed: 18 km/h ENE</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-blue-600 font-bold text-sm block">5.2 km</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-700 font-bold uppercase">Moderate</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Rain Cell (SW Confluence)</span>
                <span className="text-[10px] text-slate-500">Track Speed: 22 km/h NE</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-red-500 font-bold text-sm block">8.7 km</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-bold uppercase">Heavy Inundation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
