import { useState, useEffect, lazy, Suspense } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { DashboardOverview } from './components/DashboardOverview';
import { Footer } from './components/Footer';
import type { ThreatObject, IndiaRegionId } from './types/weather';

// Lazy loading tab components for performance optimization & code splitting
const LiveRiskMap = lazy(() => import('./components/LiveRiskMap').then(m => ({ default: m.LiveRiskMap })));
const LocalityExplorer = lazy(() => import('./components/LocalityExplorer').then(m => ({ default: m.LocalityExplorer })));
const AiModelHub = lazy(() => import('./components/AiModelHub').then(m => ({ default: m.AiModelHub })));
const LocationRisk = lazy(() => import('./components/LocationRisk').then(m => ({ default: m.LocationRisk })));
const EventDetail = lazy(() => import('./components/EventDetail').then(m => ({ default: m.EventDetail })));
const AlertCenter = lazy(() => import('./components/AlertCenter').then(m => ({ default: m.AlertCenter })));
const HistoricalAnalysis = lazy(() => import('./components/HistoricalAnalysis').then(m => ({ default: m.HistoricalAnalysis })));
const FarmerAdvisory = lazy(() => import('./components/FarmerAdvisory').then(m => ({ default: m.FarmerAdvisory })));
const DisasterDashboard = lazy(() => import('./components/DisasterDashboard').then(m => ({ default: m.DisasterDashboard })));
const AdminPanel = lazy(() => import('./components/AdminPanel').then(m => ({ default: m.AdminPanel })));
const ApiExplorer = lazy(() => import('./components/ApiExplorer').then(m => ({ default: m.ApiExplorer })));

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
        <main id="main-content" className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl w-full mx-auto">
          <Suspense fallback={
            <div className="h-96 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-mono font-bold animate-pulse">Loading StormTrace Radar Component...</span>
            </div>
          }>
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
          </Suspense>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default App;
