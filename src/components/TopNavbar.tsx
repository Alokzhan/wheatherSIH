import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Globe, 
  Bell, 
  Sun, 
  Moon, 
  Clock, 
  AlertTriangle
} from 'lucide-react';
import { INDIA_REGION_PRESETS } from '../data/mockData';
import type { IndiaRegionId } from '../types/weather';

interface TopNavbarProps {
  selectedRegion: IndiaRegionId;
  setSelectedRegion: (region: IndiaRegionId) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onSearchSubmit: (query: string) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  selectedRegion,
  setSelectedRegion,
  theme,
  setTheme,
  onSearchSubmit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [showAlertModal, setShowAlertModal] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) + ' IST');
    };
    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between gap-4 sticky top-0 z-30 transition-colors">
      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-lg relative">
        <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search location e.g., Prayagraj, Bareilly, Mumbai, Wayanad, 211001..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
        />
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Primary Pilot Focus Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>Pilot Focus: Prayagraj &amp; Shahjahanpur</span>
        </div>

        {/* Live Date/Time Badge & Data Freshness */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-mono">
          <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span>{currentTime || 'Mon, 28 Apr 2025 10:24 AM IST'}</span>
          <span className="text-[10px] text-emerald-500 font-bold ml-1">• Fresh (2m)</span>
        </div>

        {/* Region Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200">
          <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value as IndiaRegionId)}
            className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-200"
          >
            {INDIA_REGION_PRESETS.map(r => (
              <option key={r.id} value={r.id} className="bg-white dark:bg-slate-900">{r.name}</option>
            ))}
          </select>
        </div>

        {/* Theme Switcher */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertModal(!showAlertModal)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 relative transition-all"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* Quick Notification Dropdown */}
          {showAlertModal && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 z-50 text-xs space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Active Severe Alerts (4)
                </span>
                <span className="text-[10px] text-blue-600 font-semibold cursor-pointer">Mark All Read</span>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 space-y-1">
                  <span className="font-bold text-red-600 dark:text-red-400 block">Severe Thunderstorm Alert</span>
                  <span className="text-[10px] text-slate-500 block">Prayagraj / Phulpur • 29m ago</span>
                </div>
                <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 space-y-1">
                  <span className="font-bold text-orange-600 dark:text-orange-400 block">Heavy Rainfall Warning</span>
                  <span className="text-[10px] text-slate-500 block">Mumbai Suburban • 1h ago</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
