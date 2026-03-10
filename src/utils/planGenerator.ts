import { v4 as uuidv4 } from 'uuid';
import type { SmartPlan, TrainingGoal, SpecialistSuggestion, Exercise } from '@/types';

/**
 * Gera um plano inteligente baseado no objetivo do usuário
 */
export function generateSmartPlan(goal: TrainingGoal): SmartPlan {
    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(now.getMonth() + 6); // Plano de 6 meses

    const suggestions: SpecialistSuggestion[] = [];

    // Sugestões baseadas no objetivo
    if (goal === 'emagrecimento') {
        suggestions.push({
            id: uuidv4(),
            specialistType: 'nutrologa',
            title: 'Suplementação Termogênica',
            content: 'Recomendo o uso de cafeína (200mg) e L-Carnitina antes do treino para otimizar a queima de gordura.',
            date: now.toISOString(),
        });
        suggestions.push({
            id: uuidv4(),
            specialistType: 'nutricionista',
            title: 'Déficit Calórico Estruturado',
            content: 'Foco em proteínas magras e vegetais. Reduzir carboidratos simples após as 18h.',
            date: now.toISOString(),
        });
        suggestions.push({
            id: uuidv4(),
            specialistType: 'personal',
            title: 'Foco em Gasto Calórico',
            content: 'Treinos com menor tempo de descanso e inclusão de 20 min de cardio pós-musculação.',
            date: now.toISOString(),
        });
    } else if (goal === 'hipertrofia') {
        suggestions.push({
            id: uuidv4(),
            specialistType: 'nutrologa',
            title: 'Aumento de Força',
            content: 'Considere o uso de Creatina (5g/dia) para auxiliar na explosão muscular e recuperação.',
            date: now.toISOString(),
        });
        suggestions.push({
            id: uuidv4(),
            specialistType: 'nutricionista',
            title: 'Superávit Calórico',
            content: 'Aumentar a ingestão de carboidratos complexos e manter 2g de proteína por kg de peso corporal.',
            date: now.toISOString(),
        });
        suggestions.push({
            id: uuidv4(),
            specialistType: 'personal',
            title: 'Tensão Mecânica',
            content: 'Foco em progressão de carga e execução lenta (cadência 3:1:1) nos exercícios básicos.',
            date: now.toISOString(),
        });
    }

    return {
        id: uuidv4(),
        goal,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        suggestions,
        diet: goal === 'emagrecimento' ? 'Dieta Hipocalórica' : 'Dieta Hipercalórica',
        supplementation: goal === 'emagrecimento' ? 'Kit Queima de Gordura' : 'Kit Massa Muscular',
    };
}

/**
 * Retorna instruções técnicas baseadas no exercício
 */
export function getExerciseInstructions(name: string): string[] {
    const slug = name
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '_')
        .replace(/[^\w]/g, '');

    const instructionsMap: Record<string, string[]> = {
        'supino_reto': [
            'Mantenha os calcanhares no chão e as escápulas retraídas.',
            'Desça a barra até tocar levemente o peito (altura dos mamilos).',
            'Evite travar os cotovelos no topo da subida.',
            'Inspire na descida e expire na subida (fase de esforço).'
        ],
        'agachamento': [
            'Mantenha os pés na largura dos ombros, apontados levemente para fora.',
            'Inicie o movimento pelo quadril para trás, como se fosse sentar.',
            'Mantenha o peito aberto e o olhar para frente.',
            'Desça até que as coxas fiquem pelo menos paralelas ao chão.'
        ],
        'puxada_frente': [
            'Puxe a barra em direção ao peito, não por trás do pescoço.',
            'Inicie o movimento puxando os cotovelos para baixo e para trás.',
            'Mantenha o tronco levemente inclinado para trás.',
            'Controle o retorno da barra sem deixar os ombros subirem demais.'
        ],
        'rosca_direta': [
            'Mantenha os cotovelos colados ao tronco durante todo o movimento.',
            'Evite balançar o corpo para usar o embalo (mantenha o core firme).',
            'Execute a amplitude total, descendo até quase esticar o braço.',
            'Foque na contração do bíceps no topo do movimento.'
        ],
        'crucifixo': [
            'Mantenha uma leve flexão nos cotovelos (como se abraçasse um barril).',
            'Abra os braços até sentir o alongamento do peitonal.',
            'Não deixe os pesos baterem um no outro no topo do movimento.',
            'Mantenha as escápulas grudadas no banco.'
        ]
    };

    return instructionsMap[slug] || [
        'Mantenha a execução controlada e o foco no músculo alvo.',
        'Controle a fase excêntrica (descida) para maximizar o estímulo.',
        'Respire de forma rítmica, evitando a apneia.',
        'Mantenha a postura e a coluna alinhada durante todo o set.'
    ];
}

/**
 * Retorna uma URL de GIF baseada no nome do exercício (usando DB pública)
 */
export function getExerciseMedia(name: string): string {
    // ... existing getExerciseMedia code
    const slug = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^\w]/g, '');

    // Lista de mapeamento para nomes comuns em português para o inglês do BD
    const mapping: Record<string, string> = {
        'supino_reto': 'bench_press',
        'supino_inclinado': 'inclined_bench_press',
        'agachamento': 'squat',
        'levantamento_terra': 'deadlift',
        'rosca_direta': 'biceps_curl',
        'triceps_pulley': 'triceps_pushdown',
        'puxada_frente': 'lat_pulldown',
        'remada_curvada': 'bent_over_row',
        'leg_press': 'leg_press',
        'extensora': 'leg_extension',
        'flexora': 'leg_curl',
        'desenvolvimento': 'shoulder_press',
        'elevacao_lateral': 'lateral_raise',
    };

    const apiKeyName = mapping[slug] || slug;

    // Usando uma estrutura conhecida do Github que contém GIFs de exercícios
    // Formato: https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/[Name]/0.gif
    // Nota: Como não temos a lista completa, tentamos um padrão de Capitalize_Space
    const formalName = apiKeyName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('_');

    return `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${formalName}/0.gif`;
}

/**
 * Gera exercícios com a estrutura de logs de séries
 */
export function enrichExerciseWithSets(exercise: Omit<Exercise, 'id'>): Exercise {
    const setsCount = Number(exercise.sets) || 3;
    const repsVal = parseInt(exercise.reps) || 12;

    const sets_log = Array.from({ length: setsCount }).map(() => ({
        id: uuidv4(),
        reps: repsVal,
        weight: 0,
        completed: false
    }));

    return {
        ...exercise,
        id: uuidv4(),
        sets_log,
        videoUrl: exercise.videoUrl || getExerciseMedia(exercise.name),
        instructions: exercise.instructions && exercise.instructions.length > 0
            ? exercise.instructions
            : getExerciseInstructions(exercise.name),
        completed: false
    };
}
