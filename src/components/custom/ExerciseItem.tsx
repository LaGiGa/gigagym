// Item de exercício para checklist

import { Check, GripVertical, MoreHorizontal, Clock, Weight, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Exercise } from '@/types';
import { formatRestTime } from '@/utils/calculations';

interface ExerciseItemProps {
  exercise: Exercise;
  index: number;
  isChecklist?: boolean;
  onToggleComplete?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  draggable?: boolean;
  className?: string;
}

export function ExerciseItem({
  exercise,
  index,
  isChecklist = false,
  onToggleComplete,
  onEdit,
  draggable = false,
  className
}: ExerciseItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border/70 bg-card/95 p-3 transition-all duration-200',
        exercise.completed && 'border-primary/35 bg-primary/10',
        isChecklist && onToggleComplete && 'cursor-pointer active:scale-[0.98]',
        className
      )}
    >
      {/* Drag handle */}
      {draggable && (
        <div className="text-muted-foreground cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      {/* Checkbox */}
      {isChecklist && onToggleComplete && (
        <button
          onClick={onToggleComplete}
          className={cn(
            'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-200',
            exercise.completed
              ? 'border-primary bg-primary'
              : 'border-muted-foreground/30 hover:border-primary'
          )}
          aria-label={exercise.completed ? 'Desmarcar exercicio' : 'Marcar exercicio'}
        >
          {exercise.completed && <Check className="w-4 h-4 text-white" />}
        </button>
      )}

      {/* Exercise number */}
      {!isChecklist && (
        <div className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center text-sm font-medium flex-shrink-0',
          exercise.completed
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}>
          {index + 1}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-medium truncate',
          exercise.completed && 'line-through text-muted-foreground'
        )}>
          {exercise.name}
        </p>
        
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Repeat className="w-3 h-3" />
            {exercise.sets}x{exercise.reps}
          </span>
          
          {exercise.weight && (
            <span className="flex items-center gap-1">
              <Weight className="w-3 h-3" />
              {exercise.weight}
            </span>
          )}
          
          {exercise.restTime && exercise.restTime > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatRestTime(exercise.restTime)}
            </span>
          )}
        </div>
        
        {exercise.notes && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {exercise.notes}
          </p>
        )}
      </div>

      {/* Actions */}
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
