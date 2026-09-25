import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { LiveRiskMap } from './components/LiveRiskMap';
import { AiModelHub } from './components/AiModelHub';
import { LocationRisk } from './components/LocationRisk';
import { EventDetail } from './components/EventDetail';
import { AlertCenter } from './components/AlertCenter';
import { HistoricalAnalysis } from './components/HistoricalAnalysis';
import { FarmerAdvisory } from './components/FarmerAdvisory';
import { DisasterDashboard } from './components/DisasterDashboard';
import { AdminPanel } from './components/AdminPanel';
import { ApiExplorer } from './components/ApiExplorer';
import type { UserRole, ThreatObject, IndiaRegionId } from './types/weather';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [userRole, setUserRole] = useState<UserRole>('public');
  const [selectedRegion, setSelectedRegion] = useState<IndiaRegionId>('all');
  const [theme, setTheme] = useState<'light' | 'dark'>('light'); // Modern bright theme by default
  const [lang, setLang] = useState<'en' | 'hi' | 'hinglish'>('en');
  const [selectedLocationKey, setSelectedLocationKey] = useState<string>('prayagraj');
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

  return (
    <div className="min-h-screen transition-colors duration-200 flex flex-col font-sans">
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        theme={theme}
        setTheme={setTheme}
        lang={lang}
        setLang={setLang}
      />

      {/* Main Container View Switcher */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'landing' && (
          <LandingPage
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectLocation={(locKey) => setSelectedLocationKey(locKey)}
          />
        )}

        {activeTab === 'map' && (
          <LiveRiskMap
            selectedRegion={selectedRegion}
            onSelectThreat={handleSelectThreatFromMap}
          />
        )}

        {activeTab === 'models' && <AiModelHub />}

        {activeTab === 'location' && (
          <LocationRisk
            initialLocKey={selectedLocationKey}
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

        {activeTab === 'farmer' && (
          <FarmerAdvisory lang={lang} setLang={setLang} />
        )}

        {activeTab === 'disaster' && <DisasterDashboard />}

        {activeTab === 'admin' && <AdminPanel />}

        {activeTab === 'api' && <ApiExplorer />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
