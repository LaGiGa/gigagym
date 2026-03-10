// Tipos principais do GiGaGym PWA

export type DayOfWeek = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';

export type TrainingGoal = 'emagrecimento' | 'hipertrofia' | 'manutencao' | 'condicionamento';

export type WorkoutStatus = 'nao_iniciado' | 'em_andamento' | 'concluido';

export type MuscleGroup =
  | 'peito'
  | 'costas'
  | 'ombros'
  | 'biceps'
  | 'triceps'
  | 'pernas'
  | 'gluteos'
  | 'panturrilha'
  | 'abdomen'
  | 'cardio'
  | 'full_body'
  | 'outro';

export interface ExerciseSet {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: number;
  reps: string;
  weight?: string;
  restTime?: number; // em segundos
  notes?: string;
  isCustom?: boolean;
  completed?: boolean;
  // Novas propriedades Pro
  videoUrl?: string;
  thumbnailUrl?: string;
  instructions?: string[];
  sets_log?: ExerciseSet[];
}

export interface Workout {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  notes?: string;
  exercises: Exercise[];
  dayOfWeek?: DayOfWeek;
  status?: WorkoutStatus;
  completedAt?: string;
  duration?: number; // em minutos
}

export interface WeeklyWorkout {
  day: DayOfWeek;
  workout: Workout | null;
  completed: boolean;
}

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  notes?: string;
}

// Especialistas
export type SpecialistType = 'nutrologa' | 'nutricionista' | 'personal';

export interface SpecialistSuggestion {
  id: string;
  specialistType: SpecialistType;
  title: string;
  content: string;
  date: string;
}

export interface SmartPlan {
  id: string;
  goal: TrainingGoal;
  startDate: string;
  endDate: string;
  suggestions: SpecialistSuggestion[];
  diet?: string;
  supplementation?: string;
}

export type UserGender = 'masculino' | 'feminino';
export type UserExperience = 'iniciante' | 'intermediario' | 'avancado';

export interface UserProfile {
  name: string;
  goal: TrainingGoal;
  gender: UserGender;
  age: number;
  height: number; // em cm
  initialWeight: number;
  targetWeight?: number;
  experienceLevel: UserExperience;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  soundEffects: boolean;
  language: 'pt-BR';
}

export interface BodyMetrics {
  currentWeight: number;
  height: number;
  imc: number;
  bodyFatPercentage?: number;
  lastUpdated: string;
}

export interface WorkoutProgress {
  weekStart: string;
  weekEnd: string;
  totalWorkouts: number;
  completedWorkouts: number;
  totalExercises: number;
  completedExercises: number;
  totalDuration: number;
}

export interface AppState {
  profile: UserProfile;
  settings: AppSettings;
  weeklyWorkouts: Record<DayOfWeek, Workout | null>;
  workoutHistory: Workout[];
  weightHistory: WeightEntry[];
  bodyMetrics: BodyMetrics;
  customExercises: Exercise[];
  // Novo estado Smart
  currentPlan: SmartPlan | null;
}

// Tipos para cálculos
export interface IMCCResult {
  value: number;
  classification: string;
  color: string;
}

export interface BodyFatResult {
  value: number;
  classification: string;
  color: string;
}

export interface BodyMeasurements {
  gender: UserGender;
  age: number;
  height: number;
  weight: number;
  neck: number;
  waist: number;
  hip?: number; // obrigatório para mulheres
}
