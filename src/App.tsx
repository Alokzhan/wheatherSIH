import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { DashboardOverview } from './components/DashboardOverview';
import type { ThreatObject, IndiaRegionId } from './types/weather';

// Lazy loading tab components for code splitting & performance
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
const HowItWorks = lazy(() => import('./components/HowItWorks').then(m => ({ default: m.HowItWorks })));

// Premium loading spinner
const LoadingFallback = () => (
  <div className="h-96 flex flex-col items-center justify-center space-y-4 text-slate-400">
    <div className="relative">
      <div className="h-12 w-12 border-3 border-blue-600/30 rounded-full"></div>
      <div className="h-12 w-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
    </div>
    <span className="text-xs font-mono font-semibold animate-pulse">Loading StormTrace Module...</span>
  </div>
);

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedRegion, setSelectedRegion] = useState<IndiaRegionId>('all');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [selectedThreat, setSelectedThreat] = useState<ThreatObject | null>(null);
  const [topSearchQuery, setTopSearchQuery] = useState<string>('');

  // Sync data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleSelectThreatFromMap = useCallback((threat: ThreatObject) => {
    setSelectedThreat(threat);
  }, []);

  const handleTopSearch = useCallback((query: string) => {
    setTopSearchQuery(query);
    setActiveTab('locality');
  }, []);

  const handleNavigate = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  // Render active tab content
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview
            selectedRegion={selectedRegion}
            onNavigate={handleNavigate}
            onSelectThreat={handleSelectThreatFromMap}
          />
        );
      case 'map':
        return (
          <LiveRiskMap
            selectedRegion={selectedRegion}
            onSelectThreat={handleSelectThreatFromMap}
          />
        );
      case 'locality':
        return <LocalityExplorer initialSearchQuery={topSearchQuery} />;
      case 'models':
        return <AiModelHub />;
      case 'location':
        return (
          <LocationRisk
            initialLocKey="prayagraj"
            onNavigateToEvent={() => setActiveTab('event')}
          />
        );
      case 'event':
        return (
          <EventDetail
            selectedEventId={selectedThreat?.id}
            onNavigateToMap={() => setActiveTab('map')}
          />
        );
      case 'alerts':
        return <AlertCenter />;
      case 'historical':
      case 'evaluation':
        return <HistoricalAnalysis />;
      case 'farmer':
        return <FarmerAdvisory lang="en" setLang={() => {}} />;
      case 'how-it-works':
        return <HowItWorks />;
      case 'disaster':
        return <DisasterDashboard />;
      case 'admin':
      case 'settings':
        return <AdminPanel />;
      case 'api':
        return <ApiExplorer />;
      default:
        return (
          <DashboardOverview
            selectedRegion={selectedRegion}
            onNavigate={handleNavigate}
            onSelectThreat={handleSelectThreatFromMap}
          />
        );
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 dark:bg-[#070b16] text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          theme={theme}
          setTheme={setTheme}
          onSearchSubmit={handleTopSearch}
        />

        {/* Content */}
        <main 
          id="main-content" 
          className={`flex-1 min-h-0 ${
            activeTab === 'map' 
              ? 'p-0 overflow-hidden flex flex-col h-full w-full max-w-none' 
              : 'overflow-y-auto px-4 sm:px-6 py-6 max-w-7xl w-full mx-auto'
          }`}
        >
          <Suspense fallback={<LoadingFallback />}>
            {renderContent()}
          </Suspense>
        </main>

      </div>
    </div>
  );
}

export default App;
