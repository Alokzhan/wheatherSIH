import React from 'react';
import { 
  Activity, 
  MapPin, 
  CloudRain, 
  Thermometer, 
  AlertTriangle, 
  ArrowRight, 
  Layers,
  Sparkles
} from 'lucide-react';
import { MOCK_ALERTS } from '../data/mockData';
import { LiveRiskMap } from './LiveRiskMap';
import type { IndiaRegionId, ThreatObject } from '../types/weather';

interface DashboardOverviewProps {
  selectedRegion: IndiaRegionId;
  onNavigate: (tab: string) => void;
  onSelectThreat: (threat: ThreatObject) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  selectedRegion,
  onNavigate,
  onSelectThreat,
}) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Powered Extreme Weather Tracking &amp; Hyperlocal Alerts</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Good Morning, Disaster Officer
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Here is the latest Pan-India weather downscaling and extreme event activity snapshot.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('map')}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-600/20"
          >
            Open Interactive GIS Map
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Stat Cards Row (Screen 2 from Mockup) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="storm-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Active Events</span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">5 Tracked</span>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
              <span className="text-red-500 font-bold">Severe: 3</span> • 
              <span className="text-amber-500 font-bold">Moderate: 2</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
            <Activity className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="storm-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Areas at Risk</span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">12 Districts</span>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
              <span className="text-red-500 font-bold">High: 5</span> • 
              <span className="text-amber-500 font-bold">Mod: 5</span> • 
              <span className="text-emerald-500 font-bold">Low: 2</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <MapPin className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="storm-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Total Precipitation (24h)</span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">78 mm</span>
            <span className="text-[10px] text-slate-500 block mt-1 font-mono">Max: 142 mm (Prayagraj / Mumbai)</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <CloudRain className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="storm-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Avg. Temperature</span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">32°C</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">+1.2°C vs yesterday</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Thermometer className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Split Section: Active Weather Events Radar Map + Recent Alerts Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 65%: Radar GIS Map Preview */}
        <div className="lg:col-span-8 storm-card overflow-hidden flex flex-col h-[520px]">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Active Weather Events &amp; 5 km Downscaled Radar
              </h3>
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              Expand Full Map
            </button>
          </div>

          <div className="flex-1 relative">
            <LiveRiskMap selectedRegion={selectedRegion} onSelectThreat={onSelectThreat} />
          </div>
        </div>

        {/* Right 35%: Recent Alerts Feed (Screen 2 Mockup) */}
        <div className="lg:col-span-4 storm-card p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Recent Hazard Alerts
              </h3>
              <button
                onClick={() => onNavigate('alerts')}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {MOCK_ALERTS.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => onNavigate('alerts')}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-blue-500 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                      alert.riskLevel === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                      'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                    }`}>
                      {alert.riskLevel}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{alert.district}</span>
                  </div>

                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs line-clamp-1">
                    {alert.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {alert.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('alerts')}
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-slate-700"
          >
            Open Alert Center Dispatch
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
