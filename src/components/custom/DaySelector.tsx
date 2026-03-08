// Seletor de dia da semana

import { cn } from '@/lib/utils';
import type { DayOfWeek } from '@/types';

interface DaySelectorProps {
  selectedDay: DayOfWeek | null;
  onSelect: (day: DayOfWeek) => void;
  hasWorkout?: Record<string, boolean>;
  completedDays?: Record<string, boolean>;
  className?: string;
}

const days: DayOfWeek[] = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

const dayLabels: Record<DayOfWeek, string> = {
  segunda: 'Seg',
  terca: 'Ter',
  quarta: 'Qua',
  quinta: 'Qui',
  sexta: 'Sex',
  sabado: 'Sáb',
  domingo: 'Dom'
};

export function DaySelector({
  selectedDay,
  onSelect,
  hasWorkout = {},
  completedDays = {},
  className
}: DaySelectorProps) {
  return (
    <div className={cn('scrollbar-hide flex gap-2 overflow-x-auto pb-2', className)}>
      {days.map((day) => {
        const isSelected = selectedDay === day;
        const hasWorkoutDay = hasWorkout[day];
        const isCompleted = completedDays[day];

        return (
          <button
            key={day}
            onClick={() => onSelect(day)}
            className={cn(
              'flex h-[74px] min-w-[3.75rem] flex-col items-center justify-center rounded-2xl border-2 px-2 transition-all duration-200',
              'touch-target active:scale-95',
              isSelected
                ? 'border-primary bg-primary/15'
                : 'border-transparent bg-card/85 hover:border-border hover:bg-accent/20',
              isCompleted && !isSelected && 'border-primary/30 bg-primary/10'
            )}
          >
            <span className={cn(
              'text-xs font-semibold',
              isSelected ? 'text-primary' : 'text-muted-foreground'
            )}>
              {dayLabels[day]}
            </span>

            <div className={cn(
              'mt-1.5 h-2.5 w-2.5 rounded-full',
              isCompleted 
                ? 'bg-primary' 
                : hasWorkoutDay 
                  ? 'bg-amber-500' 
                  : 'bg-muted'
            )} />
          </button>
        );
      })}
    </div>
  );
}
