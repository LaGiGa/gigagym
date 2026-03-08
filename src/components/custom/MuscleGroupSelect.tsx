// Seletor de grupo muscular

import { cn } from '@/lib/utils';
import type { MuscleGroup } from '@/types';
import { getMuscleGroupName, getMuscleGroupEmoji } from '@/utils/calculations';

interface MuscleGroupSelectProps {
  selected: MuscleGroup;
  onSelect: (group: MuscleGroup) => void;
  className?: string;
}

const muscleGroups: MuscleGroup[] = [
  'peito',
  'costas',
  'ombros',
  'biceps',
  'triceps',
  'pernas',
  'gluteos',
  'panturrilha',
  'abdomen',
  'cardio',
  'full_body',
  'outro'
];

export function MuscleGroupSelect({
  selected,
  onSelect,
  className
}: MuscleGroupSelectProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-2', className)}>
      {muscleGroups.map((group) => {
        const isSelected = selected === group;
        
        return (
          <button
            key={group}
            onClick={() => onSelect(group)}
            className={cn(
              'flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200',
              'border-2 active:scale-95',
              isSelected
                ? 'border-lime-500 bg-lime-500/10'
                : 'border-border bg-card hover:bg-accent'
            )}
          >
            <span className="text-2xl mb-1">{getMuscleGroupEmoji(group)}</span>
            <span className={cn(
              'text-xs font-medium text-center',
              isSelected ? 'text-lime-500' : 'text-muted-foreground'
            )}>
              {getMuscleGroupName(group)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
