// Header do aplicativo

import { Dumbbell, Bell, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  showMenu?: boolean;
  showNotifications?: boolean;
  showSettings?: boolean;
  onMenuClick?: () => void;
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
  className?: string;
}

export function Header({
  title = 'GiGaGym',
  showNotifications = false,
  showSettings = false,
  onNotificationsClick,
  onSettingsClick,
  className
}: HeaderProps) {
  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-40 border-b border-border/60',
        'bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70',
        className
      )}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="mx-auto flex h-16 w-full max-w-xl items-center justify-between px-4 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-energy shadow-sm">
              <Dumbbell className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold leading-none text-gradient-energy">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showNotifications && (
            <button
              onClick={onNotificationsClick}
              className="touch-target relative rounded-xl border border-border/70 bg-card/90 p-2.5 transition-all duration-200 hover:border-primary/60 hover:bg-accent/20 active:scale-95"
              aria-label="Notificacoes"
            >
              <Bell className="h-5 w-5" />
              <span className="animate-pulse-dot absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </button>
          )}

          {showSettings && (
            <button
              onClick={onSettingsClick}
              className="touch-target rounded-xl border border-border/70 bg-card/90 p-2.5 transition-all duration-200 hover:border-primary/60 hover:bg-accent/20 active:scale-95"
              aria-label="Configuracoes"
            >
              <Settings className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

