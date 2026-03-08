import { Calculator, Dumbbell, Home, TrendingUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Inicio', icon: Home },
  { id: 'workouts', label: 'Treinos', icon: Dumbbell },
  { id: 'progress', label: 'Progresso', icon: TrendingUp },
  { id: 'calculators', label: 'Saude', icon: Calculator },
  { id: 'profile', label: 'Perfil', icon: User },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/70 bg-background/90 pb-safe backdrop-blur-xl supports-[backdrop-filter]:bg-background/75"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto flex h-20 w-full max-w-xl items-center justify-around px-1 sm:px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'touch-target relative flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-xl transition-all duration-200',
                'active:scale-95',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label={item.label}
            >
              {isActive && <span className="absolute top-1 h-1.5 w-8 rounded-full bg-gradient-energy" />}
              <div className={cn('rounded-xl p-2.5 transition-all duration-200', isActive && 'bg-primary/15')}>
                <Icon
                  className={cn('h-5 w-5 transition-all duration-200', isActive && 'scale-110')}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className={cn('text-[11px] font-semibold transition-all duration-200', isActive && 'text-primary')}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
