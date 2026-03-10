// Utilitarios de armazenamento local

import type { AppState, UserProfile, AppSettings, Workout, WeightEntry, Exercise, BodyMetrics } from '@/types';

import { enrichExerciseWithSets } from './planGenerator';

const STORAGE_KEYS = {
  PROFILE: 'GiGaGym_profile',
  SETTINGS: 'GiGaGym_settings',
  WEEKLY_WORKOUTS: 'GiGaGym_weekly_workouts',
  WORKOUT_HISTORY: 'GiGaGym_workout_history',
  WEIGHT_HISTORY: 'GiGaGym_weight_history',
  BODY_METRICS: 'GiGaGym_body_metrics',
  CUSTOM_EXERCISES: 'GiGaGym_custom_exercises',
  APP_STATE: 'GiGaGym_app_state'
};


const DEFAULT_PROFILE: UserProfile = {
  name: '',
  goal: 'hipertrofia',
  gender: 'masculino',
  experienceLevel: 'iniciante',
  age: 0,
  height: 0,
  initialWeight: 0,
  targetWeight: undefined,
};

const DEFAULT_BODY_METRICS: BodyMetrics = {
  currentWeight: 0,
  height: 0,
  imc: 0,
  lastUpdated: new Date().toISOString(),
};

const DEFAULT_WEEKLY_WORKOUTS: Record<string, Workout | null> = {
  segunda: null,
  terca: null,
  quarta: null,
  quinta: null,
  sexta: null,
  sabado: null,
  domingo: null,
};
const IDB_DB_NAME = 'GiGaGym_db';
const IDB_STORE_NAME = 'kv';

function hasLocalStorage(): boolean {
  try {
    const testKey = '__GiGaGym_storage_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbSet<T>(key: string, value: T): Promise<void> {
  const db = await openIndexedDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
    tx.objectStore(IDB_STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function idbGet<T>(key: string): Promise<T | null> {
  const db = await openIndexedDB();
  const value = await new Promise<T | null>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE_NAME, 'readonly');
    const request = tx.objectStore(IDB_STORE_NAME).get(key);
    request.onsuccess = () => resolve((request.result as T) ?? null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return value;
}

async function idbDelete(key: string): Promise<void> {
  const db = await openIndexedDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
    tx.objectStore(IDB_STORE_NAME).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

/**
 * Salva dados no localStorage
 */
export function saveToStorage<T>(key: string, data: T): void {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`Erro ao salvar ${key}:`, error);
  }
}

/**
 * Recupera dados do localStorage
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) {
      return defaultValue;
    }
    return JSON.parse(serialized) as T;
  } catch (error) {
    console.error(`Erro ao recuperar ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Remove dados do localStorage
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Erro ao remover ${key}:`, error);
  }
}

/**
 * Limpa todos os dados do app
 */
export function clearAllStorage(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    removeFromStorage(key);
  });
}

export async function saveAppStatePersistent(state: AppState): Promise<void> {
  if (hasLocalStorage()) {
    saveAppState(state);
    return;
  }

  try {
    await idbSet(STORAGE_KEYS.APP_STATE, state);
  } catch (error) {
    console.error('Erro ao salvar estado no IndexedDB:', error);
  }
}

export async function getAppStatePersistent(): Promise<AppState | null> {
  if (hasLocalStorage()) {
    return getAppState();
  }

  try {
    return await idbGet<AppState>(STORAGE_KEYS.APP_STATE);
  } catch (error) {
    console.error('Erro ao recuperar estado do IndexedDB:', error);
    return null;
  }
}

export async function clearAllStoragePersistent(): Promise<void> {
  clearAllStorage();
  try {
    await idbDelete(STORAGE_KEYS.APP_STATE);
  } catch (error) {
    console.error('Erro ao limpar IndexedDB:', error);
  }
}

// Funções específicas para cada tipo de dado

export function saveProfile(profile: UserProfile): void {
  saveToStorage(STORAGE_KEYS.PROFILE, profile);
}

export function getProfile(): UserProfile | null {
  return getFromStorage<UserProfile | null>(STORAGE_KEYS.PROFILE, null);
}

export function saveSettings(settings: AppSettings): void {
  saveToStorage(STORAGE_KEYS.SETTINGS, settings);
}

export function getSettings(): AppSettings {
  const defaultSettings: AppSettings = {
    theme: 'system',
    notifications: true,
    soundEffects: false,
    language: 'pt-BR'
  };
  return getFromStorage<AppSettings>(STORAGE_KEYS.SETTINGS, defaultSettings);
}

export function saveWeeklyWorkouts(workouts: Record<string, Workout | null>): void {
  saveToStorage(STORAGE_KEYS.WEEKLY_WORKOUTS, workouts);
}

export function getWeeklyWorkouts(): Record<string, Workout | null> {
  return getFromStorage<Record<string, Workout | null>>(STORAGE_KEYS.WEEKLY_WORKOUTS, {});
}

export function saveWorkoutHistory(history: Workout[]): void {
  saveToStorage(STORAGE_KEYS.WORKOUT_HISTORY, history);
}

export function getWorkoutHistory(): Workout[] {
  return getFromStorage<Workout[]>(STORAGE_KEYS.WORKOUT_HISTORY, []);
}

export function saveWeightHistory(history: WeightEntry[]): void {
  saveToStorage(STORAGE_KEYS.WEIGHT_HISTORY, history);
}

export function getWeightHistory(): WeightEntry[] {
  return getFromStorage<WeightEntry[]>(STORAGE_KEYS.WEIGHT_HISTORY, []);
}

export function saveBodyMetrics(metrics: BodyMetrics): void {
  saveToStorage(STORAGE_KEYS.BODY_METRICS, metrics);
}

export function getBodyMetrics(): BodyMetrics | null {
  return getFromStorage<BodyMetrics | null>(STORAGE_KEYS.BODY_METRICS, null);
}

export function saveCustomExercises(exercises: Exercise[]): void {
  saveToStorage(STORAGE_KEYS.CUSTOM_EXERCISES, exercises);
}

export function getCustomExercises(): Exercise[] {
  return getFromStorage<Exercise[]>(STORAGE_KEYS.CUSTOM_EXERCISES, []);
}

/**
 * Salva o estado completo do app
 */
export function saveAppState(state: AppState): void {
  saveToStorage(STORAGE_KEYS.APP_STATE, state);
}

export function getAppState(): AppState | null {
  return getFromStorage<AppState | null>(STORAGE_KEYS.APP_STATE, null);
}


function getCurrentStateSnapshot(): AppState {
  const appState = getAppState();
  const profile = getProfile();
  const settings = getSettings();
  const weeklyWorkouts = getWeeklyWorkouts();
  const workoutHistory = getWorkoutHistory();
  const weightHistory = getWeightHistory();
  const bodyMetrics = getBodyMetrics();
  const customExercises = getCustomExercises();

  return {
    profile: appState?.profile || profile || DEFAULT_PROFILE,
    settings: appState?.settings || settings,
    weeklyWorkouts: {
      ...DEFAULT_WEEKLY_WORKOUTS,
      ...(appState?.weeklyWorkouts || weeklyWorkouts || {}),
    } as AppState['weeklyWorkouts'],
    workoutHistory: appState?.workoutHistory || workoutHistory || [],
    weightHistory: appState?.weightHistory || weightHistory || [],
    bodyMetrics: appState?.bodyMetrics || bodyMetrics || DEFAULT_BODY_METRICS,
    customExercises: appState?.customExercises || customExercises || [],
    currentPlan: appState?.currentPlan || null,
  };
}

/**
 * Exporta todos os dados para backup
 */
export function exportAllData(): string {
  const appState = getCurrentStateSnapshot();
  const data = {
    profile: appState.profile,
    settings: appState.settings,
    weeklyWorkouts: appState.weeklyWorkouts,
    workoutHistory: appState.workoutHistory,
    weightHistory: appState.weightHistory,
    bodyMetrics: appState.bodyMetrics,
    customExercises: appState.customExercises,
    currentPlan: appState.currentPlan,
    appState,
    exportDate: new Date().toISOString(),
    version: '2',
    type: 'full_backup'
  };

  return JSON.stringify(data, null, 2);
}
/**
 * Importa dados de backup
 */
export function importAllData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);

    const baseState = getCurrentStateSnapshot();
    const importedAppState = data.appState && typeof data.appState === 'object' ? data.appState : data;

    const mergedState: AppState = {
      ...baseState,
      ...importedAppState,
      profile: { ...baseState.profile, ...(importedAppState.profile || data.profile || {}) },
      settings: { ...baseState.settings, ...(importedAppState.settings || data.settings || {}) },
      weeklyWorkouts: {
        ...baseState.weeklyWorkouts,
        ...(importedAppState.weeklyWorkouts || data.weeklyWorkouts || {}),
      },
      workoutHistory: importedAppState.workoutHistory || data.workoutHistory || baseState.workoutHistory,
      weightHistory: importedAppState.weightHistory || data.weightHistory || baseState.weightHistory,
      bodyMetrics: {
        ...baseState.bodyMetrics,
        ...(importedAppState.bodyMetrics || data.bodyMetrics || {}),
      },
      customExercises: importedAppState.customExercises || data.customExercises || baseState.customExercises,
      currentPlan: importedAppState.currentPlan || data.currentPlan || baseState.currentPlan,
    };

    saveProfile(mergedState.profile);
    saveSettings(mergedState.settings);
    saveWeeklyWorkouts(mergedState.weeklyWorkouts);
    saveWorkoutHistory(mergedState.workoutHistory);
    saveWeightHistory(mergedState.weightHistory);
    saveBodyMetrics(mergedState.bodyMetrics);
    saveCustomExercises(mergedState.customExercises);
    saveAppState(mergedState);

    return true;
  } catch (error) {
    console.error('Erro ao importar dados:', error);
    return false;
  }
}
/**
 * Exporta apenas os treinos
 */
export function exportWorkoutsOnly(): string {
  const data = {
    weeklyWorkouts: getWeeklyWorkouts(),
    workoutHistory: getWorkoutHistory(),
    customExercises: getCustomExercises(),
    exportDate: new Date().toISOString(),
    type: 'workouts_only'
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Importa apenas os treinos com retrocompatibilidade
 */
export function importWorkoutsOnly(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);

    // Suporte a diferentes formatos de exportação (antigos e novos)
    const rawWorkouts = data.weeklyWorkouts || data.workouts || {};
    const history = data.workoutHistory || [];
    const custom = data.customExercises || [];

    // Função interna para "upar" exercícios antigos
    const upgradeExercise = (ex: any): Exercise => {
      return enrichExerciseWithSets(ex);
    };

    // Processar treinos semanais
    const upgradedWorkouts: Record<string, Workout | null> = {};
    Object.keys(rawWorkouts).forEach(day => {
      const w = rawWorkouts[day];
      if (w && w.exercises) {
        w.exercises = w.exercises.map(upgradeExercise);
      }
      upgradedWorkouts[day] = w;
    });

    const normalizedHistory = history.length > 0
      ? history.map((w: any) => {
          if (w.exercises) w.exercises = w.exercises.map(upgradeExercise);
          return w;
        })
      : [];
    const normalizedCustom = custom.length > 0 ? custom.map(upgradeExercise) : [];

    if (Object.keys(upgradedWorkouts).length > 0) saveWeeklyWorkouts(upgradedWorkouts);
    if (normalizedHistory.length > 0) saveWorkoutHistory(normalizedHistory);
    if (normalizedCustom.length > 0) saveCustomExercises(normalizedCustom);

    const baseState = getCurrentStateSnapshot();
    const mergedState: AppState = {
      ...baseState,
      weeklyWorkouts:
        Object.keys(upgradedWorkouts).length > 0
          ? { ...baseState.weeklyWorkouts, ...upgradedWorkouts }
          : baseState.weeklyWorkouts,
      workoutHistory: normalizedHistory.length > 0 ? normalizedHistory : baseState.workoutHistory,
      customExercises: normalizedCustom.length > 0 ? normalizedCustom : baseState.customExercises,
    };
    saveAppState(mergedState);

    return true;
  } catch (error) {
    console.error('Erro ao importar treinos:', error);
    return false;
  }
}
/**
 * Verifica se há dados salvos
 */
export function hasSavedData(): boolean {
  return localStorage.getItem(STORAGE_KEYS.PROFILE) !== null;
}

