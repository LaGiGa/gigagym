// Card de estatísticas

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'default' | 'lime' | 'blue' | 'orange' | 'red' | 'green';
  onClick?: () => void;
  className?: string;
}

const colorVariants = {
  default: 'bg-muted text-muted-foreground',
  lime: 'bg-primary/15 text-primary',
  blue: 'bg-blue-500/10 text-blue-500',
  orange: 'bg-orange-500/10 text-orange-500',
  red: 'bg-red-500/10 text-red-500',
  green: 'bg-green-500/10 text-green-500'
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'default',
  onClick,
  className
}: StatCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'rounded-2xl border-border/70 bg-card/95 p-4 transition-all duration-200',
        onClick && 'cursor-pointer active:scale-[0.98] hover:border-primary/30 hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {title}
          </p>
          <p className="mt-1 truncate text-2xl font-extrabold">
            {value}
          </p>
          
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {subtitle}
            </p>
          )}
          
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn(
                'text-xs font-medium',
                trend === 'up' && 'text-green-500',
                trend === 'down' && 'text-red-500',
                trend === 'neutral' && 'text-muted-foreground'
              )}>
                {trend === 'up' && '↑'}
                {trend === 'down' && '↓'}
                {trend === 'neutral' && '→'}
                {' '}{trendValue}
              </span>
            </div>
          )}
        </div>
        
        <div
          className={cn(
            'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl',
            colorVariants[color]
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}
