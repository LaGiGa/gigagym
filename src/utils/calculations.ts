// Utilitários de cálculos fitness

import type { IMCCResult, BodyFatResult, BodyMeasurements } from '@/types';

/**
 * Calcula o IMC (Índice de Massa Corporal)
 * Fórmula: peso (kg) / altura (m)²
 */
export function calculateIMC(weight: number, height: number): IMCCResult {
  // Altura em metros
  const heightInMeters = height / 100;
  const imc = weight / (heightInMeters * heightInMeters);
  const roundedIMC = Math.round(imc * 10) / 10;

  let classification: string;
  let color: string;

  if (roundedIMC < 18.5) {
    classification = 'Abaixo do peso';
    color = '#f59e0b'; // amarelo
  } else if (roundedIMC < 25) {
    classification = 'Peso normal';
    color = '#84cc16'; // verde lima
  } else if (roundedIMC < 30) {
    classification = 'Sobrepeso';
    color = '#f97316'; // laranja
  } else {
    classification = 'Obesidade';
    color = '#ef4444'; // vermelho
  }

  return {
    value: roundedIMC,
    classification,
    color
  };
}

/**
 * Calcula o percentual de gordura corporal usando a fórmula da Marinha dos EUA
 * Fórmula para homens: %G = 86.010 × log10(cintura - pescoço) - 70.041 × log10(altura) + 36.76
 * Fórmula para mulheres: %G = 163.205 × log10(cintura + quadril - pescoço) - 97.684 × log10(altura) - 78.387
 */
export function calculateBodyFat(measurements: BodyMeasurements): BodyFatResult {
  const { gender, height, neck, waist, hip } = measurements;

  let bodyFatPercentage: number;

  if (gender === 'masculino') {
    // Fórmula para homens
    bodyFatPercentage = (
      86.010 * Math.log10(waist - neck) -
      70.041 * Math.log10(height) +
      36.76
    );
  } else {
    // Fórmula para mulheres (requer medida do quadril)
    if (!hip) {
      throw new Error('Medida do quadril é obrigatória para mulheres');
    }
    bodyFatPercentage = (
      163.205 * Math.log10(waist + hip - neck) -
      97.684 * Math.log10(height) -
      78.387
    );
  }

  const roundedBodyFat = Math.round(bodyFatPercentage * 10) / 10;

  // Classificação baseada em gênero
  let classification: string;
  let color: string;

  if (gender === 'masculino') {
    if (roundedBodyFat < 6) {
      classification = 'Gordura essencial';
      color = '#3b82f6';
    } else if (roundedBodyFat < 14) {
      classification = 'Atleta';
      color = '#84cc16';
    } else if (roundedBodyFat < 18) {
      classification = 'Fitness';
      color = '#22c55e';
    } else if (roundedBodyFat < 25) {
      classification = 'Aceitável';
      color = '#f59e0b';
    } else {
      classification = 'Obesidade';
      color = '#ef4444';
    }
  } else {
    if (roundedBodyFat < 14) {
      classification = 'Gordura essencial';
      color = '#3b82f6';
    } else if (roundedBodyFat < 21) {
      classification = 'Atleta';
      color = '#84cc16';
    } else if (roundedBodyFat < 25) {
      classification = 'Fitness';
      color = '#22c55e';
    } else if (roundedBodyFat < 32) {
      classification = 'Aceitável';
      color = '#f59e0b';
    } else {
      classification = 'Obesidade';
      color = '#ef4444';
    }
  }

  return {
    value: roundedBodyFat,
    classification,
    color
  };
}

/**
 * Calcula a taxa metabólica basal (TMB) usando a fórmula de Mifflin-St Jeor
 * Homens: TMB = (10 × peso) + (6.25 × altura) - (5 × idade) + 5
 * Mulheres: TMB = (10 × peso) + (6.25 × altura) - (5 × idade) - 161
 */
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: 'masculino' | 'feminino'
): number {
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);

  if (gender === 'masculino') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  return Math.round(bmr);
}

/**
 * Calcula o gasto calórico diário total (TDEE)
 * Multiplicador de atividade:
 * - Sedentário: 1.2
 * - Levemente ativo: 1.375
 * - Moderadamente ativo: 1.55
 * - Muito ativo: 1.725
 * - Extremamente ativo: 1.9
 */
export function calculateTDEE(
  bmr: number,
  activityLevel: 'sedentario' | 'leve' | 'moderado' | 'muito' | 'extremo'
): number {
  const multipliers = {
    sedentario: 1.2,
    leve: 1.375,
    moderado: 1.55,
    muito: 1.725,
    extremo: 1.9
  };

  return Math.round(bmr * multipliers[activityLevel]);
}

/**
 * Calcula o peso ideal baseado na altura (fórmula de Devine)
 * Homens: 50 + 0.91 × (altura - 152.4)
 * Mulheres: 45.5 + 0.91 × (altura - 152.4)
 */
export function calculateIdealWeight(
  height: number,
  gender: 'masculino' | 'feminino'
): number {
  const baseWeight = gender === 'masculino' ? 50 : 45.5;
  const idealWeight = baseWeight + 0.91 * (height - 152.4);
  return Math.round(idealWeight * 10) / 10;
}

/**
 * Calcula a diferença de peso entre o atual e a meta
 */
export function calculateWeightDifference(
  currentWeight: number,
  targetWeight: number
): {
  difference: number;
  isGoalReached: boolean;
  progress: number;
} {
  const difference = currentWeight - targetWeight;
  const isGoalReached = Math.abs(difference) <= 0.5;

  // Progresso baseado na distância inicial (assumindo 10kg como referência máxima)
  const progress = Math.min(100, Math.max(0, 100 - (Math.abs(difference) / 10) * 100));

  return {
    difference: Math.round(difference * 10) / 10,
    isGoalReached,
    progress: Math.round(progress)
  };
}

/**
 * Calcula o volume total de treino (séries × repetições × peso)
 */
export function calculateWorkoutVolume(
  sets: number,
  reps: number,
  weight: number
): number {
  return sets * reps * weight;
}

/**
 * Formata o tempo de descanso em minutos e segundos
 */
export function formatRestTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}min ${remainingSeconds}s`;
}

/**
 * Formata a duração do treino
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}min`;
  }

  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Gera uma frase motivacional aleatória
 */
export function getMotivationalQuote(): string {
  const quotes = [
    '💪 Cada repetição te aproxima do seu objetivo!',
    '🔥 Disciplina supera motivação!',
    '⚡ Seu único limite é você mesmo!',
    '🏆 O progresso é melhor que a perfeição!',
    '🚀 Transforme sua dor em progresso!',
    '💯 Consistência é a chave do sucesso!',
    '⭐ Você é mais forte do que imagina!',
    '🎯 Foque no processo, não apenas no resultado!',
    '🔥 Queime suas desculpas no fogo do esforço!',
    '💪 O corpo alcança o que a mente acredita!',
    '⚡ Não pare quando estiver cansado, pare quando terminar!',
    '🏆 A dor de hoje é a força de amanhã!'
  ];

  return quotes[Math.floor(Math.random() * quotes.length)];
}

/**
 * Retorna o nome do grupo muscular em português
 */
export function getMuscleGroupName(muscleGroup: string): string {
  const names: Record<string, string> = {
    peito: 'Peito',
    costas: 'Costas',
    ombros: 'Ombros',
    biceps: 'Bíceps',
    triceps: 'Tríceps',
    pernas: 'Pernas',
    gluteos: 'Glúteos',
    panturrilha: 'Panturrilha',
    abdomen: 'Abdômen',
    cardio: 'Cardio',
    full_body: 'Full Body',
    outro: 'Outro'
  };

  return names[muscleGroup] || muscleGroup;
}

/**
 * Retorna o nome do dia da semana em português
 */
export function getDayName(day: string): string {
  const days: Record<string, string> = {
    segunda: 'Segunda-feira',
    terca: 'Terça-feira',
    quarta: 'Quarta-feira',
    quinta: 'Quinta-feira',
    sexta: 'Sexta-feira',
    sabado: 'Sábado',
    domingo: 'Domingo'
  };

  return days[day] || day;
}

/**
 * Retorna o nome do objetivo de treino
 */
export function getGoalName(goal: string): string {
  const goals: Record<string, string> = {
    emagrecimento: 'Emagrecimento',
    hipertrofia: 'Hipertrofia',
    manutencao: 'Manutenção',
    condicionamento: 'Condicionamento'
  };

  return goals[goal] || goal;
}

/**
 * Retorna o nome do objetivo de treino (Alias)
 */
export function getTrainingGoalName(goal: string): string {
  return getGoalName(goal);
}

/**
 * Retorna emoji para o grupo muscular
 */
export function getMuscleGroupEmoji(muscleGroup: string): string {
  const emojis: Record<string, string> = {
    peito: '🦾',
    costas: '🔙',
    ombros: '🤷',
    biceps: '💪',
    triceps: '🦾',
    pernas: '🦵',
    gluteos: '🍑',
    panturrilha: '🦶',
    abdomen: '🎯',
    cardio: '❤️',
    full_body: '🏋️',
    outro: '⚡'
  };

  return emojis[muscleGroup] || '💪';
}
