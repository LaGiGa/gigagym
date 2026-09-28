// Página de Checklist do Treino

import { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  ChevronLeft,
  Trophy,
  CheckCircle2,
  Eye
} from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { ExerciseItem } from '@/components/custom/ExerciseItem';
import { ProgressRing } from '@/components/custom/ProgressRing';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWorkout } from '@/hooks/useWorkout';
import type { DayOfWeek } from '@/types';
import { getDayName, getMuscleGroupEmoji } from '@/utils/calculations';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WorkoutChecklistProps {
  day?: DayOfWeek;
  onBack?: () => void;
}

export function WorkoutChecklist({ day = 'segunda', onBack }: WorkoutChecklistProps) {
  const {
    getWorkoutForDay,
    toggleExerciseCompletion,
    updateExerciseSet,
    markWorkoutAsComplete,
    startWorkout,
    resetWorkout
  } = useWorkout();

  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const workout = getWorkoutForDay(day);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  if (!workout) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Treino não encontrado</p>
          <Button onClick={onBack} className="mt-4">
            Voltar aos Treinos
          </Button>
        </div>
      </PageContainer>
    );
  }

  const isStarted = workout.status === 'em_andamento';
  const isCompleted = workout.status === 'concluido';
  const completedExercises = workout.exercises.filter(ex => ex.completed).length;
  const totalExercises = workout.exercises.length;
  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
  const allCompleted = completedExercises === totalExercises && totalExercises > 0;

  const handleToggleExercise = (exerciseId: string) => {
    toggleExerciseCompletion(day, exerciseId);
  };

  const handleStartWorkout = () => {
    startWorkout(day);
    setIsTimerRunning(true);
    toast.success('Treino iniciado! Cronômetro rodando.');
  };

  const handleToggleTimer = () => {
    setIsTimerRunning(prev => !prev);
  };

  const handleCompleteWorkout = () => {
    markWorkoutAsComplete(day);
    setIsTimerRunning(false);
    toast.success('Parabéns! Treino finalizado com sucesso.');
  };

  const handleResetWorkout = () => {
    if (confirm('Deseja reiniciar este treino? As séries marcadas e o tempo serão zerados.')) {
      resetWorkout(day);
      setIsTimerRunning(false);
      setElapsedTime(0);
      toast.info('Treino reiniciado.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <PageContainer hasBottomNav={false}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl hover:bg-accent transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold">{workout.name}</h2>
            <p className="text-xs text-muted-foreground">{getDayName(day)}</p>
          </div>
        </div>

        {workout.status === 'nao_iniciado' && (
          <span className="flex items-center gap-1 text-[11px] font-semibold bg-muted/70 text-muted-foreground px-2.5 py-1 rounded-full border border-border/60">
            <Eye className="w-3.5 h-3.5 text-primary" />
            Visualização
          </span>
        )}
      </div>

      {/* Status Card */}
      <Card className={cn(
        'p-4 mb-4 border transition-all duration-300',
        isCompleted && 'bg-primary/10 border-primary/30',
        isStarted && 'bg-amber-500/10 border-amber-500/30',
        workout.status === 'nao_iniciado' && 'bg-card/70 border-border/70'
      )}>
        <div className="flex items-center gap-4">
          <ProgressRing progress={progress} size={76} strokeWidth={6}>
            <span className="text-lg font-bold">{Math.round(progress)}%</span>
          </ProgressRing>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getMuscleGroupEmoji(workout.muscleGroup)}</span>
              <div>
                <p className="font-semibold text-sm">{completedExercises}/{totalExercises} exercícios feitos</p>
                <p className="text-xs text-muted-foreground">
                  {workout.status === 'nao_iniciado' && 'Treino pronto para iniciar'}
                  {workout.status === 'em_andamento' && 'Treino em andamento'}
                  {workout.status === 'concluido' && 'Treino concluído!'}
                </p>
              </div>
            </div>

            {/* Cronômetro */}
            <div className="flex items-center gap-3 mt-2">
              <div className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold',
                isStarted && isTimerRunning && 'bg-amber-500/20 text-amber-500',
                isStarted && !isTimerRunning && 'bg-muted text-muted-foreground',
                !isStarted && 'bg-muted/50 text-muted-foreground'
              )}>
                <Timer className="w-3.5 h-3.5" />
                <span>{formatTime(elapsedTime)}</span>
                {isStarted && (
                  <span className="text-[10px] ml-1 opacity-80">
                    {isTimerRunning ? '(Rodando)' : '(Pausado)'}
                  </span>
                )}
              </div>

              {isStarted && (
                <button
                  type="button"
                  onClick={handleToggleTimer}
                  className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5" /> Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-primary" /> Retomar
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Ação Primária: Iniciar Treino quando não iniciado */}
      {workout.status === 'nao_iniciado' && (
        <Card className="p-3 mb-4 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border-primary/30 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground">Pronto para começar?</p>
            <p className="text-[11px] text-muted-foreground">O cronômetro começará a contar assim que você clicar.</p>
          </div>
          <Button
            onClick={handleStartWorkout}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shrink-0 shadow-md shadow-primary/20 gap-1.5"
          >
            <Play className="w-4 h-4 fill-current" />
            Iniciar Treino
          </Button>
        </Card>
      )}

      {/* Ação de Conclusão quando em andamento */}
      {workout.status === 'em_andamento' && (
        <div className="mb-4 flex gap-2">
          <Button
            onClick={handleCompleteWorkout}
            className={cn(
              "flex-1 h-12 font-bold transition-all shadow-md",
              allCompleted
                ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
                : "bg-muted-foreground/20 hover:bg-primary hover:text-primary-foreground text-foreground"
            )}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {allCompleted ? 'Finalizar Treino Completo ✨' : 'Concluir Treino de Hoje'}
          </Button>
        </div>
      )}

      {/* Feedback de Treino Concluído */}
      {workout.status === 'concluido' && (
        <Card className="p-4 mb-4 bg-primary/10 border-primary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">Treino Concluído com Sucesso!</p>
              <p className="text-xs text-muted-foreground">
                Tempo total registrado: {formatTime(elapsedTime || 2400)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de exercícios */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Exercícios do Treino</h3>
          <span className="text-xs text-muted-foreground">{totalExercises} totais</span>
        </div>

        <div className="space-y-2">
          {workout.exercises.map((exercise) => (
            <ExerciseItem
              key={exercise.id}
              exercise={exercise}
              isChecklist
              onUpdateSet={(setId, weight, reps, completed) =>
                updateExerciseSet(day, exercise.id, setId, weight, reps, completed)
              }
              onToggleComplete={() => handleToggleExercise(exercise.id)}
            />
          ))}
        </div>
      </div>

      {/* Botão de Reset/Reiniciar */}
      {workout.status !== 'nao_iniciado' && (
        <Button
          variant="outline"
          onClick={handleResetWorkout}
          className="w-full border-border/70 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 text-xs text-muted-foreground mb-4"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-2" />
          Reiniciar Treino (Zerar progresso deste dia)
        </Button>
      )}

      {/* Espaço extra no final para scroll */}
      <div className="h-10" />
    </PageContainer>
  );
}
