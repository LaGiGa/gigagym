import { CheckCircle2, ChevronRight, Circle, Clock, Dumbbell, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Workout } from '@/types';
import { getMuscleGroupEmoji, getMuscleGroupName } from '@/utils/calculations';

interface WorkoutCardProps {
  workout: Workout;
  dayName?: string;
  showDay?: boolean;
  onClick?: () => void;
  onStart?: () => void;
  className?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  nao_iniciado: {
    label: 'Nao iniciado',
    color: 'bg-muted text-muted-foreground',
    icon: Circle,
  },
  em_andamento: {
    label: 'Em andamento',
    color: 'bg-amber-500/10 text-amber-500',
    icon: Play,
  },
  concluido: {
    label: 'Concluido',
    color: 'bg-primary/15 text-primary',
    icon: CheckCircle2,
  },
};

export function WorkoutCard({
  workout,
  dayName,
  showDay = false,
  onClick,
  onStart,
  className,
}: WorkoutCardProps) {
  const status = workout.status || 'nao_iniciado';
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  const completedExercises = workout.exercises.filter((ex) => ex.completed).length;
  const totalExercises = workout.exercises.length;
  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
  const groupsInWorkout = Array.from(new Set(workout.exercises.map((ex) => ex.muscleGroup)));
  const hasMixedGroups = groupsInWorkout.length > 1;
  const displayGroup = hasMixedGroups ? 'Personalizado' : getMuscleGroupName(workout.muscleGroup);
  const displayEmoji = hasMixedGroups ? '✨' : getMuscleGroupEmoji(workout.muscleGroup);

  return (
    <Card
      onClick={onClick}
      className={cn(
        'overflow-hidden rounded-2xl border-border/70 bg-card/95 p-4 transition-all duration-200',
        onClick && 'cursor-pointer active:scale-[0.98] hover:border-primary/30 hover:shadow-md',
        status === 'concluido' && 'border-primary/40',
        status === 'em_andamento' && 'border-amber-500/30',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          {showDay && dayName && <p className="mb-1 text-xs font-medium text-muted-foreground">{dayName}</p>}

          <div className="flex items-center gap-2">
            <span className="text-lg">{displayEmoji}</span>
            <h3 className="truncate text-[17px] font-bold">{workout.name}</h3>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {displayGroup}
            </Badge>
            <Badge className={cn('gap-1 text-xs', statusInfo.color)}>
              <StatusIcon className="h-3 w-3" />
              {statusInfo.label}
            </Badge>
          </div>
        </div>

        <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
      </div>

      <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Dumbbell className="h-4 w-4" />
          <span>{totalExercises} exercicios</span>
        </div>

        {workout.duration && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{workout.duration}min</span>
          </div>
        )}
      </div>

      {status !== 'nao_iniciado' && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">
              {completedExercises}/{totalExercises}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full rounded-full transition-all duration-300', status === 'concluido' ? 'bg-primary' : 'bg-amber-500')}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {status === 'nao_iniciado' && onStart && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStart();
          }}
          className={cn(
            'mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4',
            'bg-gradient-energy font-semibold text-primary-foreground',
            'active:scale-[0.98] transition-transform'
          )}
        >
          <Play className="h-4 w-4" />
          Iniciar treino
        </button>
      )}
    </Card>
  );
}
