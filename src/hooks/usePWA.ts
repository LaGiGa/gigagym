// Hook para funcionalidades PWA

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
}

export function usePWA() {
  const baseUrl = import.meta.env.BASE_URL;

  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOffline: !navigator.onLine,
    deferredPrompt: null
  });

  useEffect(() => {
    // Verifica se já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    
    setState(prev => ({ ...prev, isInstalled: isStandalone }));

    // Listener para beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setState(prev => ({
        ...prev,
        isInstallable: true,
        deferredPrompt: e as BeforeInstallPromptEvent
      }));
    };

    // Listener para appinstalled
    const handleAppInstalled = () => {
      setState(prev => ({
        ...prev,
        isInstallable: false,
        isInstalled: true,
        deferredPrompt: null
      }));
      console.log('PWA instalado com sucesso!');
    };

    // Listeners para online/offline
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOffline: false }));
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOffline: true }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Solicita instalação do PWA
   */
  const promptInstall = useCallback(async () => {
    if (!state.deferredPrompt) {
      return false;
    }

    state.deferredPrompt.prompt();
    
    const { outcome } = await state.deferredPrompt.userChoice;
    
    setState(prev => ({
      ...prev,
      deferredPrompt: null,
      isInstallable: false
    }));

    return outcome === 'accepted';
  }, [state.deferredPrompt]);

  /**
   * Registra o service worker
   */
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      return null;
    }

    if (!import.meta.env.PROD) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register(`${baseUrl}sw.js`);
      console.log('Service Worker registrado:', registration);
      return registration;
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
      return null;
    }
  }, []);

  /**
   * Solicita permissão para notificações
   */
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, []);

  /**
   * Envia uma notificação local
   */
  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: `${baseUrl}icons/icon-192x192.png`,
        badge: `${baseUrl}icons/icon-72x72.png`,
        ...options
      });
    }
  }, []);

  /**
   * Verifica se o app pode ser instalado
   */
  const canInstall = useCallback(() => {
    return state.isInstallable && !state.isInstalled;
  }, [state.isInstallable, state.isInstalled]);

  return {
    ...state,
    promptInstall,
    registerServiceWorker,
    requestNotificationPermission,
    sendNotification,
    canInstall
  };
}
