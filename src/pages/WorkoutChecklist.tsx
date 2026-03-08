// Página de Checklist do Treino

import { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  Timer,
  ChevronLeft,
  Trophy
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

interface WorkoutChecklistProps {
  day?: DayOfWeek;
  onBack?: () => void;
}

export function WorkoutChecklist({ day = 'segunda', onBack }: WorkoutChecklistProps) {
  const { 
    getWorkoutForDay, 
    toggleExerciseCompletion, 
    markWorkoutAsComplete,
    startWorkout
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
  
  useEffect(() => {
    if (workout?.status === 'em_andamento' && !isTimerRunning) {
      setIsTimerRunning(true);
    }
  }, [workout?.status, isTimerRunning]);
  
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
  };
  
  const handleCompleteWorkout = () => {
    markWorkoutAsComplete(day);
    setIsTimerRunning(false);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <PageContainer hasBottomNav={false}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl hover:bg-accent transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold">{workout.name}</h2>
          <p className="text-sm text-muted-foreground">{getDayName(day)}</p>
        </div>
      </div>

      {/* Status Card */}
      <Card className={cn(
        'p-4 mb-4',
        workout.status === 'concluido' && 'bg-lime-500/10 border-lime-500/30',
        workout.status === 'em_andamento' && 'bg-amber-500/10 border-amber-500/30'
      )}>
        <div className="flex items-center gap-4">
          <ProgressRing progress={progress} size={80} strokeWidth={6}>
            <span className="text-xl font-bold">{Math.round(progress)}%</span>
          </ProgressRing>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getMuscleGroupEmoji(workout.muscleGroup)}</span>
              <div>
                <p className="font-medium">{completedExercises}/{totalExercises} exercícios</p>
                <p className="text-sm text-muted-foreground">
                  {workout.status === 'nao_iniciado' && 'Não iniciado'}
                  {workout.status === 'em_andamento' && 'Em andamento'}
                  {workout.status === 'concluido' && 'Concluído!'}
                </p>
              </div>
            </div>
            
            {isTimerRunning && (
              <div className="flex items-center gap-2 mt-2 text-amber-500">
                <Timer className="w-4 h-4" />
                <span className="font-mono font-medium">{formatTime(elapsedTime)}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Ações */}
      {workout.status === 'nao_iniciado' && (
        <Button 
          onClick={handleStartWorkout}
          className="w-full mb-4 bg-lime-500 hover:bg-lime-600 h-12"
        >
          <Play className="w-5 h-5 mr-2" />
          Iniciar Treino
        </Button>
      )}
      
      {workout.status === 'em_andamento' && allCompleted && (
        <Button 
          onClick={handleCompleteWorkout}
          className="w-full mb-4 bg-lime-500 hover:bg-lime-600 h-12"
        >
          <Trophy className="w-5 h-5 mr-2" />
          Finalizar Treino
        </Button>
      )}
      
      {workout.status === 'concluido' && (
        <Card className="p-4 mb-4 bg-lime-500/10 border-lime-500/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-lime-500 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg">Treino Concluído!</p>
              <p className="text-sm text-muted-foreground">
                Duração: {formatTime(elapsedTime)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de exercícios */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-3">Exercícios</h3>
        <div className="space-y-2">
          {workout.exercises.map((exercise, index) => (
            <ExerciseItem
              key={exercise.id}
              exercise={exercise}
              index={index}
              isChecklist
              onToggleComplete={() => handleToggleExercise(exercise.id)}
            />
          ))}
        </div>
      </div>

      {/* Reset button */}
      {workout.status !== 'nao_iniciado' && (
        <Button
          variant="outline"
          onClick={() => {
            if (confirm('Tem certeza que deseja reiniciar este treino?')) {
              startWorkout(day);
              setElapsedTime(0);
            }
          }}
          className="w-full"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reiniciar Treino
        </Button>
      )}

      {/* Espaço extra no final */}
      <div className="h-8" />
    </PageContainer>
  );
}
