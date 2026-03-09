// Dados mockados para demonstraÃ§Ã£o

import type { Workout, Exercise, WeightEntry, UserProfile, AppSettings } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// ExercÃ­cios predefinidos
export const predefinedExercises: Omit<Exercise, 'id'>[] = [
  // Peito
  { name: 'Supino Reto', muscleGroup: 'peito', sets: 4, reps: '8-12', restTime: 90 },
  { name: 'Supino Inclinado', muscleGroup: 'peito', sets: 3, reps: '10-12', restTime: 90 },
  { name: 'Crucifixo', muscleGroup: 'peito', sets: 3, reps: '12-15', restTime: 60 },
  { name: 'FlexÃ£o', muscleGroup: 'peito', sets: 3, reps: '15-20', restTime: 60 },
  
  // Costas
  { name: 'Puxada Frontal', muscleGroup: 'costas', sets: 4, reps: '8-12', restTime: 90 },
  { name: 'Remada Curvada', muscleGroup: 'costas', sets: 4, reps: '8-12', restTime: 90 },
  { name: 'Remada Unilateral', muscleGroup: 'costas', sets: 3, reps: '10-12', restTime: 60 },
  { name: 'Levantamento Terra', muscleGroup: 'costas', sets: 3, reps: '6-10', restTime: 120 },
  
  // Ombros
  { name: 'Desenvolvimento com Halteres', muscleGroup: 'ombros', sets: 4, reps: '8-12', restTime: 90 },
  { name: 'ElevaÃ§Ã£o Lateral', muscleGroup: 'ombros', sets: 4, reps: '12-15', restTime: 60 },
  { name: 'ElevaÃ§Ã£o Frontal', muscleGroup: 'ombros', sets: 3, reps: '12-15', restTime: 60 },
  { name: 'Desenvolvimento Arnold', muscleGroup: 'ombros', sets: 3, reps: '10-12', restTime: 90 },
  
  // BÃ­ceps
  { name: 'Rosca Direta', muscleGroup: 'biceps', sets: 4, reps: '10-12', restTime: 60 },
  { name: 'Rosca Alternada', muscleGroup: 'biceps', sets: 3, reps: '10-12', restTime: 60 },
  { name: 'Rosca Martelo', muscleGroup: 'biceps', sets: 3, reps: '12-15', restTime: 60 },
  { name: 'Rosca Scott', muscleGroup: 'biceps', sets: 3, reps: '10-12', restTime: 60 },
  
  // TrÃ­ceps
  { name: 'TrÃ­ceps Testa', muscleGroup: 'triceps', sets: 4, reps: '10-12', restTime: 60 },
  { name: 'TrÃ­ceps Corda', muscleGroup: 'triceps', sets: 4, reps: '12-15', restTime: 60 },
  { name: 'Mergulho no Banco', muscleGroup: 'triceps', sets: 3, reps: '12-15', restTime: 60 },
  { name: 'ExtensÃ£o de TrÃ­ceps', muscleGroup: 'triceps', sets: 3, reps: '10-12', restTime: 60 },
  
  // Pernas
  { name: 'Agachamento', muscleGroup: 'pernas', sets: 4, reps: '8-12', restTime: 120 },
  { name: 'Leg Press', muscleGroup: 'pernas', sets: 4, reps: '10-15', restTime: 120 },
  { name: 'Cadeira Extensora', muscleGroup: 'pernas', sets: 3, reps: '12-15', restTime: 90 },
  { name: 'Mesa Flexora', muscleGroup: 'pernas', sets: 4, reps: '10-12', restTime: 90 },
  { name: 'Cadeira Abdutora', muscleGroup: 'pernas', sets: 3, reps: '15-20', restTime: 60 },
  { name: 'Cadeira Adutora', muscleGroup: 'pernas', sets: 3, reps: '15-20', restTime: 60 },
  
  // GlÃºteos
  { name: 'ElevaÃ§Ã£o PÃ©lvica', muscleGroup: 'gluteos', sets: 4, reps: '12-15', restTime: 90 },
  { name: 'Agachamento SumÃ´', muscleGroup: 'gluteos', sets: 3, reps: '12-15', restTime: 90 },
  { name: 'Afundo', muscleGroup: 'gluteos', sets: 3, reps: '10-12', restTime: 90 },
  
  // Panturrilha
  { name: 'ElevaÃ§Ã£o de Panturrilha em PÃ©', muscleGroup: 'panturrilha', sets: 4, reps: '15-20', restTime: 60 },
  { name: 'ElevaÃ§Ã£o de Panturrilha Sentado', muscleGroup: 'panturrilha', sets: 3, reps: '15-20', restTime: 60 },
  
  // AbdÃ´men
  { name: 'Crunch', muscleGroup: 'abdomen', sets: 4, reps: '20-25', restTime: 45 },
  { name: 'Prancha', muscleGroup: 'abdomen', sets: 3, reps: '30-60s', restTime: 60 },
  { name: 'ElevaÃ§Ã£o de Pernas', muscleGroup: 'abdomen', sets: 3, reps: '15-20', restTime: 45 },
  { name: 'Russian Twist', muscleGroup: 'abdomen', sets: 3, reps: '20-30', restTime: 45 },
  
  // Cardio
  { name: 'Corrida na Esteira', muscleGroup: 'cardio', sets: 1, reps: '20-30min', restTime: 0 },
  { name: 'Bicicleta ErgomÃ©trica', muscleGroup: 'cardio', sets: 1, reps: '20-30min', restTime: 0 },
  { name: 'ElÃ­ptico', muscleGroup: 'cardio', sets: 1, reps: '20-30min', restTime: 0 },
    { name: 'Burpees', muscleGroup: 'cardio', sets: 3, reps: '10-15', restTime: 60 },

  // Mais exercicios de Peito
  { name: 'Supino Declinado', muscleGroup: 'peito', sets: 3, reps: '8-12', restTime: 90 },
  { name: 'Crossover na Polia', muscleGroup: 'peito', sets: 3, reps: '12-15', restTime: 60 },
  { name: 'Paralela', muscleGroup: 'peito', sets: 3, reps: '8-12', restTime: 90 },
  { name: 'Peck Deck', muscleGroup: 'peito', sets: 3, reps: '10-15', restTime: 60 },

  // Mais exercicios de Costas
  { name: 'Puxada Neutra', muscleGroup: 'costas', sets: 4, reps: '8-12', restTime: 90 },
  { name: 'Remada Cavalinho', muscleGroup: 'costas', sets: 4, reps: '8-12', restTime: 90 },
  { name: 'Pulldown com Corda', muscleGroup: 'costas', sets: 3, reps: '12-15', restTime: 60 },
  { name: 'Barra Fixa', muscleGroup: 'costas', sets: 4, reps: '6-12', restTime: 120 },

  // Mais exercicios de Ombros
  { name: 'Face Pull', muscleGroup: 'ombros', sets: 3, reps: '12-15', restTime: 60 },
  { name: 'Remada Alta', muscleGroup: 'ombros', sets: 3, reps: '10-12', restTime: 60 },
  { name: 'Elevacao Lateral Unilateral', muscleGroup: 'ombros', sets: 3, reps: '12-15', restTime: 60 },
  { name: 'Crucifixo Invertido', muscleGroup: 'ombros', sets: 3, reps: '12-15', restTime: 60 },

  // Mais exercicios de Biceps
  { name: 'Rosca Concentrada', muscleGroup: 'biceps', sets: 3, reps: '10-12', restTime: 60 },
  { name: 'Rosca no Cabo', muscleGroup: 'biceps', sets: 3, reps: '12-15', restTime: 60 },
  { name: 'Rosca Inversa', muscleGroup: 'biceps', sets: 3, reps: '10-12', restTime: 60 },

  // Mais exercicios de Triceps
  { name: 'Triceps Frances', muscleGroup: 'triceps', sets: 3, reps: '10-12', restTime: 60 },
  { name: 'Triceps Coice', muscleGroup: 'triceps', sets: 3, reps: '12-15', restTime: 60 },
  { name: 'Supino Fechado', muscleGroup: 'triceps', sets: 3, reps: '8-12', restTime: 90 },

  // Mais exercicios de Pernas
  { name: 'Stiff', muscleGroup: 'pernas', sets: 4, reps: '8-12', restTime: 90 },
  { name: 'Passada', muscleGroup: 'pernas', sets: 3, reps: '10-12', restTime: 90 },
  { name: 'Agachamento Hack', muscleGroup: 'pernas', sets: 4, reps: '10-12', restTime: 120 },
  { name: 'Avanco no Smith', muscleGroup: 'pernas', sets: 3, reps: '10-12', restTime: 90 },

  // Mais exercicios de Gluteos
  { name: 'Coice na Polia', muscleGroup: 'gluteos', sets: 3, reps: '12-15', restTime: 60 },
  { name: 'Abducao no Cabo', muscleGroup: 'gluteos', sets: 3, reps: '12-15', restTime: 60 },
  { name: 'Glute Bridge', muscleGroup: 'gluteos', sets: 4, reps: '12-15', restTime: 90 },

  // Mais exercicios de Panturrilha
  { name: 'Panturrilha no Leg Press', muscleGroup: 'panturrilha', sets: 4, reps: '15-20', restTime: 60 },
  { name: 'Panturrilha Unilateral', muscleGroup: 'panturrilha', sets: 3, reps: '12-15', restTime: 60 },

  // Mais exercicios de Abdomen
  { name: 'Abdominal Infra no Banco', muscleGroup: 'abdomen', sets: 3, reps: '15-20', restTime: 45 },
  { name: 'Prancha Lateral', muscleGroup: 'abdomen', sets: 3, reps: '30-45s', restTime: 45 },
  { name: 'Mountain Climbers', muscleGroup: 'abdomen', sets: 3, reps: '30-40', restTime: 45 },

  // Mais exercicios de Cardio
  { name: 'Escada', muscleGroup: 'cardio', sets: 1, reps: '15-25min', restTime: 0 },
  { name: 'Remo Ergometro', muscleGroup: 'cardio', sets: 1, reps: '10-20min', restTime: 0 },
  { name: 'Corda', muscleGroup: 'cardio', sets: 5, reps: '1min', restTime: 30 },
  { name: 'HIIT Bike', muscleGroup: 'cardio', sets: 10, reps: '30s forte/30s leve', restTime: 0 }
];

// Treinos de exemplo
export const sampleWorkouts: Workout[] = [
  {
    id: uuidv4(),
    name: 'Peito e TrÃ­ceps',
    muscleGroup: 'peito',
    notes: 'Foco em hipertrofia com cargas moderadas',
    exercises: [
      { ...predefinedExercises[0], id: uuidv4(), completed: false },
      { ...predefinedExercises[1], id: uuidv4(), completed: false },
      { ...predefinedExercises[2], id: uuidv4(), completed: false },
      { ...predefinedExercises[16], id: uuidv4(), completed: false },
      { ...predefinedExercises[17], id: uuidv4(), completed: false }
    ],
    status: 'nao_iniciado'
  },
  {
    id: uuidv4(),
    name: 'Costas e BÃ­ceps',
    muscleGroup: 'costas',
    notes: 'Puxadas com foco na largura das costas',
    exercises: [
      { ...predefinedExercises[4], id: uuidv4(), completed: false },
      { ...predefinedExercises[5], id: uuidv4(), completed: false },
      { ...predefinedExercises[6], id: uuidv4(), completed: false },
      { ...predefinedExercises[12], id: uuidv4(), completed: false },
      { ...predefinedExercises[13], id: uuidv4(), completed: false }
    ],
    status: 'nao_iniciado'
  },
  {
    id: uuidv4(),
    name: 'Ombros e AbdÃ´men',
    muscleGroup: 'ombros',
    notes: 'Desenvolvimento com cargas progressivas',
    exercises: [
      { ...predefinedExercises[8], id: uuidv4(), completed: false },
      { ...predefinedExercises[9], id: uuidv4(), completed: false },
      { ...predefinedExercises[10], id: uuidv4(), completed: false },
      { ...predefinedExercises[32], id: uuidv4(), completed: false },
      { ...predefinedExercises[33], id: uuidv4(), completed: false }
    ],
    status: 'nao_iniciado'
  },
  {
    id: uuidv4(),
    name: 'Pernas Completo',
    muscleGroup: 'pernas',
    notes: 'Treino intenso de membros inferiores',
    exercises: [
      { ...predefinedExercises[20], id: uuidv4(), completed: false },
      { ...predefinedExercises[21], id: uuidv4(), completed: false },
      { ...predefinedExercises[22], id: uuidv4(), completed: false },
      { ...predefinedExercises[23], id: uuidv4(), completed: false },
      { ...predefinedExercises[38], id: uuidv4(), completed: false }
    ],
    status: 'nao_iniciado'
  },
  {
    id: uuidv4(),
    name: 'Full Body',
    muscleGroup: 'full_body',
    notes: 'Treino completo para todo o corpo',
    exercises: [
      { ...predefinedExercises[20], id: uuidv4(), completed: false },
      { ...predefinedExercises[0], id: uuidv4(), completed: false },
      { ...predefinedExercises[4], id: uuidv4(), completed: false },
      { ...predefinedExercises[8], id: uuidv4(), completed: false },
      { ...predefinedExercises[32], id: uuidv4(), completed: false }
    ],
    status: 'nao_iniciado'
  },
  {
    id: uuidv4(),
    name: 'Cardio e Core',
    muscleGroup: 'cardio',
    notes: 'Queima de gordura e fortalecimento do core',
    exercises: [
      { ...predefinedExercises[40], id: uuidv4(), completed: false },
      { ...predefinedExercises[32], id: uuidv4(), completed: false },
      { ...predefinedExercises[33], id: uuidv4(), completed: false },
      { ...predefinedExercises[34], id: uuidv4(), completed: false },
      { ...predefinedExercises[35], id: uuidv4(), completed: false }
    ],
    status: 'nao_iniciado'
  }
];

// Treinos semanais de exemplo
export const sampleWeeklyWorkouts: Record<string, Workout | null> = {
  segunda: sampleWorkouts[0], // Peito e TrÃ­ceps
  terca: sampleWorkouts[1],   // Costas e BÃ­ceps
  quarta: null,               // Descanso
  quinta: sampleWorkouts[2],  // Ombros e AbdÃ´men
  sexta: sampleWorkouts[3],   // Pernas
  sabado: sampleWorkouts[5],  // Cardio e Core
  domingo: null               // Descanso
};

// HistÃ³rico de peso de exemplo
export const sampleWeightHistory: WeightEntry[] = [
  { id: uuidv4(), date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), weight: 75.5, notes: 'InÃ­cio do acompanhamento' },
  { id: uuidv4(), date: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(), weight: 75.0 },
  { id: uuidv4(), date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(), weight: 74.2 },
  { id: uuidv4(), date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), weight: 73.8 },
  { id: uuidv4(), date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), weight: 73.0, notes: 'Progredindo bem!' }
];

// Perfil de exemplo
export const sampleProfile: UserProfile = {
  name: 'JoÃ£o Fitness',
  goal: 'hipertrofia',
  gender: 'masculino',
  age: 28,
  height: 178,
  initialWeight: 73.0,
  targetWeight: 75.0
};

// ConfiguraÃ§Ãµes de exemplo
export const sampleSettings: AppSettings = {
  theme: 'system',
  notifications: true,
  soundEffects: false,
  language: 'pt-BR'
};

// FunÃ§Ã£o para inicializar dados de exemplo
export function initializeMockData() {
  try {
    const hasData = localStorage.getItem('GiGaGym_profile') !== null;

    if (!hasData) {
      localStorage.setItem('GiGaGym_profile', JSON.stringify(sampleProfile));
      localStorage.setItem('GiGaGym_settings', JSON.stringify(sampleSettings));
      localStorage.setItem('GiGaGym_weekly_workouts', JSON.stringify(sampleWeeklyWorkouts));
      localStorage.setItem('GiGaGym_weight_history', JSON.stringify(sampleWeightHistory));
      localStorage.setItem('GiGaGym_custom_exercises', JSON.stringify([]));
      localStorage.setItem('GiGaGym_workout_history', JSON.stringify([]));
      localStorage.setItem(
        'GiGaGym_body_metrics',
        JSON.stringify({
          currentWeight: 73.0,
          height: 178,
          imc: 23.0,
          lastUpdated: new Date().toISOString(),
        })
      );

      console.log('Dados de exemplo inicializados!');
      return true;
    }

    return false;
  } catch (error) {
    console.warn('Nao foi possivel inicializar mock data no localStorage:', error);
    return false;
  }
}


