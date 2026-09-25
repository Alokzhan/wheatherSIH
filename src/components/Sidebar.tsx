import React from 'react';
import { 
  CloudLightning, 
  LayoutDashboard, 
  Map, 
  Target, 
  Cpu, 
  ShieldAlert, 
  History, 
  BarChart2, 
  Database, 
  FileText, 
  Settings, 
  ChevronRight,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Weather Map', icon: Map, badge: 'Live' },
    { id: 'event', label: 'Event Tracking', icon: Target },
    { id: 'models', label: 'AI Analysis', icon: Cpu, badge: '5 km' },
    { id: 'alerts', label: 'Risk & Alerts', icon: ShieldAlert, badge: '4 Active' },
    { id: 'historical', label: 'Historical Explorer', icon: History },
    { id: 'evaluation', label: 'Model Evaluation', icon: BarChart2 },
    { id: 'admin', label: 'Data Center', icon: Database },
    { id: 'api', label: 'Weather APIs', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 shrink-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
          <CloudLightning className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-black text-base tracking-wider text-white flex items-center gap-1.5">
            STORMTRACE AI
          </h1>
          <p className="text-[10px] text-slate-400 font-medium">
            Smarter Forecasts. Safer Tomorrow.
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2 font-mono">
          Main Navigation
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-bold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge ? (
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                  isActive ? 'bg-white/20 text-white' :
                  item.badge === 'Live' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                  item.badge.includes('Active') ? 'bg-red-950 text-red-400 border border-red-800' :
                  'bg-blue-950 text-blue-400 border border-blue-800'
                }`}>
                  {item.badge}
                </span>
              ) : (
                isActive && <ChevronRight className="h-3.5 w-3.5 text-white/70" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer User Profile Card */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-white text-xs">
              AV
            </div>
            <div>
              <span className="font-bold text-white block truncate w-28 text-[11px]">Alok Verma</span>
              <span className="text-[10px] text-slate-400 block truncate">Disaster Officer</span>
            </div>
          </div>
          <button className="text-slate-500 hover:text-slate-300 p-1" title="Sign Out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
