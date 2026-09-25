import React from 'react';
import { 
  ShieldAlert, 
  Map, 
  Search, 
  AlertTriangle, 
  History, 
  Sprout, 
  Activity, 
  Settings, 
  Code2, 
  Radio, 
  UserCheck,
  Cpu,
  Globe
} from 'lucide-react';
import type { UserRole, IndiaRegionId } from '../types/weather';
import { INDIA_REGION_PRESETS } from '../data/mockData';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  selectedRegion: IndiaRegionId;
  setSelectedRegion: (region: IndiaRegionId) => void;
  lang: 'en' | 'hi' | 'hinglish';
  setLang: (lang: 'en' | 'hi' | 'hinglish') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  selectedRegion,
  setSelectedRegion,
  lang,
  setLang,
}) => {
  const tabs = [
    { id: 'landing', label: 'Pan-India Overview', icon: ShieldAlert },
    { id: 'map', label: 'Live GIS Risk Map', icon: Map, badge: '5 km Grid' },
    { id: 'models', label: 'AI & ML Models', icon: Cpu, badge: 'PI-UNet' },
    { id: 'location', label: 'Location Risk', icon: Search },
    { id: 'event', label: 'Event Detail', icon: Activity },
    { id: 'alerts', label: 'Alert Center', icon: AlertTriangle, badge: '4 Active' },
    { id: 'historical', label: 'Historical Replay', icon: History },
    { id: 'farmer', label: 'Farmer Portal', icon: Sprout },
    { id: 'disaster', label: 'Operations Briefing', icon: Radio },
    { id: 'admin', label: 'Admin Control', icon: Settings },
    { id: 'api', label: 'REST APIs', icon: Code2 },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      {/* Ticker Banner */}
      <div className="bg-red-950/70 border-b border-red-900/50 px-4 py-1.5 text-xs flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-2 text-red-400 font-medium shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="font-bold tracking-wide uppercase">PAN-INDIA EMERGENCY RADAR NODE:</span>
        </div>

        <div className="overflow-hidden relative w-full mx-4">
          <div className="whitespace-nowrap inline-block animate-marquee text-slate-300">
            🚨 <strong className="text-red-400">WAYANAD (KERALA) EXTREME OROGRAPHIC RED ALERT:</strong> 99% Exceedance Prob for &gt;200mm/24h Rain | 🚨 <strong className="text-red-400">MUMBAI SUBURBAN RED ALERT:</strong> Mithi River High Tide Inundation | ⚡ <strong className="text-amber-400">PRAYAGRAJ CONFLUENCE:</strong> 94% Prob Exceedance | 🏔️ <strong className="text-cyan-300">CHAMOLI HIMALAYAN SURGE:</strong> 125mm/h Peak Intensity
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-slate-400 text-[11px]">
          <span className="hidden sm:inline">Coverage: All India (3.28M km²)</span>
          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
            PI-UNet + ST-GNN Active
          </span>
        </div>
      </div>

      {/* Main Nav Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wider bg-gradient-to-r from-cyan-400 via-sky-200 to-white bg-clip-text text-transparent">
                AstraWatch AI
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
                SIH Pan-India
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Pan-India 5 km &amp; 1 km Physics-Informed Extreme Rainfall Intelligence
            </p>
          </div>
        </div>

        {/* Right Tools: Region Selector, Role & Language */}
        <div className="flex items-center gap-2.5">
          {/* Pan-India Region Dropdown */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200">
            <Globe className="h-3.5 w-3.5 text-cyan-400" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value as IndiaRegionId)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer font-bold"
            >
              {INDIA_REGION_PRESETS.map(r => (
                <option key={r.id} value={r.id} className="bg-slate-900">{r.name}</option>
              ))}
            </select>
          </div>

          {/* Language Toggle */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                lang === 'en' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                lang === 'hi' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLang('hinglish')}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                lang === 'hinglish' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hinglish
            </button>
          </div>

          {/* User Role Switcher */}
          <div className="relative flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300">
            <UserCheck className="h-3.5 w-3.5 text-cyan-400" />
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="public" className="bg-slate-900">Public User</option>
              <option value="farmer" className="bg-slate-900">Farmer (Kisan)</option>
              <option value="disaster_officer" className="bg-slate-900">Disaster Officer</option>
              <option value="meteorologist" className="bg-slate-900">Meteorologist / Analyst</option>
              <option value="administrator" className="bg-slate-900">Administrator</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs Subnav */}
      <div className="border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-900/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    tab.badge.includes('UNet') ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' :
                    tab.badge.includes('Grid') ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-red-950 text-red-300 border border-red-800'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
