import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Dashboard } from '@/pages/Dashboard';
import { Workouts } from '@/pages/Workouts';
import { Progress } from '@/pages/Progress';
import { Calculators } from '@/pages/Calculators';
import { Profile } from '@/pages/Profile';
import { Toaster } from '@/components/ui/sonner';
import { usePWA } from '@/hooks/usePWA';
import { AppProvider } from '@/store/AppContext';
import { initializeMockData } from '@/utils/mockData';
import './App.css';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { registerServiceWorker, isOffline } = usePWA();

  useEffect(() => {
    initializeMockData();
    registerServiceWorker();
  }, [registerServiceWorker]);

  useEffect(() => {
    if (isOffline) {
      toast.info('Voce esta offline. Os dados serao sincronizados quando voltar online.', {
        duration: 5000,
      });
    }
  }, [isOffline]);

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'workouts':
        return <Workouts />;
      case 'progress':
        return <Progress />;
      case 'calculators':
        return <Calculators />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-shell bg-background text-foreground">
      <div className="app-content-layer">
        <Header
          title="GiGaGym"
          showNotifications
          showSettings
          onSettingsClick={() => setActiveTab('profile')}
        />

        <main>{renderPage()}</main>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))',
            },
          }}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

