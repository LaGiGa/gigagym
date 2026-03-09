import { useEffect, useMemo, useRef, useState } from 'react';
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
import { useApp } from '@/store/AppContext';
import { AppProvider } from '@/store/AppContext';
import './App.css';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { registerServiceWorker, isOffline, requestNotificationPermission, sendNotification } = usePWA();
  const { state } = useApp();
  const onboardingToastRef = useRef<string | null>(null);

  const onboarding = useMemo(() => {
    const hasName = state.profile.name.trim().length > 0;
    const hasAge = state.profile.age > 0;
    const hasHeight = state.profile.height > 0;
    const hasCurrentWeight = state.bodyMetrics.currentWeight > 0 || state.weightHistory.length > 0;
    const hasTargetWeight = typeof state.profile.targetWeight === 'number' && state.profile.targetWeight > 0;
    const hasWorkoutPlan = Object.values(state.weeklyWorkouts).some((workout) => workout !== null);

    const isProfileReady = hasName && hasAge && hasHeight && hasCurrentWeight && hasTargetWeight;
    const isComplete = isProfileReady && hasWorkoutPlan;

    let nextTab: 'profile' | 'workouts' | 'dashboard' = 'dashboard';
    if (!isProfileReady) nextTab = 'profile';
    else if (!hasWorkoutPlan) nextTab = 'workouts';

    let message = '';
    if (!isProfileReady) {
      message = 'Complete seu perfil e meta para liberar a Home.';
    } else if (!hasWorkoutPlan) {
      message = 'Agora monte seu primeiro treino para concluir a configuracao.';
    }

    return {
      isComplete,
      nextTab,
      message,
    };
  }, [state]);

  useEffect(() => {
    registerServiceWorker();
  }, [registerServiceWorker]);

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolvedTheme =
      state.settings.theme === 'system'
        ? prefersDark
          ? 'dark'
          : 'light'
        : state.settings.theme;

    if (resolvedTheme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [state.settings.theme]);

  useEffect(() => {
    if (isOffline) {
      toast.info('Voce esta offline. Os dados serao sincronizados quando voltar online.', {
        duration: 5000,
      });
    }
  }, [isOffline]);

  useEffect(() => {
    if (onboarding.isComplete) return;

    if (activeTab !== onboarding.nextTab) {
      setActiveTab(onboarding.nextTab);
    }

    if (onboardingToastRef.current !== onboarding.message) {
      onboardingToastRef.current = onboarding.message;
      toast.info(onboarding.message, { duration: 4000 });
    }
  }, [activeTab, onboarding]);

  useEffect(() => {
    if (!state.settings.notifications) return;
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      void requestNotificationPermission();
    }
  }, [state.settings.notifications, requestNotificationPermission]);

  useEffect(() => {
    if (!state.settings.notifications) return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const STORAGE_KEY = 'GiGaGym_last_daily_notification';

    const maybeSendDailyReminder = () => {
      const now = new Date();
      if (now.getHours() < 19) return;

      const today = now.toISOString().slice(0, 10);
      const lastSent = localStorage.getItem(STORAGE_KEY);
      if (lastSent === today) return;

      sendNotification('GiGaGym', {
        body: 'Hora de registrar seu progresso e concluir seu treino de hoje.',
      });
      localStorage.setItem(STORAGE_KEY, today);
    };

    maybeSendDailyReminder();
    const intervalId = window.setInterval(maybeSendDailyReminder, 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [state.settings.notifications, sendNotification]);

  const handleTabChange = (tab: string) => {
    if (onboarding.isComplete) {
      setActiveTab(tab);
      return;
    }

    if (tab !== onboarding.nextTab) {
      toast.info(onboarding.message, { duration: 2500 });
      setActiveTab(onboarding.nextTab);
      return;
    }

    setActiveTab(tab);
  };

  const handleNotificationClick = async () => {
    if (!state.settings.notifications) {
      toast.info('Ative as notificacoes no Perfil para receber lembretes.');
      return;
    }

    if (!('Notification' in window)) {
      toast.error('Este dispositivo nao suporta notificacoes web.');
      return;
    }

    if (Notification.permission !== 'granted') {
      const granted = await requestNotificationPermission();
      if (!granted) {
        toast.error('Permissao de notificacao nao concedida.');
        return;
      }
    }

    sendNotification('GiGaGym', { body: 'Notificacoes ativas no seu dispositivo.' });
    toast.success('Notificacoes testadas com sucesso.');
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'workouts':
        return <Workouts />;
      case 'progress':
        return <Progress onNavigate={setActiveTab} />;
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
          title={onboarding.isComplete ? 'GiGaGym' : 'Configuracao inicial'}
          showNotifications={onboarding.isComplete}
          showSettings
          onNotificationsClick={handleNotificationClick}
          onSettingsClick={() => setActiveTab('profile')}
        />

        <main>{renderPage()}</main>

        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

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

