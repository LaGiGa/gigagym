import {
  Check,
  GripVertical,
  MoreHorizontal,
  Clock,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Exercise } from '@/types';
import { formatRestTime } from '@/utils/calculations';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ExerciseExecutionModal } from './ExerciseExecutionModal';

interface ExerciseItemProps {
  exercise: Exercise;
  isChecklist?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onUpdateSet?: (setId: string, weight: number, reps: number, completed: boolean) => void;
  onToggleComplete?: () => void;
  draggable?: boolean;
  className?: string;
}

export function ExerciseItem({
  exercise,
  isChecklist = false,
  onEdit,
  onUpdateSet,
  onToggleComplete,
  draggable = false,
  className
}: ExerciseItemProps) {

  const [expanded, setExpanded] = useState(false);
  const [showExecution, setShowExecution] = useState(false);

  const handleSetChange = (setId: string, field: 'weight' | 'reps', value: string) => {
    const set = (exercise.sets_log || []).find(s => s.id === setId);
    if (!set || !onUpdateSet) return;

    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (isNaN(numValue)) return;

    onUpdateSet(
      setId,
      field === 'weight' ? numValue : set.weight,
      field === 'reps' ? numValue : set.reps,
      set.completed
    );
  };

  const toggleSetComplete = (setId: string) => {
    const set = (exercise.sets_log || []).find(s => s.id === setId);
    if (!set || !onUpdateSet) return;
    onUpdateSet(setId, set.weight, set.reps, !set.completed);
  };

  const setsLog = exercise.sets_log || [];
  const allSetsDone = setsLog.length > 0 && setsLog.every(s => s.completed);

  return (
    <div
      className={cn(
        'group flex flex-col gap-1 rounded-2xl border border-border/60 bg-card/40 transition-all duration-300 overflow-hidden',
        exercise.completed && 'border-lime-500/40 bg-lime-500/5',
        expanded && 'border-primary/40 bg-card/60 shadow-lg',
        className
      )}
    >
      <div className="flex items-center gap-3 p-4">
        {draggable && (
          <div className="text-muted-foreground/40 cursor-grab active:cursor-grabbing hover:text-primary transition-colors">
            <GripVertical className="w-4 h-4" />
          </div>
        )}

        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => isChecklist && setExpanded(!expanded)}>
          <div className="flex items-center justify-between gap-2">
            <h4 className={cn(
              'font-bold text-sm sm:text-base transition-all truncate flex items-center gap-2',
              exercise.completed && 'text-muted-foreground/60'
            )}>
              {exercise.completed && <CheckCircle2 className="w-4 h-4 text-lime-500" />}
              {exercise.name}
            </h4>
            {isChecklist && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowExecution(true); }}
                className="text-primary/70 hover:text-primary transition-all p-1"
                title="Ver execução"
              >
                <PlayCircle className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1.5 ">
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-muted-foreground/80 bg-muted/50 px-2 py-0.5 rounded-full">
              {exercise.sets} <span className="opacity-60 text-[8px]">sets</span>
            </span>

            <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-muted-foreground/80 bg-muted/50 px-2 py-0.5 rounded-full">
              {exercise.reps} <span className="opacity-60 text-[8px]">reps</span>
            </span>

            {exercise.restTime && exercise.restTime > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-muted-foreground/80 bg-muted/50 px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3 text-primary" />
                {formatRestTime(exercise.restTime)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onEdit && !isChecklist && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}

          {isChecklist && (
            <button
              onClick={() => setExpanded(!expanded)}
              className={cn(
                "p-2.5 rounded-xl transition-all",
                expanded ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {isChecklist && expanded && (
        <div className="bg-muted/10 p-3 sm:p-4 pt-0 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-[24px_1fr_1.8fr_42px] gap-2 mb-2 px-1 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest text-center">
            <span>#</span>
            <span>Peso</span>
            <span>Reps</span>
            <span>Ok</span>
          </div>

          <div className="space-y-2">
            {setsLog.length > 0 ? (
              setsLog.map((set, idx) => (
                <div
                  key={set.id}
                  className={cn(
                    "grid grid-cols-[24px_1fr_1.8fr_42px] items-center gap-2 p-1.5 rounded-xl border transition-all",
                    set.completed ? "bg-lime-500/10 border-lime-500/20" : "bg-card border-border/40"
                  )}
                >
                  <div className="text-[10px] font-bold text-muted-foreground/40 text-center">
                    {idx + 1}
                  </div>

                  <div className="relative">
                    <Input
                      type="number"
                      value={set.weight === 0 ? '' : set.weight}
                      onChange={(e) => handleSetChange(set.id, 'weight', e.target.value)}
                      className="h-9 px-1 text-center font-bold text-xs bg-muted/30 border-none rounded-lg focus-visible:ring-primary shadow-inner"
                      placeholder="0"
                    />
                    <span className="hidden sm:inline absolute right-1.5 top-1/2 -translate-y-1/2 text-[8px] text-muted-foreground pointer-events-none opacity-40">Kg</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={set.reps === 0 ? '' : set.reps}
                      onChange={(e) => handleSetChange(set.id, 'reps', e.target.value)}
                      className="h-9 px-1 text-center font-bold text-xs bg-muted/30 border-none rounded-lg focus-visible:ring-primary shadow-inner min-w-0 flex-1"
                      placeholder="0"
                    />
                    <div className="hidden [@media(min-width:380px)]:flex flex-wrap gap-1 max-w-[40px]">
                      {[10, 12, 15].map(v => (
                        <button
                          key={v}
                          onClick={() => handleSetChange(set.id, 'reps', v.toString())}
                          className="px-1 h-4 text-[8px] rounded-md bg-muted hover:bg-primary/20 transition-colors"
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleSetComplete(set.id)}
                    className={cn(
                      'h-9 w-9 flex items-center justify-center rounded-lg border transition-all shadow-sm active:scale-95',
                      set.completed
                        ? 'border-lime-500 bg-lime-500 text-white shadow-lime-500/20'
                        : 'border-muted-foreground/10 text-transparent hover:border-primary/30 bg-muted/10'
                    )}
                  >
                    <Check className={cn("w-5 h-5", set.completed ? "scale-100" : "scale-0")} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-muted-foreground">Este exercício ainda não possui controle de carga ativo.</p>
                <Button
                  onClick={() => onUpdateSet?.('initial', 0, 0, false)}
                  className="bg-primary/20 text-primary hover:bg-primary/30 h-10 rounded-xl"
                >
                  Ativar Controle de Séries
                </Button>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              onClick={(e) => { e.stopPropagation(); onToggleComplete?.(); }}
              className={cn(
                "flex-1 h-12 rounded-xl font-bold transition-all text-xs uppercase tracking-widest",
                exercise.completed ? "bg-muted text-muted-foreground" : "bg-lime-500 hover:bg-lime-600 shadow-xl shadow-lime-500/20"
              )}
            >
              {exercise.completed ? 'Reabrir Exercício' : allSetsDone ? 'Concluir Agora ✨' : 'Finalizar Exercício'}
            </Button>
            <Button variant="outline" className="h-12 w-12 rounded-xl p-0" onClick={() => setExpanded(false)}>
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {showExecution && (
        <ExerciseExecutionModal
          exercise={exercise}
          open={showExecution}
          onOpenChange={setShowExecution}
        />
      )}
    </div>
  );
}
