import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  AlertTriangle,
  ShieldAlert, 
  Sprout, 
  User, 
  Radio, 
  Clock, 
  ArrowRight
} from 'lucide-react';
import { MOCK_LOCATION_RISKS } from '../data/mockData';
import type { LocationRiskData } from '../types/weather';

interface LocationRiskProps {
  initialLocKey?: string;
  onNavigateToEvent?: () => void;
}

export const LocationRisk: React.FC<LocationRiskProps> = ({ initialLocKey = 'prayagraj', onNavigateToEvent }) => {
  const [selectedKey, setSelectedKey] = useState<string>(initialLocKey in MOCK_LOCATION_RISKS ? initialLocKey : 'prayagraj');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const locData: LocationRiskData = MOCK_LOCATION_RISKS[selectedKey] || MOCK_LOCATION_RISKS.prayagraj;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.toLowerCase().trim();
    if (!q) return;

    // Search match in keys
    const foundKey = Object.keys(MOCK_LOCATION_RISKS).find(k => 
      k.includes(q) || MOCK_LOCATION_RISKS[k].locationName.toLowerCase().includes(q) || MOCK_LOCATION_RISKS[k].pinCode === q
    );

    if (foundKey) {
      setSelectedKey(foundKey);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Search Box */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">FR-08 LOCATION INTELLIGENCE</span>
            <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-cyan-400" />
              Location-Specific Risk &amp; Exceedance Advisory
            </h2>
            <p className="text-xs text-slate-400">
              Query 5 km downscaled risk score, probability curves, and safety guidelines by place name, PIN code, or coordinates.
            </p>
          </div>

          {/* Location Selector Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(MOCK_LOCATION_RISKS).map(([k, d]) => (
              <button
                key={k}
                onClick={() => setSelectedKey(k)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedKey === k
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {d.locationName.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 bg-slate-950 border border-slate-700 rounded-xl p-2 max-w-2xl">
          <Search className="h-5 w-5 text-slate-400 ml-2" />
          <input
            type="text"
            placeholder="Search by city, tehsil, village or PIN (e.g. Prayagraj, Phulpur, Naini, 211001, 25.43,81.84)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none px-2"
          />
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors shadow-md"
          >
            Search Location
          </button>
        </form>
      </div>

      {/* Main Location Risk Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Risk Cards & Hourly Curves */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Status Spotlight Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                  locData.currentRiskLevel === 'critical' ? 'bg-red-950 border border-red-800 text-red-400' :
                  locData.currentRiskLevel === 'severe' ? 'bg-orange-950 border border-orange-800 text-orange-400' :
                  'bg-amber-950 border border-amber-800 text-amber-400'
                }`}>
                  <ShieldAlert className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100">{locData.locationName}</h3>
                  <p className="text-xs text-slate-400">
                    District: <strong className="text-slate-200">{locData.district}</strong> • Coordinates: <span className="font-mono text-cyan-300">[{locData.coordinates[0]}°N, {locData.coordinates[1]}°E]</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Risk Score Index</span>
                <span className="text-3xl font-black text-red-400 font-mono">{locData.riskScore}<span className="text-sm font-normal text-slate-500">/100</span></span>
              </div>
            </div>

            {/* 4-Step Forecast Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Next 24 Hours</span>
                <span className="text-lg font-bold text-red-400 font-mono block">{locData.forecast24h.rainMm} mm</span>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Exceedance:</span>
                  <span className="text-red-400 font-bold font-mono">{locData.forecast24h.prob}%</span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">48 Hours</span>
                <span className="text-lg font-bold text-orange-400 font-mono block">{locData.forecast48h.rainMm} mm</span>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Exceedance:</span>
                  <span className="text-orange-400 font-bold font-mono">{locData.forecast48h.prob}%</span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">72 Hours</span>
                <span className="text-lg font-bold text-amber-400 font-mono block">{locData.forecast72h.rainMm} mm</span>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Exceedance:</span>
                  <span className="text-amber-400 font-bold font-mono">{locData.forecast72h.prob}%</span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">5-Day Outlook</span>
                <span className="text-lg font-bold text-emerald-400 font-mono block">{locData.forecast5d.rainMm} mm</span>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Exceedance:</span>
                  <span className="text-emerald-400 font-bold font-mono">{locData.forecast5d.prob}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hourly Exceedance & Rain Rate Distribution */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-400" />
              Diurnal Hourly Exceedance Probability (&gt; 50mm Threshold)
            </h3>

            <div className="space-y-3">
              {locData.hourlyProbabilities.map((hp, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-mono text-slate-300 font-semibold">{hp.hour}</span>
                    <div className="flex gap-4">
                      <span className="text-cyan-300 font-mono font-bold">{hp.rainMm} mm/3h</span>
                      <span className="text-red-400 font-mono font-bold">{hp.prob}% Probability</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        hp.prob > 80 ? 'bg-gradient-to-r from-orange-500 to-red-600' :
                        hp.prob > 50 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                        'bg-cyan-500'
                      }`}
                      style={{ width: `${hp.prob}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Tailored Safety Advisories */}
        <div className="lg:col-span-4 space-y-6">
          {/* Nearest Active Threat Object */}
          <div className="glass-panel p-5 rounded-2xl border border-red-500/40 space-y-3">
            <span className="text-[10px] text-red-400 font-mono uppercase block font-bold">NEARBY THREAT DISTANCE</span>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-100 text-xs leading-snug">{locData.nearestThreatName}</h4>
                <p className="text-[11px] text-cyan-300 font-mono mt-1">
                  Distance: <strong>{locData.nearestThreatDistanceKm} km away</strong>
                </p>
              </div>
            </div>

            {onNavigateToEvent && (
              <button
                onClick={onNavigateToEvent}
                className="w-full py-2 rounded-lg bg-red-950/60 hover:bg-red-950 border border-red-800 text-red-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                Inspect Threat Footprint
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Stakeholder Safety Guidelines */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
              <ShieldAlert className="h-4 w-4 text-cyan-400" />
              Tailored Location Safety Advisory
            </h3>

            {/* Public User Advisory */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                <User className="h-4 w-4" />
                Public &amp; Resident Advisory
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {locData.safetyAdvisory.public}
              </p>
            </div>

            {/* Farmer Kisan Advisory */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Sprout className="h-4 w-4" />
                Farmer (Kisan) Field Advisory
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {locData.safetyAdvisory.farmer}
              </p>
            </div>

            {/* Official Disaster Officer Advisory */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Radio className="h-4 w-4" />
                Disaster Officer Operational Directives
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {locData.safetyAdvisory.official}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
