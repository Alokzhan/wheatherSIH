import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { DashboardOverview } from './components/DashboardOverview';
import { LiveRiskMap } from './components/LiveRiskMap';
import { LocalityExplorer } from './components/LocalityExplorer';
import { AiModelHub } from './components/AiModelHub';
import { LocationRisk } from './components/LocationRisk';
import { EventDetail } from './components/EventDetail';
import { AlertCenter } from './components/AlertCenter';
import { HistoricalAnalysis } from './components/HistoricalAnalysis';
import { FarmerAdvisory } from './components/FarmerAdvisory';
import { DisasterDashboard } from './components/DisasterDashboard';
import { AdminPanel } from './components/AdminPanel';
import { ApiExplorer } from './components/ApiExplorer';
import { Footer } from './components/Footer';
import type { ThreatObject, IndiaRegionId } from './types/weather';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedRegion, setSelectedRegion] = useState<IndiaRegionId>('all');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [selectedThreat, setSelectedThreat] = useState<ThreatObject | null>(null);

  // Sync data-theme attribute on document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleSelectThreatFromMap = (threat: ThreatObject) => {
    setSelectedThreat(threat);
  };

  const handleTopSearch = (_query: string) => {
    setActiveTab('locality');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-200">
      {/* Left Collapsible Dark Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Right Shell Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <TopNavbar
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          theme={theme}
          setTheme={setTheme}
          onSearchSubmit={handleTopSearch}
        />

        {/* Content Container Area */}
        <main className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              selectedRegion={selectedRegion}
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectThreat={handleSelectThreatFromMap}
            />
          )}

          {activeTab === 'map' && (
            <LiveRiskMap
              selectedRegion={selectedRegion}
              onSelectThreat={handleSelectThreatFromMap}
            />
          )}

          {activeTab === 'locality' && <LocalityExplorer />}

          {activeTab === 'models' && <AiModelHub />}

          {activeTab === 'location' && (
            <LocationRisk
              initialLocKey="prayagraj"
              onNavigateToEvent={() => setActiveTab('event')}
            />
          )}

          {activeTab === 'event' && (
            <EventDetail
              selectedEventId={selectedThreat?.id}
              onNavigateToMap={() => setActiveTab('map')}
            />
          )}

          {activeTab === 'alerts' && <AlertCenter />}

          {activeTab === 'historical' && <HistoricalAnalysis />}

          {activeTab === 'evaluation' && <HistoricalAnalysis />}

          {activeTab === 'farmer' && (
            <FarmerAdvisory lang="en" setLang={() => {}} />
          )}

          {activeTab === 'disaster' && <DisasterDashboard />}

          {activeTab === 'admin' && <AdminPanel />}

          {activeTab === 'api' && <ApiExplorer />}

          {activeTab === 'settings' && <AdminPanel />}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default App;
