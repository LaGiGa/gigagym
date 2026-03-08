// Hook para gerenciamento de métricas corporais

import { useCallback, useMemo } from 'react';
import { useApp } from '@/store/AppContext';
import type { WeightEntry, BodyMeasurements, IMCCResult, BodyFatResult } from '@/types';
import { 
  calculateIMC, 
  calculateBodyFat, 
  calculateWeightDifference,
  calculateIdealWeight,
  calculateBMR
} from '@/utils/calculations';
import { v4 as uuidv4 } from 'uuid';

export function useBodyMetrics() {
  const { state, addWeightEntry, updateProfile } = useApp();

  /**
   * Adiciona uma nova entrada de peso
   */
  const addWeight = useCallback((weight: number, notes?: string) => {
    const entry: WeightEntry = {
      id: uuidv4(),
      date: new Date().toISOString(),
      weight,
      notes
    };
    addWeightEntry(entry);
    
    // Atualiza o peso atual no perfil também
    updateProfile({ initialWeight: weight });
  }, [addWeightEntry, updateProfile]);

  /**
   * Calcula o IMC atual
   */
  const getCurrentIMC = useCallback((): IMCCResult => {
    return calculateIMC(state.bodyMetrics.currentWeight, state.profile.height);
  }, [state.bodyMetrics.currentWeight, state.profile.height]);

  /**
   * Calcula o percentual de gordura
   */
  const getBodyFat = useCallback((measurements: BodyMeasurements): BodyFatResult => {
    return calculateBodyFat(measurements);
  }, []);

  /**
   * Calcula a diferença entre peso atual e meta
   */
  const getWeightProgress = useCallback(() => {
    if (!state.profile.targetWeight) {
      return null;
    }
    return calculateWeightDifference(
      state.bodyMetrics.currentWeight,
      state.profile.targetWeight
    );
  }, [state.bodyMetrics.currentWeight, state.profile.targetWeight]);

  /**
   * Calcula o peso ideal
   */
  const getIdealWeight = useCallback(() => {
    return calculateIdealWeight(state.profile.height, state.profile.gender);
  }, [state.profile.height, state.profile.gender]);

  /**
   * Calcula a taxa metabólica basal
   */
  const getBMR = useCallback(() => {
    return calculateBMR(
      state.bodyMetrics.currentWeight,
      state.profile.height,
      state.profile.age,
      state.profile.gender
    );
  }, [state.bodyMetrics.currentWeight, state.profile.height, state.profile.age, state.profile.gender]);

  /**
   * Obtém o histórico de peso ordenado por data (mais recente primeiro)
   */
  const weightHistory = useMemo(() => {
    return [...state.weightHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [state.weightHistory]);

  /**
   * Obtém o peso mais recente
   */
  const currentWeight = useMemo(() => {
    return state.bodyMetrics.currentWeight;
  }, [state.bodyMetrics.currentWeight]);

  /**
   * Obtém a variação de peso em relação ao registro anterior
   */
  const getWeightChange = useCallback(() => {
    if (weightHistory.length < 2) {
      return null;
    }
    
    const current = weightHistory[0].weight;
    const previous = weightHistory[1].weight;
    
    return {
      change: Math.round((current - previous) * 10) / 10,
      isGain: current > previous
    };
  }, [weightHistory]);

  /**
   * Obtém estatísticas do histórico de peso
   */
  const getWeightStats = useCallback(() => {
    if (weightHistory.length === 0) {
      return null;
    }

    const weights = weightHistory.map(entry => entry.weight);
    const max = Math.max(...weights);
    const min = Math.min(...weights);
    const avg = weights.reduce((sum, w) => sum + w, 0) / weights.length;
    
    const firstWeight = weights[weights.length - 1];
    const lastWeight = weights[0];
    const totalChange = Math.round((lastWeight - firstWeight) * 10) / 10;

    return {
      max,
      min,
      average: Math.round(avg * 10) / 10,
      totalChange,
      entries: weightHistory.length
    };
  }, [weightHistory]);

  /**
   * Formata o histórico para exibição em gráfico
   */
  const getChartData = useCallback(() => {
    return weightHistory
      .slice()
      .reverse()
      .map(entry => ({
        date: new Date(entry.date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short'
        }),
        weight: entry.weight,
        fullDate: entry.date
      }));
  }, [weightHistory]);

  /**
   * Atualiza a altura do usuário
   */
  const updateHeight = useCallback((height: number) => {
    updateProfile({ height });
  }, [updateProfile]);

  /**
   * Atualiza a meta de peso
   */
  const updateTargetWeight = useCallback((targetWeight: number) => {
    updateProfile({ targetWeight });
  }, [updateProfile]);

  return {
    currentWeight,
    weightHistory,
    bodyMetrics: state.bodyMetrics,
    profile: state.profile,
    addWeight,
    getCurrentIMC,
    getBodyFat,
    getWeightProgress,
    getIdealWeight,
    getBMR,
    getWeightChange,
    getWeightStats,
    getChartData,
    updateHeight,
    updateTargetWeight
  };
}
