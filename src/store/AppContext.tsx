import { createContext, useCallback, useContext, useEffect, useReducer, useState, type ReactNode } from 'react';
import type {
  AppSettings,
  AppState,
  BodyMetrics,
  DayOfWeek,
  Exercise,
  UserProfile,
  WeightEntry,
  Workout,
} from '@/types';
import {
  getBodyMetrics,
  getCustomExercises,
  getProfile,
  getSettings,
  getWeeklyWorkouts,
  getWeightHistory,
  getWorkoutHistory,
  clearAllStoragePersistent,
  saveBodyMetrics,
  saveCustomExercises,
  saveProfile,
  saveSettings,
  saveWeeklyWorkouts,
  saveWeightHistory,
  saveWorkoutHistory,
  saveAppStatePersistent,
  getAppStatePersistent,
} from '@/utils/storage';

const defaultProfile: UserProfile = {
  name: '',
  goal: 'hipertrofia',
  gender: 'masculino',
  age: 0,
  height: 0,
  initialWeight: 0,
  targetWeight: undefined,
};

const defaultSettings: AppSettings = {
  theme: 'system',
  notifications: true,
  soundEffects: false,
  language: 'pt-BR',
};

const defaultBodyMetrics: BodyMetrics = {
  currentWeight: 0,
  height: 0,
  imc: 0,
  lastUpdated: new Date().toISOString(),
};

const initialState: AppState = {
  profile: defaultProfile,
  settings: defaultSettings,
  weeklyWorkouts: {
    segunda: null,
    terca: null,
    quarta: null,
    quinta: null,
    sexta: null,
    sabado: null,
    domingo: null,
  },
  workoutHistory: [],
  weightHistory: [],
  bodyMetrics: defaultBodyMetrics,
  customExercises: [],
};

type Action =
  | { type: 'SET_PROFILE'; payload: UserProfile }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_WEEKLY_WORKOUTS'; payload: Record<DayOfWeek, Workout | null> }
  | { type: 'SET_WORKOUT_FOR_DAY'; payload: { day: DayOfWeek; workout: Workout | null } }
  | { type: 'ADD_WORKOUT_TO_HISTORY'; payload: Workout }
  | { type: 'SET_WORKOUT_HISTORY'; payload: Workout[] }
  | { type: 'ADD_WEIGHT_ENTRY'; payload: WeightEntry }
  | { type: 'SET_WEIGHT_HISTORY'; payload: WeightEntry[] }
  | { type: 'SET_BODY_METRICS'; payload: BodyMetrics }
  | { type: 'ADD_CUSTOM_EXERCISE'; payload: Exercise }
  | { type: 'SET_CUSTOM_EXERCISES'; payload: Exercise[] }
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'RESET_ALL' }
  | { type: 'COMPLETE_WORKOUT'; payload: { day: DayOfWeek; workout: Workout } }
  | { type: 'UPDATE_EXERCISE_COMPLETION'; payload: { day: DayOfWeek; exerciseId: string; completed: boolean } }
  | { type: 'RESET_WEEKLY_PROGRESS' };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };

    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };

    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case 'SET_WEEKLY_WORKOUTS':
      return { ...state, weeklyWorkouts: action.payload };

    case 'SET_WORKOUT_FOR_DAY':
      return {
        ...state,
        weeklyWorkouts: {
          ...state.weeklyWorkouts,
          [action.payload.day]: action.payload.workout,
        },
      };

    case 'ADD_WORKOUT_TO_HISTORY':
      return {
        ...state,
        workoutHistory: [action.payload, ...state.workoutHistory],
      };

    case 'SET_WORKOUT_HISTORY':
      return { ...state, workoutHistory: action.payload };

    case 'ADD_WEIGHT_ENTRY':
      return {
        ...state,
        weightHistory: [action.payload, ...state.weightHistory],
        bodyMetrics: {
          ...state.bodyMetrics,
          currentWeight: action.payload.weight,
          lastUpdated: action.payload.date,
        },
      };

    case 'SET_WEIGHT_HISTORY':
      return { ...state, weightHistory: action.payload };

    case 'SET_BODY_METRICS':
      return { ...state, bodyMetrics: action.payload };

    case 'ADD_CUSTOM_EXERCISE':
      return {
        ...state,
        customExercises: [...state.customExercises, action.payload],
      };

    case 'SET_CUSTOM_EXERCISES':
      return { ...state, customExercises: action.payload };

    case 'LOAD_STATE':
      return action.payload;

    case 'RESET_ALL':
      return initialState;

    case 'COMPLETE_WORKOUT': {
      const completedWorkout = {
        ...action.payload.workout,
        status: 'concluido' as const,
        completedAt: new Date().toISOString(),
      };

      return {
        ...state,
        weeklyWorkouts: {
          ...state.weeklyWorkouts,
          [action.payload.day]: completedWorkout,
        },
        workoutHistory: [completedWorkout, ...state.workoutHistory],
      };
    }

    case 'UPDATE_EXERCISE_COMPLETION': {
      const workout = state.weeklyWorkouts[action.payload.day];
      if (!workout) return state;

      const updatedExercises = workout.exercises.map((ex) =>
        ex.id === action.payload.exerciseId ? { ...ex, completed: action.payload.completed } : ex
      );

      const allCompleted = updatedExercises.every((ex) => ex.completed);

      const updatedWorkout: Workout = {
        ...workout,
        exercises: updatedExercises,
        status: allCompleted ? 'concluido' : 'em_andamento',
      };

      return {
        ...state,
        weeklyWorkouts: {
          ...state.weeklyWorkouts,
          [action.payload.day]: updatedWorkout,
        },
      };
    }

    case 'RESET_WEEKLY_PROGRESS': {
      const resetWorkouts: Record<DayOfWeek, Workout | null> = { ...state.weeklyWorkouts };

      (Object.keys(resetWorkouts) as DayOfWeek[]).forEach((day) => {
        const workout = resetWorkouts[day];
        if (workout) {
          resetWorkouts[day] = {
            ...workout,
            status: 'nao_iniciado',
            exercises: workout.exercises.map((ex) => ({ ...ex, completed: false })),
            completedAt: undefined,
          };
        }
      });

      return {
        ...state,
        weeklyWorkouts: resetWorkouts,
      };
    }

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  isHydrated: boolean;
  dispatch: React.Dispatch<Action>;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  setSettings: (settings: AppSettings) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setWorkoutForDay: (day: DayOfWeek, workout: Workout | null) => void;
  addWeightEntry: (entry: WeightEntry) => void;
  addCustomExercise: (exercise: Exercise) => void;
  completeWorkout: (day: DayOfWeek, workout: Workout) => void;
  updateExerciseCompletion: (day: DayOfWeek, exerciseId: string, completed: boolean) => void;
  resetWeeklyProgress: () => void;
  resetAllData: () => void;
  loadSavedData: () => void;
  forceLocalBackup: () => Promise<boolean>;
  lastLocalSaveAt: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastLocalSaveAt, setLastLocalSaveAt] = useState<string | null>(null);

  const normalizeLoadedState = useCallback((loaded: Partial<AppState>): AppState => {
    return {
      ...initialState,
      ...loaded,
      profile: { ...initialState.profile, ...(loaded.profile || {}) },
      settings: { ...initialState.settings, ...(loaded.settings || {}) },
      weeklyWorkouts: { ...initialState.weeklyWorkouts, ...(loaded.weeklyWorkouts || {}) },
      workoutHistory: loaded.workoutHistory || [],
      weightHistory: loaded.weightHistory || [],
      bodyMetrics: { ...initialState.bodyMetrics, ...(loaded.bodyMetrics || {}) },
      customExercises: loaded.customExercises || [],
    };
  }, []);

  const loadSavedData = useCallback(async () => {
    const fullState = await getAppStatePersistent();
    if (fullState) {
      dispatch({ type: 'LOAD_STATE', payload: normalizeLoadedState(fullState) });
      setIsHydrated(true);
      return;
    }

    const profile = getProfile();
    const settings = getSettings();
    const weeklyWorkouts = getWeeklyWorkouts();
    const workoutHistory = getWorkoutHistory();
    const weightHistory = getWeightHistory();
    const bodyMetrics = getBodyMetrics();
    const customExercises = getCustomExercises();

    const loadedState: AppState = {
      profile: profile || defaultProfile,
      settings: settings || defaultSettings,
      weeklyWorkouts: weeklyWorkouts || initialState.weeklyWorkouts,
      workoutHistory: workoutHistory || [],
      weightHistory: weightHistory || [],
      bodyMetrics: bodyMetrics || defaultBodyMetrics,
      customExercises: customExercises || [],
    };

    dispatch({ type: 'LOAD_STATE', payload: normalizeLoadedState(loadedState) });
    setIsHydrated(true);
  }, [normalizeLoadedState]);

  useEffect(() => {
    void loadSavedData();
  }, [loadSavedData]);

  useEffect(() => {
    if (!isHydrated) return;

    saveProfile(state.profile);
    saveSettings(state.settings);
    saveWeeklyWorkouts(state.weeklyWorkouts);
    saveWorkoutHistory(state.workoutHistory);
    saveWeightHistory(state.weightHistory);
    saveBodyMetrics(state.bodyMetrics);
    saveCustomExercises(state.customExercises);

    void saveAppStatePersistent(state).then(() => {
      setLastLocalSaveAt(new Date().toISOString());
    });
  }, [state, isHydrated]);

  const forceLocalBackup = useCallback(async () => {
    try {
      saveProfile(state.profile);
      saveSettings(state.settings);
      saveWeeklyWorkouts(state.weeklyWorkouts);
      saveWorkoutHistory(state.workoutHistory);
      saveWeightHistory(state.weightHistory);
      saveBodyMetrics(state.bodyMetrics);
      saveCustomExercises(state.customExercises);
      await saveAppStatePersistent(state);
      setLastLocalSaveAt(new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Erro ao forcar backup local:', error);
      return false;
    }
  }, [state]);

  const setProfile = (profile: UserProfile) => {
    dispatch({ type: 'SET_PROFILE', payload: profile });
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: profile });
  };

  const setSettings = (settings: AppSettings) => {
    dispatch({ type: 'SET_SETTINGS', payload: settings });
  };

  const updateSettings = (settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const setWorkoutForDay = (day: DayOfWeek, workout: Workout | null) => {
    dispatch({ type: 'SET_WORKOUT_FOR_DAY', payload: { day, workout } });
  };

  const addWeightEntry = (entry: WeightEntry) => {
    dispatch({ type: 'ADD_WEIGHT_ENTRY', payload: entry });
  };

  const addCustomExercise = (exercise: Exercise) => {
    dispatch({ type: 'ADD_CUSTOM_EXERCISE', payload: exercise });
  };

  const completeWorkout = (day: DayOfWeek, workout: Workout) => {
    dispatch({ type: 'COMPLETE_WORKOUT', payload: { day, workout } });
  };

  const updateExerciseCompletion = (day: DayOfWeek, exerciseId: string, completed: boolean) => {
    dispatch({ type: 'UPDATE_EXERCISE_COMPLETION', payload: { day, exerciseId, completed } });
  };

  const resetWeeklyProgress = () => {
    dispatch({ type: 'RESET_WEEKLY_PROGRESS' });
  };

  const resetAllData = () => {
    void clearAllStoragePersistent();
    dispatch({ type: 'RESET_ALL' });
  };

  const value: AppContextType = {
    state,
    isHydrated,
    dispatch,
    setProfile,
    updateProfile,
    setSettings,
    updateSettings,
    setWorkoutForDay,
    addWeightEntry,
    addCustomExercise,
    completeWorkout,
    updateExerciseCompletion,
    resetWeeklyProgress,
    resetAllData,
    loadSavedData: () => {
      void loadSavedData();
    },
    forceLocalBackup,
    lastLocalSaveAt,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
}
