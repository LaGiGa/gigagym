// Hook para gerenciamento de treinos

import { useCallback } from 'react';
import { useApp } from '@/store/AppContext';
import type { Workout, Exercise, DayOfWeek, MuscleGroup } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export function useWorkout() {
  const { state, setWorkoutForDay, completeWorkout, updateExerciseCompletion, resetWeeklyProgress } = useApp();

  /**
   * Cria um novo treino
   */
  const createWorkout = useCallback((
    name: string,
    muscleGroup: MuscleGroup,
    exercises: Omit<Exercise, 'id'>[],
    notes?: string
  ): Workout => {
    const workout: Workout = {
      id: uuidv4(),
      name,
      muscleGroup,
      notes,
      exercises: exercises.map(ex => ({
        ...ex,
        id: uuidv4(),
        completed: false
      })),
      status: 'nao_iniciado'
    };
    
    return workout;
  }, []);

  /**
   * Adiciona um treino a um dia da semana
   */
  const assignWorkoutToDay = useCallback((day: DayOfWeek, workout: Workout) => {
    setWorkoutForDay(day, { ...workout, dayOfWeek: day });
  }, [setWorkoutForDay]);

  /**
   * Remove um treino de um dia
   */
  const removeWorkoutFromDay = useCallback((day: DayOfWeek) => {
    setWorkoutForDay(day, null);
  }, [setWorkoutForDay]);

  /**
   * Duplica um treino para outro dia
   */
  const duplicateWorkout = useCallback((fromDay: DayOfWeek, toDay: DayOfWeek) => {
    const workout = state.weeklyWorkouts[fromDay];
    if (workout) {
      const duplicatedWorkout: Workout = {
        ...workout,
        id: uuidv4(),
        dayOfWeek: toDay,
        status: 'nao_iniciado',
        exercises: workout.exercises.map(ex => ({
          ...ex,
          id: uuidv4(),
          completed: false
        })),
        completedAt: undefined
      };
      setWorkoutForDay(toDay, duplicatedWorkout);
      return true;
    }
    return false;
  }, [state.weeklyWorkouts, setWorkoutForDay]);

  /**
   * Atualiza um treino existente
   */
  const updateWorkout = useCallback((day: DayOfWeek, updates: Partial<Workout>) => {
    const workout = state.weeklyWorkouts[day];
    if (workout) {
      setWorkoutForDay(day, { ...workout, ...updates });
    }
  }, [state.weeklyWorkouts, setWorkoutForDay]);

  /**
   * Adiciona um exercício a um treino
   */
  const addExerciseToWorkout = useCallback((day: DayOfWeek, exercise: Omit<Exercise, 'id'>) => {
    const workout = state.weeklyWorkouts[day];
    if (workout) {
      const newExercise: Exercise = {
        ...exercise,
        id: uuidv4(),
        completed: false
      };
      setWorkoutForDay(day, {
        ...workout,
        exercises: [...workout.exercises, newExercise]
      });
    }
  }, [state.weeklyWorkouts, setWorkoutForDay]);

  /**
   * Remove um exercício de um treino
   */
  const removeExerciseFromWorkout = useCallback((day: DayOfWeek, exerciseId: string) => {
    const workout = state.weeklyWorkouts[day];
    if (workout) {
      setWorkoutForDay(day, {
        ...workout,
        exercises: workout.exercises.filter(ex => ex.id !== exerciseId)
      });
    }
  }, [state.weeklyWorkouts, setWorkoutForDay]);

  /**
   * Atualiza um exercício
   */
  const updateExercise = useCallback((day: DayOfWeek, exerciseId: string, updates: Partial<Exercise>) => {
    const workout = state.weeklyWorkouts[day];
    if (workout) {
      setWorkoutForDay(day, {
        ...workout,
        exercises: workout.exercises.map(ex =>
          ex.id === exerciseId ? { ...ex, ...updates } : ex
        )
      });
    }
  }, [state.weeklyWorkouts, setWorkoutForDay]);

  /**
   * Reordena exercícios de um treino
   */
  const reorderExercises = useCallback((day: DayOfWeek, exerciseIds: string[]) => {
    const workout = state.weeklyWorkouts[day];
    if (workout) {
      const exerciseMap = new Map(workout.exercises.map(ex => [ex.id, ex]));
      const reorderedExercises = exerciseIds
        .map(id => exerciseMap.get(id))
        .filter((ex): ex is Exercise => ex !== undefined);
      
      setWorkoutForDay(day, {
        ...workout,
        exercises: reorderedExercises
      });
    }
  }, [state.weeklyWorkouts, setWorkoutForDay]);

  /**
   * Marca um exercício como concluído ou não
   */
  const toggleExerciseCompletion = useCallback((day: DayOfWeek, exerciseId: string) => {
    const workout = state.weeklyWorkouts[day];
    if (workout) {
      const exercise = workout.exercises.find(ex => ex.id === exerciseId);
      if (exercise) {
        updateExerciseCompletion(day, exerciseId, !exercise.completed);
      }
    }
  }, [state.weeklyWorkouts, updateExerciseCompletion]);

  /**
   * Marca um treino como concluído
   */
  const markWorkoutAsComplete = useCallback((day: DayOfWeek) => {
    const workout = state.weeklyWorkouts[day];
    if (workout) {
      completeWorkout(day, workout);
    }
  }, [state.weeklyWorkouts, completeWorkout]);

  /**
   * Inicia um treino (muda status para em_andamento)
   */
  const startWorkout = useCallback((day: DayOfWeek) => {
    const workout = state.weeklyWorkouts[day];
    if (workout && workout.status === 'nao_iniciado') {
      setWorkoutForDay(day, { ...workout, status: 'em_andamento' });
    }
  }, [state.weeklyWorkouts, setWorkoutForDay]);

  /**
   * Obtém estatísticas da semana
   */
  const getWeeklyStats = useCallback(() => {
    const workouts = Object.values(state.weeklyWorkouts).filter(Boolean) as Workout[];
    const totalWorkouts = workouts.length;
    const completedWorkouts = workouts.filter(w => w.status === 'concluido').length;
    const inProgressWorkouts = workouts.filter(w => w.status === 'em_andamento').length;
    const totalExercises = workouts.reduce((sum, w) => sum + w.exercises.length, 0);
    const completedExercises = workouts.reduce(
      (sum, w) => sum + w.exercises.filter(ex => ex.completed).length,
      0
    );

    return {
      totalWorkouts,
      completedWorkouts,
      inProgressWorkouts,
      totalExercises,
      completedExercises,
      completionRate: totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0
    };
  }, [state.weeklyWorkouts]);

  /**
   * Verifica se um dia tem treino
   */
  const hasWorkout = useCallback((day: DayOfWeek): boolean => {
    return state.weeklyWorkouts[day] !== null;
  }, [state.weeklyWorkouts]);

  /**
   * Obtém o treino de um dia
   */
  const getWorkoutForDay = useCallback((day: DayOfWeek): Workout | null => {
    return state.weeklyWorkouts[day];
  }, [state.weeklyWorkouts]);

  return {
    weeklyWorkouts: state.weeklyWorkouts,
    workoutHistory: state.workoutHistory,
    createWorkout,
    assignWorkoutToDay,
    removeWorkoutFromDay,
    duplicateWorkout,
    updateWorkout,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    updateExercise,
    reorderExercises,
    toggleExerciseCompletion,
    markWorkoutAsComplete,
    startWorkout,
    resetWeeklyProgress,
    getWeeklyStats,
    hasWorkout,
    getWorkoutForDay
  };
}
